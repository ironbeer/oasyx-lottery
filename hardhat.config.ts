import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.12",
  networks: {
    mainnet: {
      url: 'https://rpc.mainnet.oasys.games/',
      chainId: 248,
    },
  }
};

export default config;
