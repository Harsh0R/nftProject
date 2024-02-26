import React, { useState, useContext, useEffect } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import MintNFT from "../MintNfts/MintNFT";
import DisplayNFTs from "../DisplayNFTs/DisplayNFTs";

function CreateCollection() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const {
    createCollection,
    fetchMyCollections,
    account,
    myCollections,
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

  return (
    <div>
      <h2>Create New Collection</h2>
      <form onSubmit={handleCreateCollection}>
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
        <button type="submit">Create Collection</button>
      </form>
      <div>
        <h3>My Collections</h3>
        {myCollections.length > 0 ? (
          <ul>
            {myCollections.map((collection, index) => (
              <li key={index} onClick={() => setSelectedCollection(collection)}>
                Collection ID: {collection}
              </li>
            ))}
          </ul>
        ) : (
          <p>No collections found.</p>
        )}
      </div>
      {selectedCollection && <MintNFT collection={selectedCollection} />}
      <div>
        <h3>Token URIs in Selected Collection</h3>
        {getTokenIdsOfCollection.length > 0 &&
          getTokenIdsOfCollection.map((tokenId, index) => (
            <div
              key={index}
              onClick={() => getTokenURI(selectedCollection, tokenId)}
            >
              <DisplayNFTs
                selectedCollection={selectedCollection}
                tokenIds={tokenId}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default CreateCollection;
