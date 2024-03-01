import React, { useState, useEffect, useContext } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import { useNavigate } from "react-router-dom";

const GetOnlyPic = ({ selectedCollection, tokenIds }) => {

    const { getTokenURI, getOwnedTokens } = useContext(NFTMarketplaceContext);
    const [tokenURIs, setTokenURIs] = useState();
    const [tokenBalance, setTokenBalance] = useState();
    const [tokenData, setTokenData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchTokenURIs = async () => {
        if (!selectedCollection || !tokenIds) {
          setTokenURIs();
          return;
        }
  
        setIsLoading(true);
        setError("");
  
        try {
          const uri = await getTokenURI(selectedCollection, tokenIds);
          setTokenURIs(uri);
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error("Failed to fetch token data");
          }
          const data = await response.json();
          setTokenData(data);
          const tokanAndBalance = await getOwnedTokens(
            selectedCollection,
            tokenIds
          );
          setTokenBalance(tokanAndBalance);
          return { tokenIds, uri };
        } catch (error) {
          console.error(`Error fetching URI for token ${tokenIds}:`, error);
          return { tokenId: tokenIds.toString(), uri: "Error fetching URI" };
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchTokenURIs();
    }, [selectedCollection, tokenIds]);
    
  return (
    <div>  
    {isLoading && <p>Loading token data...</p>}
    {error && <p>Error: {error}</p>}
    {tokenData && (
      <>
        <img
        width={350}
          src={tokenData.image}
          alt="NFT"
        />
      </>
    )}
  </div>
  )
}

export default GetOnlyPic