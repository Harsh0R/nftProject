import React, { createContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  marketplaceContractAddress,
  nftMarketPlaceABI,
  CollectionContractABI,
} from "./constants";
export const NFTMarketplaceContext = createContext();

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// const marketplaceContractAddress = "0x46bB0520E1e9aC1203a8064C5fE569D3496D2C5f";
const marketplaceContract = new ethers.Contract(
  marketplaceContractAddress,
  nftMarketPlaceABI,
  signer
);

export const NFTMarketplaceProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [myCollections, setMyCollections] = useState([]); // State to hold user's collections
  const [getTokenIdsOfCollection, setGetTokenIdsOfCollection] = useState([]);
  const [tokenUri, setTokenUri] = useState();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await provider.send("eth_requestAccounts", []);
        const signerAddress = await signer.getAddress();
        setAccount(signerAddress);

        window.ethereum.on("accountsChanged", (accounts) => {
          setAccount(accounts[0]);
          fetchMyCollections(accounts[0]); // Fetch collections for the new account
        });

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        fetchMyCollections(signerAddress); // Initial fetch for the current account
      } else {
        console.log("Ethereum object not found. Please install MetaMask.");
      }
    };

    init();
  }, []);

  const createCollection = async (name, symbol, uri) => {
    try {
      const tx = await marketplaceContract.createCollection(name, symbol, uri);
      await tx.wait();
      console.log(`Collection ${name} created successfully.`);
      console.log(`Collection created successfully.`, tx.hash);
      fetchMyCollections(account); // Refresh collections after creating a new one
      return tx.hash;
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const fetchMyCollections = useCallback(
    async (userAccount) => {
      if (!marketplaceContract) return;
      try {
        // Assuming your contract has a getCollectionsByOwner function
        const collections = await marketplaceContract.getCollectionsByOwner(
          userAccount
        );
        setMyCollections(collections.map((collection) => collection));
        // console.log("use Acc== :::", collections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    },
    [marketplaceContract, account]
  ); // Re-run when account changes

  const mintToken = async (collectionAddress, amount, tokenUri) => {
    try {
      const collectionContractInstance = new ethers.Contract(
        collectionAddress,
        CollectionContractABI,
        signer
      );
      console.log("accont = :: ==", account);
      const tx = await collectionContractInstance.mintToken(
        account,
        amount,
        tokenUri
      );
      await tx.wait();
      console.log("Token minted successfully.");
    } catch (error) {
      console.error("Error minting token:", error);
    }
  };

  const getTokenIds = async (collectionAddress) => {
    try {
      const collectionContractInstance = new ethers.Contract(
        collectionAddress,
        CollectionContractABI,
        signer
      );
      const tokenIds = await collectionContractInstance.getTokenIds();
      // Convert the BigNumber array to a string array for easier handling
      const tokenIdsStr = tokenIds.map((id) => id.toNumber());
      setGetTokenIdsOfCollection(tokenIdsStr); // Assuming you have a state setter for storing the token IDs
      return getTokenIdsOfCollection;
      // console.log("Got token IDs of this collection successfully:", tokenIdsStr);
    } catch (error) {
      console.error("Error getting token IDs from collection:", error);
    }
  };

  const getTokenURI = async (collectionAddress, tokenId) => {
    try {
      const collectionContractInstance = new ethers.Contract(
        collectionAddress,
        CollectionContractABI,
        signer
      );
      // console.log("accont = :: ==", account);
      const tx = await collectionContractInstance.getTokenURI(tokenId);
      // await tx.wait();
      setTokenUri(tx);
      // console.log("get token URI of this Collection successfully.", tx);
      return tx;
    } catch (error) {
      console.error("Error to get token URI from collection =:= ", error);
    }
  };

  const listToken = async (
    collectionId,
    tokenId,
    price,
    quantity,
  ) => {
    try {
      const tx = await marketplaceContract.listToken(
        collectionId,
        tokenId,
        ethers.utils.parseEther(price.toString()),
        quantity,
      );
      await tx.wait();
      console.log("Token listed successfully.");
    } catch (error) {
      console.error("Error listing token:", error);
    }
  };

  const buyToken = async (listingId, quantity, price) => {
    try {
      const tx = await marketplaceContract.buyToken(listingId, quantity, {
        value: ethers.utils.parseEther(price.toString()),
      });
      await tx.wait();
      console.log("Token bought successfully.");
    } catch (error) {
      console.error("Error buying token:", error);
    }
  };

  // More functions as per your contract's capabilities can be added here

  // const uploadMetadata = async (metadata) => {
  //   const { name, description, image, attributes, external_url } = metadata;

  //   // Upload the image file to IPFS
  //   const imageFormData = new FormData();
  //   imageFormData.append("file", image);
  //   const imageUploadResponse = await fetch(
  //     "https://api.pinata.cloud/pinning/pinFileToIPFS",
  //     {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${PINATA_JWT}`,
  //       },
  //       body: imageFormData,
  //     }
  //   );

  //   if (!imageUploadResponse.ok) {
  //     throw new Error("Image upload to IPFS failed.");
  //   }

  //   const imageUploadResult = await imageUploadResponse.json();
  //   const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUploadResult.IpfsHash}`;

  //   // Create metadata JSON
  //   const metadataJson = {
  //     name,
  //     description,
  //     image: imageUrl,
  //     attributes,
  //     external_url,
  //   };

  //   // Convert metadata JSON to Blob for upload
  //   const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
  //     type: "application/json",
  //   });
  //   const metadataFormData = new FormData();
  //   metadataFormData.append("file", metadataBlob, "metadata.json");

  //   // Upload the metadata JSON to IPFS
  //   const metadataUploadResponse = await fetch(
  //     "https://api.pinata.cloud/pinning/pinFileToIPFS",
  //     {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${PINATA_JWT}`,
  //       },
  //       body: metadataFormData,
  //     }
  //   );

  //   if (!metadataUploadResponse.ok) {
  //     throw new Error("Metadata upload to IPFS failed.");
  //   }

  //   const metadataUploadResult = await metadataUploadResponse.json();
  //   return `https://gateway.pinata.cloud/ipfs/${metadataUploadResult.IpfsHash}`;
  // };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        account,
        createCollection,
        mintToken,
        listToken,
        buyToken,
        fetchMyCollections,
        myCollections,
        getTokenIds,
        getTokenURI,
        getTokenIdsOfCollection,
        tokenUri,
        // uploadMetadata,
        // Add other values and functions as needed
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
