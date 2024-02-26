import React, { useState, useContext } from "react";
import { NFTMarketplaceContext } from "../Context/nftMarketPlace";

const PinataUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [cid, setCid] = useState();
  const [collectionName, setCollectionName] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(1);
  const { mintToken } = useContext(NFTMarketplaceContext);

  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZGEwYTM0My04ODE1LTQ4MGItODY1MS1iYmEwZDM5NGJjNzAiLCJlbWFpbCI6ImhhcnNocmFkYWRpeWE5OTk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJiMDgzYzhkZGY1NmFlY2RlM2RkOCIsInNjb3BlZEtleVNlY3JldCI6IjgxNjA0NDc5OWU4ZjNlZDdhNWFjZDVlNzg5MWY5ZTc5YzY0NGZkOTE1OTNkZmQzZjk0N2FlZDJhZmE5ZjkxYWIiLCJpYXQiOjE3MDg0MjE5NTV9.iDahta8xiKAG48oE5GZ5w6xgJodBDQlBIY9Z6hgyD-o";

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const metadata = JSON.stringify({
        name: tokenName,
        // Additional metadata can be appended here if necessary
      });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });
      const resData = await res.json();
      const imageUri = `https://ipfs.io/ipfs/${resData.IpfsHash}`;
      setCid(imageUri);
      console.log("CID = ", imageUri);

      // Optionally, mint a token here
      // await mintToken(tokenName, imageUri, amount);

      // Generate and download JSON file with dynamic content
      generateAndDownloadJson(tokenName, description, imageUri);
    } catch (error) {
      console.error(error);
    }
  };

  const generateAndDownloadJson = (name, description, imageUri) => {
    const jsonContent = {
      name,
      description,
      image: imageUri,
    };

    const jsonString = JSON.stringify(jsonContent, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const fileUrl = URL.createObjectURL(blob);

    // Create a temporary anchor to programmatically click for download
    const downloadLink = document.createElement("a");
    downloadLink.href = fileUrl;
    downloadLink.setAttribute("download", `${name}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      <label className="form-label">Choose File</label>
      <input type="file" onChange={changeHandler} />
      <div>
        <label htmlFor="tokenName">Token Name:</label>
        <input
          id="tokenName"
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="Enter token name"
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          required
        />
      </div>
      <div>
        <label htmlFor="amount">Amount:</label>
        <input
          id="amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          required
        />
      </div>
      <button onClick={handleSubmission}>Submit</button>
      {cid && <img src={cid} alt="Uploaded to IPFS" />}
    </div>
  );
};

export default PinataUpload;
