// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LandRegistry
 * @dev A blockchain-based land registry system implementing:
 *      - ERC721 NFTs representing property deeds
 *      - Role-Based Access Control (RBAC) for Registrar authority
 *      - A Legal Escrow State Machine for secure transfers
 *      - Dispute resolution capability
 */
contract LandRegistry is ERC721URIStorage, AccessControl {

    // ─────────────────────────────────────────────────────────────
    //  ROLES
    // ─────────────────────────────────────────────────────────────

    /// @dev Only this role can mint properties, approve transfers, and dispute
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    // ─────────────────────────────────────────────────────────────
    //  STATE MACHINE ENUM
    // ─────────────────────────────────────────────────────────────

    enum Status {
        Active,    // Property is listed; available for purchase
        Pending,   // Buyer has deposited funds into escrow
        Sold,      // Transfer complete; ownership moved
        Disputed   // Registrar has frozen the property
    }

    // ─────────────────────────────────────────────────────────────
    //  DATA STRUCTURES
    // ─────────────────────────────────────────────────────────────

    struct Property {
        uint256 price;       // Listed price in wei (MATIC/POL)
        Status  status;      // Current state of the property
        address seller;      // Address of the current NFT holder
        address buyer;       // Address of the prospective buyer (set on deposit)
        uint256 escrow;      // Exact amount held in escrow for this token
    }

    /// @dev tokenId => Property
    mapping(uint256 => Property) public properties;

    /// @dev Auto-incrementing token ID counter
    uint256 private _nextTokenId;

    // ─────────────────────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────────────────────

    event PropertyMinted(uint256 indexed tokenId, address indexed seller, uint256 price, string uri);
    event PurchaseStarted(uint256 indexed tokenId, address indexed buyer, uint256 amountDeposited);
    event TransferApproved(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    event PropertyDisputed(uint256 indexed tokenId, string reason);
    event DisputeResolved(uint256 indexed tokenId);

    // ─────────────────────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Deploys the contract and grants REGISTRAR_ROLE to the deployer.
     *      The deployer becomes the de-facto government registrar.
     */
    constructor() ERC721("LandDeed", "LND") {
        // Grant DEFAULT_ADMIN_ROLE so the deployer can manage roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant REGISTRAR_ROLE to the deployer (the land registry authority)
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    // ─────────────────────────────────────────────────────────────
    //  REGISTRAR FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Mint a new property NFT and list it for sale.
     * @dev Only callable by a Registrar. The NFT is minted to the seller.
     * @param seller  The wallet address of the property owner
     * @param uri     IPFS URI pointing to the property's legal metadata
     * @param price   The listing price in wei
     */
    function mintProperty(
        address seller,
        string memory uri,
        uint256 price
    ) external onlyRole(REGISTRAR_ROLE) {
        require(seller != address(0), "LandRegistry: seller is zero address");
        require(price > 0,           "LandRegistry: price must be > 0");
        require(bytes(uri).length > 0, "LandRegistry: URI cannot be empty");

        uint256 tokenId = _nextTokenId++;
        _safeMint(seller, tokenId);
        _setTokenURI(tokenId, uri);

        properties[tokenId] = Property({
            price:  price,
            status: Status.Active,
            seller: seller,
            buyer:  address(0),
            escrow: 0
        });

        emit PropertyMinted(tokenId, seller, price, uri);
    }

    /**
     * @notice Approve the finalised legal transfer of a property NFT.
     * @dev Only callable by a Registrar after verifying off-chain documents.
     *      Transfers the NFT to the buyer and releases escrowed MATIC to the seller.
     * @param tokenId The ID of the property NFT
     */
    function approveTransfer(uint256 tokenId) external onlyRole(REGISTRAR_ROLE) {
        Property storage prop = properties[tokenId];

        // Security Constraints (Task B)
        require(prop.status == Status.Pending,            "LandRegistry: property not in Pending state");
        require(prop.buyer  != address(0),                "LandRegistry: no buyer registered");
        require(address(this).balance >= prop.escrow,     "LandRegistry: insufficient contract balance");
        require(prop.escrow == prop.price,                "LandRegistry: escrow mismatch with listed price");

        address seller = prop.seller;
        address buyer  = prop.buyer;
        uint256 amount = prop.escrow;

        // Update state BEFORE external calls (Checks-Effects-Interactions)
        prop.status = Status.Sold;
        prop.escrow = 0;

        // Transfer the NFT deed from seller to buyer
        _transfer(seller, buyer, tokenId);

        // Release escrowed funds to the seller
        (bool success, ) = payable(seller).call{value: amount}("");
        require(success, "LandRegistry: MATIC transfer to seller failed");

        emit TransferApproved(tokenId, seller, buyer, amount);
    }

    /**
     * @notice Freeze a property due to a legal dispute.
     * @dev Only the Registrar can dispute/unfreeze. Funds remain locked in escrow.
     * @param tokenId The ID of the property NFT
     * @param reason  A short description of the dispute reason (for event log)
     */
    function disputeProperty(uint256 tokenId, string calldata reason)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        Property storage prop = properties[tokenId];
        require(
            prop.status == Status.Active || prop.status == Status.Pending,
            "LandRegistry: cannot dispute a Sold property"
        );
        prop.status = Status.Disputed;
        emit PropertyDisputed(tokenId, reason);
    }

    /**
     * @notice Resolve a dispute and restore the property to Active status.
     * @dev Refunds any escrowed buyer funds before clearing the dispute.
     * @param tokenId The ID of the disputed property NFT
     */
    function resolveDispute(uint256 tokenId) external onlyRole(REGISTRAR_ROLE) {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.Disputed, "LandRegistry: property is not disputed");

        address buyerToRefund = prop.buyer;
        uint256 refundAmount  = prop.escrow;

        // Reset escrow state
        prop.status = Status.Active;
        prop.buyer  = address(0);
        prop.escrow = 0;

        // Refund the buyer if they had deposited funds
        if (buyerToRefund != address(0) && refundAmount > 0) {
            (bool success, ) = payable(buyerToRefund).call{value: refundAmount}("");
            require(success, "LandRegistry: refund to buyer failed");
        }

        emit DisputeResolved(tokenId);
    }

    // ─────────────────────────────────────────────────────────────
    //  BUYER FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Start the purchase process by depositing the exact price into escrow.
     * @dev This moves the property into the Pending state.
     *      The Registrar must then verify documents off-chain and call approveTransfer.
     * @param tokenId The ID of the property NFT to purchase
     */
    function startPurchase(uint256 tokenId) external payable {
        Property storage prop = properties[tokenId];

        require(prop.status == Status.Active,        "LandRegistry: property is not available");
        require(msg.value  == prop.price,            "LandRegistry: send exact listed price");
        require(msg.sender != prop.seller,           "LandRegistry: seller cannot buy own property");
        require(msg.sender != address(0),            "LandRegistry: zero address buyer");

        prop.status = Status.Pending;
        prop.buyer  = msg.sender;
        prop.escrow = msg.value;

        emit PurchaseStarted(tokenId, msg.sender, msg.value);
    }

    // ─────────────────────────────────────────────────────────────
    //  VIEW HELPERS
    // ─────────────────────────────────────────────────────────────

    /// @notice Returns the full property details for a given tokenId
    function getProperty(uint256 tokenId)
        external
        view
        returns (
            uint256 price,
            Status  status,
            address seller,
            address buyer,
            uint256 escrow
        )
    {
        Property storage prop = properties[tokenId];
        return (prop.price, prop.status, prop.seller, prop.buyer, prop.escrow);
    }

    /// @notice Returns total number of minted properties
    function totalProperties() external view returns (uint256) {
        return _nextTokenId;
    }

    // ─────────────────────────────────────────────────────────────
    //  REQUIRED OVERRIDES
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev ERC721URIStorage and AccessControl both define supportsInterface.
     *      This override resolves the conflict.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}