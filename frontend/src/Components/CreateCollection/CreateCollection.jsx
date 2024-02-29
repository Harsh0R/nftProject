import React, { useState, useContext, useEffect } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import MintNFT from "../MintNfts/MintNFT";
import DisplayNFTs from "../DisplayNFTs/DisplayNFTs";
import styles from "./CreateCollection.module.css";

function CreateCollection() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [tokenURIs, setTokenURIs] = useState([]);
  const {
    createCollection,
    fetchMyCollections,
    account,
    myCollections,
    myCollectionsName,
    myCollectionsSymbol,
    getTokenIds,
    getTokenURI,
    getTokenIdsOfCollection,
  } = useContext(NFTMarketplaceContext);

  useEffect(() => {
    if (account) {
      fetchMyCollections(account);
    }
  }, [account, fetchMyCollections]);

  useEffect(() => {
    if (selectedCollection) {
      getTokenIds(selectedCollection);
    }
  }, [selectedCollection, getTokenIds]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      await createCollection(name, symbol, "");
      setName("");
      setSymbol("");
      alert("Collection created successfully.");
      if (account) {
        fetchMyCollections(account); // Refresh collections after creation
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleTokenURI = async (tokenId) => {
    const uri = await getTokenURI(selectedCollection, tokenId);
    setTokenURIs([...tokenURIs, uri]);
  };

  return (
    <div className={styles.container1}>
      <h2>Create New Collection</h2>
      <form onSubmit={handleCreateCollection} className={styles.formcontainer}>
        <div>
          <label htmlFor="name">Collection Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter collection name"
            required
          />
        </div>
        <div>
          <label htmlFor="symbol">Collection Symbol:</label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter collection symbol"
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>Create Collection</button>
      </form>
      <div className={styles.collectionsContainer}>
        <h3>My Collections</h3>
        <div className={styles.collectionBoxes}>
          {myCollections.length > 0 ? (
            myCollections.map((collection, index) => (
              <div key={index} onClick={() => setSelectedCollection(collection)} className={styles.collectionBox}>
                <div className={styles.collectionInfo}>
                  <div>Collection Name: {myCollectionsName[index]}</div>
                  <div>Collection Symbol: {myCollectionsSymbol[index]}</div>
                </div>
              </div>
            ))
          ) : (
            <p>No collections found.</p>
          )}
        </div>
      </div>
      {selectedCollection && <MintNFT collection={selectedCollection} />}
      <div className={styles.tokenuriscontainer}>
        <h3>Token in Selected Collection</h3>
        <div className={styles.tokenBoxContainer}>
          {getTokenIdsOfCollection.length > 0 &&
            getTokenIdsOfCollection.map((tokenId, index) => (
              <div
                key={index}
                className={styles.tokenBox}
                onClick={() => handleTokenURI(tokenId)}
              >
                <DisplayNFTs
                  selectedCollection={selectedCollection}
                  tokenIds={tokenId}
                />
              </div>
            ))

          }
          {tokenURIs.map((uri, index) => (
            <div key={index} className={styles.tokenBox}>{uri}</div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default CreateCollection;
