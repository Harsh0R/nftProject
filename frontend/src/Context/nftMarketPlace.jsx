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
  const [purchasedCollections, setPurchasedCollections] = useState([]);


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
      // console.log(`Collection ${name} created successfully.`);
      // console.log(`Collection created successfully.`, tx.hash);
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
        const collections = await marketplaceContract.getCollectionsByOwner(
          userAccount
        );
        setMyCollections(collections.map((collection) => collection));
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    },
    [marketplaceContract, account]
  );
  const mintToken = async (collectionAddress, amount, tokenUri) => {
    try {
      const collectionContractInstance = new ethers.Contract(
        collectionAddress,
        CollectionContractABI,
        signer
      );
      // console.log("accont = :: ==", account);
      const tx = await collectionContractInstance.mintToken(
        account,
        amount,
        tokenUri
      );
      await tx.wait();
      // console.log("Token minted successfully.");
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
      const tokenIdsStr = tokenIds.map((id) => id.toNumber());
      setGetTokenIdsOfCollection(tokenIdsStr);
      return getTokenIdsOfCollection;
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
      const tx = await collectionContractInstance.getTokenURI(tokenId);
      setTokenUri(tx);
      return tx;
    } catch (error) {
      console.error("Error to get token URI from collection =:= ", error);
    }
  };

  const getOwnedTokens = async (collectionAddress, tokenId, curraccount = account) => {
    try {
      const collectionContractInstance = new ethers.Contract(
        collectionAddress,
        CollectionContractABI,
        signer
      );
      const tx = await collectionContractInstance.getOwnedTokens(curraccount);
      console.log("tx == 🧨🎇", tx);

      const tokenIndex = tx[0].findIndex(id => id.toString() === tokenId.toString());

      if (tokenIndex !== -1) {
        console.log("Your balance ==--== ", tx[1][tokenIndex]);
        return tx[1][tokenIndex].toNumber();
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error getting owned tokens:", error);
      return 0;
    }
  };

  const getAllListedTokens = async () => {
    try {
      const tx = await marketplaceContract.getAllListedTokens();
      console.log("tx == ", tx);
      return tx;
    } catch (error) {
      console.error("Error getting All listed tokens:", error);
      return 0;
    }
  };

  const listToken = async (
    collectionAddress,
    tokenId,
    quantity,
    price,
  ) => {
    try {

      console.log("Coll Address == ", collectionAddress);;
      const erc1155Contract = new ethers.Contract(collectionAddress, CollectionContractABI, signer);
      const isApprovedForAll = await erc1155Contract.isApprovedForAll(account, marketplaceContractAddress);

      if (!isApprovedForAll) {
        const txApprove = await erc1155Contract.setApprovalForAll(marketplaceContractAddress, true);
        await txApprove.wait();
        console.log("Approval granted for marketplace contract to operate on tokens.");
      }


      const tx = await marketplaceContract.listToken(
        collectionAddress,
        tokenId,
        quantity,
        ethers.utils.parseEther(price.toString()),
      );
      await tx.wait();
      console.log("Token listed successfully.");
    } catch (error) {
      console.error("Error listing token:", error);
    }
  };


  const buyToken = async (listingId, quantity, price) => {
    try {
      console.log("price == ", price);
      console.log("price😊 == ", ethers.utils.parseEther(price.toString()));
      const txBuyToken = await marketplaceContract.buyToken(listingId, quantity, {
        value: ethers.utils.parseEther(price.toString()),
      });
      await txBuyToken.wait();
      console.log("Token bought successfully.");
    } catch (error) {
      console.error("Error buying token:", error);
    }
  };


  const getMyPurchasedTokens = async (currAccont = account) => {
    try {
      const txBuyToken = await marketplaceContract.getMyPurchasedTokens(currAccont);
      console.log("Token bought successfully.", txBuyToken);
      return txBuyToken;
    } catch (error) {
      console.error("Error buying token😊😊:", error);
    }
  };


  return (
    <NFTMarketplaceContext.Provider
      value={{
        account,
        myCollections,
        getTokenIdsOfCollection,
        tokenUri,
        createCollection,
        mintToken,
        listToken,
        buyToken,
        fetchMyCollections,
        getTokenIds,
        getOwnedTokens,
        getTokenURI,
        getAllListedTokens,
        purchasedCollections,
        getMyPurchasedTokens,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
