import React, { useState, useContext } from "react";
import { NFTMarketplaceContext } from "../../Context/nftMarketPlace";
import Style from "./MintNFT.module.css"
import { ethers } from "ethers";

const MintNFT = ({ collection }) => {

  // console.log("Collection = ",collection);
  const [selectedFile, setSelectedFile] = useState();
  const [jsonUri, setJsonUri] = useState(""); // To store JSON metadata URI after upload
  const [tokenName, setTokenName] = useState(""); // To specify a unique name for the token
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(1);
  const [isReadyToMint, setIsReadyToMint] = useState(false); // To control minting action availability
  const [royaltyPercentage, setRoyaltyPercentage] = useState("");
  const { mintToken } = useContext(NFTMarketplaceContext);

  const allowedRoyalties = [5, 10, 15, 20, 25, 30, 35, 40];

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleRoyaltyChange = (event) => {
    setRoyaltyPercentage(event.target.value);
  };

  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZGEwYTM0My04ODE1LTQ4MGItODY1MS1iYmEwZDM5NGJjNzAiLCJlbWFpbCI6ImhhcnNocmFkYWRpeWE5OTk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJiMDgzYzhkZGY1NmFlY2RlM2RkOCIsInNjb3BlZEtleVNlY3JldCI6IjgxNjA0NDc5OWU4ZjNlZDdhNWFjZDVlNzg5MWY5ZTc5YzY0NGZkOTE1OTNkZmQzZjk0N2FlZDJhZmE5ZjkxYWIiLCJpYXQiOjE3MDg0MjE5NTV9.iDahta8xiKAG48oE5GZ5w6xgJodBDQlBIY9Z6hgyD-o";

  const uploadToPinata = async (file, isJson = false) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload to Pinata");
    }
    return await response.json();
  };

  const handleSubmission = async () => {
    try {
      const imageData = await uploadToPinata(selectedFile);
      const imageUri = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

      // Include collection name, token name, description, and image URL in the JSON metadata
      const jsonMetadata = JSON.stringify({
        name: tokenName,
        description: description,
        image: imageUri,
        attributes: {
          rarity: "common",
          edition: "1 of 1",
        },
        externalLinks: [],
        royalties: [{
          percentage: royaltyPercentage
        }],
        totalSupply: amount,
      });
      const jsonBlob = new Blob([jsonMetadata], { type: "application/json" });
      const jsonFile = new File([jsonBlob], "metadata.json", {
        type: "application/json",
      });

      const jsonResData = await uploadToPinata(jsonFile, true);
      setJsonUri(`https://gateway.pinata.cloud/ipfs/${jsonResData.IpfsHash}`);

      setIsReadyToMint(true); // Enable minting after successful upload
    } catch (error) {
      console.error("Error during file upload:", error);
      setIsReadyToMint(false); // Ensure minting is disabled on error
    }
  };

  const handleMint = async () => {
    if (!isReadyToMint) {
      console.error("The asset is not ready for minting.");
      return;
    }
    try {
      await mintToken(collection, amount, jsonUri , royaltyPercentage);
      console.log("NFT minted successfully.");
    } catch (error) {
      console.error("Error during NFT minting:", error);
    }
  };

  return (
    <div className={Style.container}>
      <h2 className={Style.title}>{collection}</h2>
      <input
        type="file"
        className={Style.fileInput}
        onChange={changeHandler}
      />
      <input
        type="text"
        placeholder="Token Name"
        value={tokenName}
        onChange={(e) => setTokenName(e.target.value)}
        className={Style.input}
      />
      <input
        type="text"
        placeholder="Token Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={Style.input}
      />
      <select
        value={royaltyPercentage}
        onChange={handleRoyaltyChange}
        className={Style.input}
      >
        <option value="">Select Royalty Percentage</option>
        {allowedRoyalties.map((percentage) => (
          <option key={percentage} value={percentage}>
            {percentage}%
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount"
        min="1"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value, 10))}
        className={Style.input}
      />
      <button onClick={handleSubmission} className={Style.button}>
        Upload Files
      </button>
      {isReadyToMint && (
        <>
          <button onClick={handleMint} className={Style.button}>
            Mint NFT
          </button>
          <div className={Style.metadataUrl}>
            Metadata IPFS URL:{" "}
            <a
              href={jsonUri}
              target="_blank"
              rel="noopener noreferrer"
              className={Style.link}
            >
              {jsonUri}
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default MintNFT;
