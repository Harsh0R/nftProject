require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 500, // Adjust 'runs' based on how often you expect to call the contract's functions
    },
  },
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        "f8610ba275562cbc18233acbc6b0769c943c027ef50610002633de5814e1174d",
      ], // Replace privateKey with your wallet's private key for deployment
    },
  },
};
