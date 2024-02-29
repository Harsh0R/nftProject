import React, { useState, useEffect, useContext } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import { useNavigate } from "react-router-dom";
import styles from "./DisplayNFTs.module.css";

const DisplayNFTs = ({ selectedCollection, tokenIds }) => {
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
    <div className={styles.container}>
      {isLoading && <p>Loading token data...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}
      {tokenData && (
        <>
          <h3 className={styles.heading}>Token ID: {tokenIds}</h3>
          <p className={styles.text}>Name: {tokenData.name}</p>
          <img
            src={tokenData.image}
            alt="NFT"
            className={styles.image}
          />
          <p className={styles.text}>Your Balance: {tokenBalance}</p>
          <button
            onClick={() =>
              navigate(`/listNfts/${selectedCollection}/${tokenIds}`)
            }
            className={styles.button}
          >
            List this token for sell
          </button>
        </>
      )}
    </div>
  );
};

export default DisplayNFTs;
