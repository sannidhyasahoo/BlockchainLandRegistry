// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LandRegistry
 * @dev Trust-Based Escrow Governance for land deeds on Polygon.
 *
 *  Status flow:
 *    MintPending ─(approveAndMint)─▶ Active
 *    Active ─(recordTrust)─▶ TrustRecorded
 *    TrustRecorded ─(depositFunds)─▶ FundsLocked
 *    FundsLocked ─(confirmFunds)─▶ AwaitingFinal
 *    AwaitingFinal ─(finalizeTransfer)─▶ Sold
 *
 *    Any non-Sold ─(toggleFreeze)─▶ Frozen
 *    Frozen ─(toggleFreeze)─▶ (previous status restored as Active)
 */
contract LandRegistry is ERC721URIStorage, AccessControl {

    // ─── ROLES ───────────────────────────────────────────────────
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    // ─── STATUS ENUM ─────────────────────────────────────────────
    enum Status {
        MintPending,    // 0  Request submitted, not yet minted
        Active,         // 1  NFT minted, available for sale
        TrustRecorded,  // 2  Seller verified buyer (physical meeting)
        FundsLocked,    // 3  Buyer deposited POL into escrow
        AwaitingFinal,  // 4  Seller confirmed, waiting for registrar
        Sold,           // 5  Transfer complete
        Frozen          // 6  Registrar froze this property
    }

    // ─── STRUCTS ─────────────────────────────────────────────────
    struct Property {
        uint256 price;
        Status  status;
        address seller;
        address potentialBuyer;
        bool    trustRecorded;
        bool    sellerConfirmed;
        uint256 escrow;
        bool    frozen;
    }

    struct MintRequest {
        address seller;
        string  uri;
        uint256 price;
        bool    isPending;
    }

    // ─── STATE ───────────────────────────────────────────────────
    mapping(uint256 => Property) public properties;
    mapping(uint256 => MintRequest) public mintRequests;

    uint256 private _nextTokenId;
    uint256 public  nextRequestId;

    // ─── EVENTS ──────────────────────────────────────────────────
    event MintRequested(uint256 indexed requestId, address indexed seller, uint256 price, string uri);
    event PropertyMinted(uint256 indexed tokenId, address indexed seller, uint256 price, string uri);
    event TrustRecordedEvent(uint256 indexed tokenId, address indexed seller, address indexed buyer);
    event FundsDeposited(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event SellerConfirmed(uint256 indexed tokenId, address indexed seller);
    event TransferFinalized(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    event PropertyFrozen(uint256 indexed tokenId, bool frozen);

    // ─── MODIFIERS ───────────────────────────────────────────────
    modifier isNotFrozen(uint256 tokenId) {
        require(!properties[tokenId].frozen, "LandRegistry: property is frozen");
        _;
    }

    // ─── CONSTRUCTOR ─────────────────────────────────────────────
    constructor() ERC721("LandDeed", "LND") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    // ═════════════════════════════════════════════════════════════
    //  STAGE 1 — MINT REQUEST & APPROVAL
    // ═════════════════════════════════════════════════════════════

    /// @notice Citizen submits a mint request with IPFS metadata and price.
    function requestMint(string memory uri, uint256 price) external {
        require(price > 0, "LandRegistry: price must be > 0");
        require(bytes(uri).length > 0, "LandRegistry: URI cannot be empty");

        uint256 requestId = nextRequestId++;
        mintRequests[requestId] = MintRequest({
            seller: msg.sender,
            uri: uri,
            price: price,
            isPending: true
        });

        emit MintRequested(requestId, msg.sender, price, uri);
    }

    /// @notice Registrar verifies documents and mints the NFT.
    function approveAndMint(uint256 requestId) external onlyRole(REGISTRAR_ROLE) {
        MintRequest storage req = mintRequests[requestId];
        require(req.isPending, "LandRegistry: request not pending");

        req.isPending = false;

        uint256 tokenId = _nextTokenId++;
        _safeMint(req.seller, tokenId);
        _setTokenURI(tokenId, req.uri);

        properties[tokenId] = Property({
            price:           req.price,
            status:          Status.Active,
            seller:          req.seller,
            potentialBuyer:  address(0),
            trustRecorded:   false,
            sellerConfirmed: false,
            escrow:          0,
            frozen:          false
        });

        emit PropertyMinted(tokenId, req.seller, req.price, req.uri);
    }

    // ═════════════════════════════════════════════════════════════
    //  STAGE 2 — PHYSICAL TRUST
    // ═════════════════════════════════════════════════════════════

    /// @notice Seller records that they have physically met the buyer.
    function recordTrust(uint256 tokenId, address buyerAddress)
        external
        isNotFrozen(tokenId)
    {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.Active, "LandRegistry: not Active");
        require(msg.sender == prop.seller, "LandRegistry: only seller");
        require(buyerAddress != address(0), "LandRegistry: zero buyer");
        require(buyerAddress != prop.seller, "LandRegistry: cannot trust self");

        prop.potentialBuyer = buyerAddress;
        prop.trustRecorded  = true;
        prop.status         = Status.TrustRecorded;

        emit TrustRecordedEvent(tokenId, msg.sender, buyerAddress);
    }

    // ═════════════════════════════════════════════════════════════
    //  STAGE 3 — ESCROW
    // ═════════════════════════════════════════════════════════════

    /// @notice Designated buyer deposits the exact POL price into escrow.
    function depositFunds(uint256 tokenId)
        external
        payable
        isNotFrozen(tokenId)
    {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.TrustRecorded, "LandRegistry: not TrustRecorded");
        require(msg.sender == prop.potentialBuyer, "LandRegistry: not designated buyer");
        require(msg.value == prop.price, "LandRegistry: send exact price");

        prop.escrow = msg.value;
        prop.status = Status.FundsLocked;

        emit FundsDeposited(tokenId, msg.sender, msg.value);
    }

    /// @notice Seller confirms they are ready (e.g. ready to vacate).
    function confirmFunds(uint256 tokenId)
        external
        isNotFrozen(tokenId)
    {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.FundsLocked, "LandRegistry: not FundsLocked");
        require(msg.sender == prop.seller, "LandRegistry: only seller");

        prop.sellerConfirmed = true;
        prop.status          = Status.AwaitingFinal;

        emit SellerConfirmed(tokenId, msg.sender);
    }

    // ═════════════════════════════════════════════════════════════
    //  STAGE 4 — FINALIZE
    // ═════════════════════════════════════════════════════════════

    /// @notice Registrar finalizes: NFT to buyer, POL to seller.
    function finalizeTransfer(uint256 tokenId)
        external
        onlyRole(REGISTRAR_ROLE)
        isNotFrozen(tokenId)
    {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.AwaitingFinal, "LandRegistry: not AwaitingFinal");
        require(prop.trustRecorded, "LandRegistry: trust not recorded");
        require(prop.sellerConfirmed, "LandRegistry: seller not confirmed");
        require(prop.escrow == prop.price, "LandRegistry: escrow mismatch");

        address seller = prop.seller;
        address buyer  = prop.potentialBuyer;
        uint256 amount = prop.escrow;

        // Effects before interactions
        prop.status = Status.Sold;
        prop.escrow = 0;

        // Transfer NFT
        _transfer(seller, buyer, tokenId);

        // Release funds to seller
        (bool success, ) = payable(seller).call{value: amount}("");
        require(success, "LandRegistry: POL transfer failed");

        emit TransferFinalized(tokenId, seller, buyer, amount);
    }

    // ═════════════════════════════════════════════════════════════
    //  REGISTRAR FREEZE / UNFREEZE
    // ═════════════════════════════════════════════════════════════

    /// @notice Registrar toggles freeze on a property.
    function toggleFreeze(uint256 tokenId) external onlyRole(REGISTRAR_ROLE) {
        Property storage prop = properties[tokenId];
        require(prop.status != Status.Sold, "LandRegistry: cannot freeze sold");

        if (prop.frozen) {
            // Unfreeze → restore to Active
            prop.frozen = false;
            prop.status = Status.Active;
            // Reset trust state so flow restarts
            prop.potentialBuyer  = address(0);
            prop.trustRecorded   = false;
            prop.sellerConfirmed = false;

            // Refund buyer if funds were locked
            if (prop.escrow > 0) {
                address buyerToRefund = prop.potentialBuyer;
                uint256 refundAmount  = prop.escrow;
                prop.escrow = 0;
                if (buyerToRefund != address(0) && refundAmount > 0) {
                    (bool ok, ) = payable(buyerToRefund).call{value: refundAmount}("");
                    require(ok, "LandRegistry: refund failed");
                }
            }
        } else {
            prop.frozen = true;
            prop.status = Status.Frozen;
        }

        emit PropertyFrozen(tokenId, prop.frozen);
    }

    // ═════════════════════════════════════════════════════════════
    //  VIEW HELPERS
    // ═════════════════════════════════════════════════════════════

    function getProperty(uint256 tokenId)
        external
        view
        returns (
            uint256 price,
            Status  status,
            address seller,
            address potentialBuyer,
            bool    trustRecorded,
            bool    sellerConfirmed,
            uint256 escrow,
            bool    frozen
        )
    {
        Property storage p = properties[tokenId];
        return (
            p.price,
            p.status,
            p.seller,
            p.potentialBuyer,
            p.trustRecorded,
            p.sellerConfirmed,
            p.escrow,
            p.frozen
        );
    }

    function totalProperties() external view returns (uint256) {
        return _nextTokenId;
    }

    // ═════════════════════════════════════════════════════════════
    //  REQUIRED OVERRIDES
    // ═════════════════════════════════════════════════════════════

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}