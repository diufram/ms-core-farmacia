import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: ["0x6bafc8f138cb49ab6ef487ad6ad5363db10edcf613cc3d5bc85d337310a42b4c"]
    }
  }
};
