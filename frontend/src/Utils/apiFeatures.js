import { ethers } from "ethers";
import { smartContractAddress, smartContractABI } from "../Context/constants";

export const connectingWithContract = async () => {
  try {
    if (!window.ethereum) {
      console.log("MetaMask not detected. Please install MetaMask.");
      return null; // Return null or handle the absence of MetaMask in your application logic
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      smartContractAddress,
      smartContractABI,
      signer
    );
    // console.log("SC in Api = ", contract);
    return contract;
  } catch (error) {
    console.log("Error connecting with contract:", error);
    return null; // Handle the error in your application logic
  }
};

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      return console.log("INSTALL METAMASk");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const firstAccount = accounts[0];
    return firstAccount;
  } catch (error) {
    console.log(error);
  }
};
