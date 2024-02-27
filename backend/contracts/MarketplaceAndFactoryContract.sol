// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CollectionContract.sol";

contract MarketplaceAndFactoryContract is ReentrancyGuard, ERC1155Holder {
    address[] public collections;
    mapping(address => address[]) private _collectionsByOwner;

    mapping(uint256 => Listing) public listings;
    uint256 private _listingIdCounter = 0;

    struct Listing {
        address seller;
        address collectionAddress;
        uint256 tokenId;
        uint256 price;
        uint256 quantity;
    }
    struct PurchaseDetail {
        uint256 listingId;
        uint256 tokenId;
        uint256 quantity;
        uint256 price;
        uint256 timestamp;
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

    mapping(address => PurchaseDetail[]) private purchases;

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
        _collectionsByOwner[msg.sender].push(address(newCollection));
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
        require(
            IERC1155(collectionAddress).isApprovedForAll(
                msg.sender,
                address(this)
            ),
            "Marketplace not approved to manage tokens"
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
        require(quantity > 0, "Quantity must be positive");
        require(listing.quantity >= quantity, "Not enough tokens available");
        uint256 totalPrice = listing.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        IERC1155(listing.collectionAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId,
            quantity,
            ""
        );
        payable(listing.seller).transfer(totalPrice);
        listing.quantity -= quantity;
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        purchases[msg.sender].push(
            PurchaseDetail({
                listingId: listingId,
                tokenId: listing.tokenId,
                quantity: quantity,
                price: listing.price,
                timestamp: block.timestamp
            })
        );

        emit Purchase(listingId, msg.sender, quantity);
    }

    function getMyPurchases() public view returns (PurchaseDetail[] memory) {
        return purchases[msg.sender];
    }

    function getOwnedTokens(
        address collectionAddress,
        address owner
    ) public view returns (uint256[] memory, uint256[] memory) {
        CollectionContract collection = CollectionContract(collectionAddress);
        uint256[] memory tokenIds = collection.getTokenIds(); 
        uint256[] memory ownedAmounts = new uint256[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            ownedAmounts[i] = collection.balanceOf(owner, tokenIds[i]);
        }

        return (tokenIds, ownedAmounts);
    }

    function getCollectionsByOwner(
        address owner
    ) public view returns (address[] memory) {
        return _collectionsByOwner[owner];
    }

    function getAllCollections() public view returns (address[] memory) {
        return collections;
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
}
