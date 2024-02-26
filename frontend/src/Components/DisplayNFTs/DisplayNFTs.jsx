import React, { useState, useEffect, useContext } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";

const DisplayNFTs = ({ selectedCollection, tokenIds }) => {
  const { getTokenURI } = useContext(NFTMarketplaceContext);
  const [tokenURIs, setTokenURIs] = useState();
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
          return { tokenIds, uri };
        } catch (error) {
          console.error(`Error fetching URI for token ${tokenIds}:`, error);
          return { tokenId: tokenIds.toString(), uri: "Error fetching URI" };
        }
      } catch (err) {
        console.error("Error fetching token URIs:", err);
        setError("Failed to fetch token URIs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenURIs();
  }, [selectedCollection, tokenIds]);

  return (
    <div>
      {isLoading && <p>Loading token URIs...</p>}
      {error && <p>Error: {error}</p>}
      <h3>Token ID: {tokenIds}</h3>
      <p>
        URI:{" "}
        <a href={tokenURIs} target="_blank" rel="noopener noreferrer">
          {tokenURIs}
        </a>
      </p>
    </div>
  );
};

export default DisplayNFTs;
