import React, { useContext, useEffect, useState } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import { ethers } from "ethers";

const GetAllListedToken = () => {
  const { getAllListedTokens, buyToken, account , setPurchasedCollections , purchasedCollections , getMyPurchasedTokens} = useContext(
    NFTMarketplaceContext
  );
  const [listings, setListings] = useState([]);
  const [purchaseCollections, setPurchaseCollections] = useState([])

  useEffect(() => {
    const fetchListedTokens = async () => {
      const data = await getAllListedTokens();
      if (data) {
        const [
          listingIds,
          sellers,
          collectionAddresses,
          tokenIds,
          prices,
          quantities,
        ] = data;

        const formattedListings = listingIds.map((id, index) => ({
          id: id.toString(),
          seller: sellers[index],
          collectionAddress: collectionAddresses[index],
          tokenId: tokenIds[index].toString(),
          price: ethers.utils.formatUnits(prices[index], "ether"),
          quantity: quantities[index].toString(),
          inputQuantity: 1, // Initial input quantity set to 1
          destinationCollection: "", // Add a field for destination collection address
        }));
        setListings(formattedListings);
      }
    };

    fetchListedTokens();
  }, []);

  const handleQuantityChange = (index, value) => {
    setListings((currentListings) =>
      currentListings.map((listing, idx) =>
        idx === index
          ? { ...listing, inputQuantity: Math.max(1, value) }
          : listing
      )
    );
  };

  const buyThisToken = async (
    listingId,
    inputQuantity,
    pricePerToken,
    collectionAddress
  ) => {
    try {
      // console.log("Price per token === ", listingId);
      const totalCost = inputQuantity * parseFloat(pricePerToken);
      // console.log("Total price=== ", totalCost);
      await buyToken(
        listingId,
        inputQuantity,
        totalCost
      );
      console.log("Purchase successful", collectionAddress);
      setPurchaseCollections(prevState => [...prevState, collectionAddress]);
      
    } catch (error) {
      console.error("Purchase failed: ", error.message);
    }
  };
  
  console.log("Buy collection ::=== " , purchasedCollections);
  return (
    <div>
      <h2>Listed Tokens</h2>
      {listings.length > 0 ? (
        <ul>
          {listings.map((listing, index) => (
            <li key={listing.id}>
              List Id = {listing.id}
              <br />
              Seller: {listing.seller}
              <br />
              Collection Address: {listing.collectionAddress}
              <br />
              Token ID: {listing.tokenId}
              <br />
              Price: {listing.price} ETH
              <br />
              Available Quantity: {listing.quantity}
              <br />
              Quantity:{" "}
              <input
                type="number"
                value={listing.inputQuantity}
                onChange={(e) =>
                  handleQuantityChange(index, parseInt(e.target.value, 10))
                }
                min="1"
                max={listing.quantity}
              />
              <br />
              Total Price:{" "}
              {(listing.inputQuantity * parseFloat(listing.price)).toFixed(
                4
              )}{" "}
              ETH
              <br />
              {listing.seller.toLowerCase() !== account.toLowerCase() ? (
                <button
                  onClick={() =>
                    buyThisToken(
                      listing.id,
                      listing.inputQuantity,
                      listing.price,
                      listing.collectionAddress,
                    )
                  }
                >
                  Buy This Token
                </button>
              ) : (
                <button disabled>You are the seller</button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div>No listings found.</div>
      )}
    </div>
  );
};

export default GetAllListedToken;
