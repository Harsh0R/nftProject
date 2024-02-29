import React, { useContext, useEffect, useState } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import Style from "./GetAllListedToken.module.css";
import { ethers } from "ethers";
import DisplayNFTs from "../DisplayNFTs/DisplayNFTs";
import GetOnlyPic from "../GetOnlyPic/GetOnlyPic";

const GetAllListedToken = () => {
  const { getAllListedTokens, buyToken, account, purchasedCollections } = useContext(
    NFTMarketplaceContext
  );
  const [listings, setListings] = useState([]);
  const [purchaseCollections, setPurchaseCollections] = useState([]);

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
          inputQuantity: 1,
          destinationCollection: "",
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
          ? { ...listing, inputQuantity: Math.min(Math.max(1, value), listing.quantity) }
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
      const totalCost = inputQuantity * parseFloat(pricePerToken);
      await buyToken(
        listingId,
        inputQuantity,
        totalCost
      );
      setPurchaseCollections(prevState => [...prevState, collectionAddress]);
    } catch (error) {
      console.error("Purchase failed: ", error.message);
    }
  };

  return (
    <div className={Style.container}>
      <h2 className={Style.title}>Listed Tokens</h2>
      {listings.length > 0 ? (
        <ul>
          {listings.map((listing, index) => (
            <li key={listing.id} className={Style.listItem}>
              <span className={Style.listId}>List Id:</span> {listing.id}
              <br />
              Seller: {listing.seller}
              <br />
              Collection Address: {listing.collectionAddress}
              <br />
              <GetOnlyPic
                selectedCollection={listing.collectionAddress}
                tokenIds={listing.tokenId}
              />
              <br />
              Token ID: {listing.tokenId}
              <br />
              Price: <span className={Style.price}>{listing.price} ETH</span>
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
                className={Style.quantityInput}
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
                  className={Style.button}
                >
                  Buy This Token
                </button>
              ) : (
                <button disabled className={Style.disabledButton}>You are the seller</button>
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
