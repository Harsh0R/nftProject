// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    struct PurchasedToken {
        address buyer;
        address collectionAddress;
        uint256 tokenId;
    }

    mapping(address => PurchasedToken[]) private _purchasedTokensByBuyer;

    event TokenPurchased(
        address indexed buyer,
        address indexed collectionAddress
    );
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

    function buyToken(uint256 listingId, uint256 quantity) public payable {
        Listing storage listing = listings[listingId];
        require(msg.value >= listing.price * quantity, "Insufficient payment");
        require(listing.quantity >= quantity, "Not enough tokens available");

        // Transfer tokens to the target collection
        IERC1155(listing.collectionAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId,
            quantity,
            ""
        );

        // Transfer payment to the seller
        payable(listing.seller).transfer(msg.value);
        listing.quantity -= quantity;
        // Emit event for token purchase
        emit TokenPurchased(msg.sender, listing.collectionAddress);

        // Store purchased token information
        _purchasedTokensByBuyer[msg.sender].push(
            PurchasedToken(
                msg.sender,
                listing.collectionAddress,
                listing.tokenId
            )
        );
    }

    function getAllListedTokens()
        public
        view
        returns (
            uint256[] memory listingIds,
            address[] memory sellers,
            address[] memory collectionAddresses,
            uint256[] memory tokenIds,
            uint256[] memory prices,
            uint256[] memory quantities
        )
    {
        uint256 totalListings = _listingIdCounter;
        listingIds = new uint256[](totalListings);
        sellers = new address[](totalListings);
        collectionAddresses = new address[](totalListings);
        tokenIds = new uint256[](totalListings);
        prices = new uint256[](totalListings);
        quantities = new uint256[](totalListings);

        for (uint256 i = 0; i < totalListings; i++) {
            uint256 currentId = i + 1;
            Listing storage listing = listings[currentId];
            listingIds[i] = currentId;
            sellers[i] = listing.seller;
            collectionAddresses[i] = listing.collectionAddress;
            tokenIds[i] = listing.tokenId;
            prices[i] = listing.price;
            quantities[i] = listing.quantity;
        }
    }

    // New function to get collections by owner
    function getCollectionsByOwner(
        address owner
    ) public view returns (address[] memory) {
        return _collectionsByOwner[owner];
    }

    // Optional: Function to get all collections
    function getAllCollections() public view returns (address[] memory) {
        return collections;
    }

    function getMyPurchasedTokens(
        address buyer
    ) public view returns (PurchasedToken[] memory) {
        return _purchasedTokensByBuyer[buyer];
    }
}
