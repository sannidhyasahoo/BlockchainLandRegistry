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
    bytes32 public constant TENANT_ROLE = keccak256("TENANT_ROLE");

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

    struct LeaseInfo {
        address tenant;
        uint256 expiry;
        uint256 rent;
        bool    isApproved;
    }

    struct Partnership {
        address[] partners;
        uint256[] sharePercentages;
        bool      isActive;
    }

    struct DisputeInfo {
        string reason;
        string courtOrderIPFS;
    }

    // ─── STATE ───────────────────────────────────────────────────
    mapping(uint256 => Property) public properties;
    mapping(uint256 => MintRequest) public mintRequests;
    mapping(uint256 => DisputeInfo) public disputes;
    
    mapping(uint256 => LeaseInfo) public leases;
    mapping(uint256 => Partnership) public partnerships;
    mapping(uint256 => mapping(address => bool)) public partnerApprovals;

    uint256 private _nextTokenId;
    uint256 public  nextRequestId;
    bool    public  isDemoMode = false;

    // ─── EVENTS ──────────────────────────────────────────────────
    event MintRequested(uint256 indexed requestId, address indexed seller, uint256 price, string uri);
    event PropertyMinted(uint256 indexed tokenId, address indexed seller, uint256 price, string uri);
    event TrustEstablished(uint256 indexed tokenId, address indexed seller, address indexed buyer);
    event FundsLocked(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event SellerConfirmed(uint256 indexed tokenId, address indexed seller);
    event OwnershipTransferred(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    event PropertyFrozen(uint256 indexed tokenId, string reason, string courtOrderIPFS);
    event PropertyUnfrozen(uint256 indexed tokenId);
    event LeaseInitiated(uint256 indexed tokenId, address indexed tenant, uint256 rent, uint256 durationDays);
    event LeaseApproved(uint256 indexed tokenId, address indexed tenant, uint256 expiry);
    event PartnershipCreated(uint256 indexed tokenId, address[] partners, uint256[] percentages);
    event PartnershipTrustVoted(uint256 indexed tokenId, address partner, address buyer);

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

    /// @notice Admin can toggle demo mode to bypass wallet restrictions for demonstrations
    function setDemoMode(bool _enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isDemoMode = _enabled;
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

    /// @notice Seller or Partners record that they have physically met the buyer.
    function recordTrust(uint256 tokenId, address buyerAddress)
        external
        isNotFrozen(tokenId)
    {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.Active, "LandRegistry: not Active");
        require(buyerAddress != address(0), "LandRegistry: zero buyer");
        if (!isDemoMode) {
            require(buyerAddress != prop.seller, "LandRegistry: cannot trust self");
        }

        bool isApproved = false;

        if (partnerships[tokenId].isActive) {
            // Partnership logic: Check if sender is a partner and record vote
            bool isPartner = false;
            Partnership storage p = partnerships[tokenId];
            uint256 approvals = 0;

            for (uint256 i = 0; i < p.partners.length; i++) {
                if (p.partners[i] == msg.sender) isPartner = true;
                if (partnerApprovals[tokenId][p.partners[i]]) approvals++;
            }
            
            require(isPartner || isDemoMode, "LandRegistry: not a partner");
            
            // Only count if they haven't voted yet
            if (!partnerApprovals[tokenId][msg.sender]) {
                partnerApprovals[tokenId][msg.sender] = true;
                approvals++; 
            }

            emit PartnershipTrustVoted(tokenId, msg.sender, buyerAddress);

            // Require >50% votes (for a 2-person, means 2 out of 2)
            uint256 percentage = (approvals * 100) / p.partners.length;
            if (percentage > 50 || isDemoMode) {
                isApproved = true;
            } else {
                if (prop.potentialBuyer == address(0)) {
                   prop.potentialBuyer = buyerAddress;
                }
                return; // Return early, waiting for more votes
            }
        } else {
            // Sole owner logic
            require(msg.sender == prop.seller || isDemoMode, "LandRegistry: only seller");
            isApproved = true;
        }

        if (isApproved) {
            prop.potentialBuyer = buyerAddress;
            prop.trustRecorded  = true;
            prop.status         = Status.TrustRecorded;

            emit TrustEstablished(tokenId, prop.seller, buyerAddress);
        }
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
        require(msg.sender == prop.potentialBuyer || isDemoMode, "LandRegistry: not designated buyer");
        require(msg.value == prop.price, "LandRegistry: send exact price");

        prop.escrow = msg.value;
        prop.status = Status.FundsLocked;

        emit FundsLocked(tokenId, msg.sender, msg.value);
    }

    /// @notice Seller confirms they are ready (e.g. ready to vacate).
    function confirmFunds(uint256 tokenId)
        external
        isNotFrozen(tokenId)
    {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.FundsLocked, "LandRegistry: not FundsLocked");
        require(msg.sender == prop.seller || isDemoMode, "LandRegistry: only seller");

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

        // Release funds
        if (partnerships[tokenId].isActive) {
            Partnership memory p = partnerships[tokenId];
            for (uint i = 0; i < p.partners.length; i++) {
                uint256 shareAmount = (amount * p.sharePercentages[i]) / 100;
                if (shareAmount > 0) {
                    (bool success, ) = payable(p.partners[i]).call{value: shareAmount}("");
                    require(success, "LandRegistry: POL partnership transfer failed");
                }
            }
        } else {
            (bool success, ) = payable(seller).call{value: amount}("");
            require(success, "LandRegistry: POL transfer failed");
        }

        emit OwnershipTransferred(tokenId, seller, buyer, amount);
    }

    // ═════════════════════════════════════════════════════════════
    //  REGISTRAR FREEZE / UNFREEZE
    // ═════════════════════════════════════════════════════════════

    /// @notice Registrar freezes a property with a reason and court order.
    function freezeProperty(uint256 tokenId, string calldata reason, string calldata courtOrderIPFS) external onlyRole(REGISTRAR_ROLE) {
        Property storage prop = properties[tokenId];
        require(prop.status != Status.Sold, "LandRegistry: cannot freeze sold");
        require(!prop.frozen, "LandRegistry: already frozen");

        prop.frozen = true;
        prop.status = Status.Frozen;
        disputes[tokenId] = DisputeInfo({
            reason: reason,
            courtOrderIPFS: courtOrderIPFS
        });

        emit PropertyFrozen(tokenId, reason, courtOrderIPFS);
    }

    /// @notice Registrar unfreezes a property, resetting it to Active and refunding escrow.
    function unfreezeProperty(uint256 tokenId) external onlyRole(REGISTRAR_ROLE) {
        Property storage prop = properties[tokenId];
        require(prop.frozen, "LandRegistry: not frozen");

        prop.frozen = false;
        prop.status = Status.Active;
        delete disputes[tokenId]; // Clear dispute info

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

        emit PropertyUnfrozen(tokenId);
    }

    // ═════════════════════════════════════════════════════════════
    //  HACKATHON MODULES (LEASE & PARTNERSHIPS)
    // ═════════════════════════════════════════════════════════════

    /// @notice Initiates a lease, transferring rent from tenant up-front.
    function initiateLease(uint256 tokenId, address tenant, uint256 durationDays) external payable isNotFrozen(tokenId) {
        Property storage prop = properties[tokenId];
        require(prop.status == Status.Active, "LandRegistry: property not active");
        require(msg.sender == prop.seller || isDemoMode, "LandRegistry: only seller can lease");
        require(tenant != address(0), "LandRegistry: invalid tenant");
        require(msg.value > 0, "LandRegistry: rent must be > 0");
        
        uint256 expiry = block.timestamp + (durationDays * 1 days);
        leases[tokenId] = LeaseInfo({
            tenant: tenant,
            expiry: expiry,
            rent: msg.value,
            isApproved: false
        });

        emit LeaseInitiated(tokenId, tenant, msg.value, durationDays);
    }

    /// @notice Registrar approves lease, granting the TENANT_ROLE and releasing rent to the seller
    function approveLease(uint256 tokenId) external onlyRole(REGISTRAR_ROLE) isNotFrozen(tokenId) {
        LeaseInfo storage lease = leases[tokenId];
        require(lease.tenant != address(0), "LandRegistry: no lease found");
        require(!lease.isApproved, "LandRegistry: already approved");
        
        Property storage prop = properties[tokenId];

        lease.isApproved = true;
        _grantRole(TENANT_ROLE, lease.tenant);

        // Forward rent to seller. If partnership, split it.
        if (partnerships[tokenId].isActive) {
            Partnership memory p = partnerships[tokenId];
            for (uint i = 0; i < p.partners.length; i++) {
                uint256 shareAmount = (lease.rent * p.sharePercentages[i]) / 100;
                if (shareAmount > 0) {
                    (bool success, ) = payable(p.partners[i]).call{value: shareAmount}("");
                    require(success, "LandRegistry: Lease partnership transfer failed");
                }
            }
        } else {
            (bool success, ) = payable(prop.seller).call{value: lease.rent}("");
            require(success, "LandRegistry: rent transfer failed");
        }

        emit LeaseApproved(tokenId, lease.tenant, lease.expiry);
    }

    /// @notice Demo function to instantly create a 50/50 partnership
    function createPartnership(uint256 tokenId, address partner2) external isNotFrozen(tokenId) {
        Property storage prop = properties[tokenId];
        require(msg.sender == prop.seller || isDemoMode, "LandRegistry: only seller");
        require(partner2 != address(0), "LandRegistry: invalid partner");
        require(!partnerships[tokenId].isActive, "LandRegistry: partnership exists");

        address[] memory p = new address[](2);
        p[0] = prop.seller;
        p[1] = partner2;

        uint256[] memory s = new uint256[](2);
        s[0] = 50;
        s[1] = 50;

        partnerships[tokenId] = Partnership({
            partners: p,
            sharePercentages: s,
            isActive: true
        });

        emit PartnershipCreated(tokenId, p, s);
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

    function getPartnership(uint256 tokenId) external view returns (address[] memory partners, uint256[] memory sharePercentages, bool isActive) {
        Partnership storage p = partnerships[tokenId];
        return (p.partners, p.sharePercentages, p.isActive);
    }

    function getLease(uint256 tokenId) external view returns (address tenant, uint256 expiry, uint256 rent, bool isApproved) {
        LeaseInfo storage l = leases[tokenId];
        return (l.tenant, l.expiry, l.rent, l.isApproved);
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