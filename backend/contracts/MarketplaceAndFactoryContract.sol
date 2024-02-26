// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CollectionContract.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract MarketplaceAndFactoryContract is ReentrancyGuard {
    address[] public collections; // Stores all collection addresses
    mapping(address => address[]) private _collectionsByOwner; // Maps an owner to their collections

    mapping(uint256 => Listing) public listings;
    uint256 private _listingIdCounter = 0;

    struct Listing {
        address seller;
        address collectionAddress;
        uint256 tokenId;
        uint256 price;
        uint256 quantity;
    }

    event CollectionCreated(
        address indexed owner,
        address collectionAddress,
        string name,
        string symbol
    );
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address collectionAddress,
        uint256 tokenId,
        uint256 quantity,
        uint256 price
    );
    event Purchase(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 quantity
    );

    function createCollection(
        string memory name,
        string memory symbol,
        string memory uri
    ) public {
        CollectionContract newCollection = new CollectionContract(
            name,
            symbol,
            uri
        );
        newCollection.transferOwnership(msg.sender);
        collections.push(address(newCollection));
        _collectionsByOwner[msg.sender].push(address(newCollection)); // Track collection by owner
        emit CollectionCreated(
            msg.sender,
            address(newCollection),
            name,
            symbol
        );
    }

    function listToken(
        address collectionAddress,
        uint256 tokenId,
        uint256 quantity,
        uint256 price
    ) public {
        require(quantity > 0, "Quantity must be greater than zero");
        require(price > 0, "Price must be specified");

        // Check if the sender owns the token and has enough quantity to list
        require(
            IERC1155(collectionAddress).balanceOf(msg.sender, tokenId) >=
                quantity,
            "Insufficient token balance to list"
        );

        // Check if the sender is approved to transfer the tokens on behalf of the owner
        require(
            IERC1155(collectionAddress).isApprovedForAll(
                msg.sender,
                address(this)
            ),
            "Marketplace not approved to manage seller's tokens"
        );

        _listingIdCounter++;
        listings[_listingIdCounter] = Listing(
            msg.sender,
            collectionAddress,
            tokenId,
            price,
            quantity
        );
        emit ListingCreated(
            _listingIdCounter,
            msg.sender,
            collectionAddress,
            tokenId,
            quantity,
            price
        );
    }

    function buyToken(uint256 listingId, uint256 quantity)
        public
        payable
        nonReentrant
    {
        Listing storage listing = listings[listingId];
        require(msg.value >= listing.price * quantity, "Insufficient payment");
        require(listing.quantity >= quantity, "Not enough tokens available");

        IERC1155(listing.collectionAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId,
            quantity,
            ""
        );
        payable(listing.seller).transfer(msg.value);
        listing.quantity -= quantity;

        emit Purchase(listingId, msg.sender, quantity);
    }

    function getOwnedTokens(address collectionAddress, address owner)
        public
        view
        returns (uint256[] memory, uint256[] memory)
    {
        CollectionContract collection = CollectionContract(collectionAddress);
        // Assume you have a way to get a list of token IDs for the collection
        uint256[] memory tokenIds = collection.getTokenIds(); // You need to implement this in CollectionContract
        uint256[] memory ownedAmounts = new uint256[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            ownedAmounts[i] = collection.balanceOf(owner, tokenIds[i]);
        }  

        return (tokenIds, ownedAmounts);
    }

    // New function to get collections by owner
    function getCollectionsByOwner(address owner)
        public
        view
        returns (address[] memory)
    {
        return _collectionsByOwner[owner];
    }

    // Optional: Function to get all collections
    function getAllCollections() public view returns (address[] memory) {
        return collections;
    }
}
