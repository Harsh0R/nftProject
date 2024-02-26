import React, { useState, useEffect, useContext } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";

const DisplayNFTs = ({ selectedCollection, tokenIds }) => {
  const { getTokenURI } = useContext(NFTMarketplaceContext);
  const [tokenURIs, setTokenURIs] = useState();
  const [tokenData, setTokenData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Data === ", selectedCollection, tokenIds);
    const fetchTokenURIs = async () => {
      if (!selectedCollection || !tokenIds) {
        setTokenURIs();
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        try {
          const uri = await getTokenURI(selectedCollection, tokenIds);
          console.log(`Fetched URI for token ${tokenIds}: ${uri}`); // Debugging log
          setTokenURIs(uri);
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error("Failed to fetch token data");
          }
          const data = await response.json();
          // console.log("Fetched data:", data);
          setTokenData(data);
          return { tokenIds, uri };
        } catch (error) {
          console.error(`Error fetching URI for token ${tokenIds}:`, error);
          return { tokenId: tokenIds.toString(), uri: "Error fetching URI" };
        }
      } catch (err) {
        // console.error("Error fetching token URIs:", err);
        setError("Failed to fetch token URIs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenURIs();
  }, [selectedCollection, tokenIds]);

  // console.log("data = ",tokenData);
  return (
    <div>
      {isLoading && <p>Loading token data...</p>}
      {error && <p>Error: {error}</p>}
      {tokenData && (
        <>
          <h3>Token ID: {tokenIds}</h3>
          <p>Name: {tokenData.name}</p>
          <p>Description: {tokenData.description}</p>
          <img src={tokenData.image} alt="NFT" style={{ maxWidth: "300px" }} />
          <p>Rarity: {tokenData.attributes.rarity}</p>
          <p>Edition: {tokenData.attributes.edition}</p>
          <p>Total Supply: {tokenData.totalSupply}</p>
        </>
      )}
    </div>
  );
};

export default DisplayNFTs;
