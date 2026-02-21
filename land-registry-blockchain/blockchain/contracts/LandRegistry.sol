// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is ERC721, Ownable {
    
    struct Property {
        uint256 price;
        address currentOwner;
        bool isForSale;
        bool isFrozen; 
        string ipfsMetadata; // Link to deed/docs
    }

    // Database mapping Property ID to its details
    mapping(uint256 => Property) public properties;
    // Escrow mapping Property ID to the Buyer's address who deposited funds
    mapping(uint256 => address) public pendingBuyers;

    // The Registrar is the initial owner of the contract
    constructor() ERC721("ProgrammableLand", "LAND") Ownable(msg.sender) {}

    // Modifier to block transactions if the property is under a legal dispute
    modifier notFrozen(uint256 _id) {
        require(!properties[_id].isFrozen, "Property is currently frozen due to dispute");
        _;
    }

    // 1. REGISTRAR: Mint a new property NFT
    function mintProperty(address _to, uint256 _id, string memory _uri) external onlyOwner {
        require(_ownerOf(_id) == address(0), "Property already exists");
        _safeMint(_to, _id);
        properties[_id] = Property(0, _to, false, false, _uri);
    }

    // 2. SELLER: List the property for sale
    function listProperty(uint256 _id, uint256 _price) external notFrozen(_id) {
        require(ownerOf(_id) == msg.sender, "You do not own this property");
        properties[_id].isForSale = true;
        properties[_id].price = _price;
    }

    // 3. BUYER: Deposit funds into Escrow
    function initiatePurchase(uint256 _id) external payable notFrozen(_id) {
        require(properties[_id].isForSale, "Property is not for sale");
        require(msg.value == properties[_id].price, "Incorrect payment amount");
        require(pendingBuyers[_id] == address(0), "Another buyer is already pending");
        
        pendingBuyers[_id] = msg.sender;
    }

    // 4. REGISTRAR: Approve the sale, release funds to seller, and transfer NFT to buyer
    function approveTransfer(uint256 _id) external onlyOwner notFrozen(_id) {
        address buyer = pendingBuyers[_id];
        require(buyer != address(0), "No pending buyer");
        
        address seller = ownerOf(_id);
        uint256 salePrice = properties[_id].price;
        
        // Reset property status before transfer to prevent reentrancy attacks
        properties[_id].isForSale = false;
        properties[_id].price = 0;
        properties[_id].currentOwner = buyer;
        delete pendingBuyers[_id];

        // Transfer funds to seller
        payable(seller).transfer(salePrice);
        
        // Transfer NFT to buyer
        _transfer(seller, buyer, _id);
    }

    // 5. REGISTRAR: Freeze a property in case of fraud or dispute
    function toggleFreeze(uint256 _id) external onlyOwner {
        properties[_id].isFrozen = !properties[_id].isFrozen;
    }
}