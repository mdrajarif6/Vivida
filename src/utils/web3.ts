import { ethers } from 'ethers';

export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002

export const switchNetwork = async (provider: any) => {
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: POLYGON_AMOY_CHAIN_ID }]);
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902 || switchError?.info?.error?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await provider.send("wallet_addEthereumChain", [{
          chainId: POLYGON_AMOY_CHAIN_ID,
          chainName: "Polygon Amoy Testnet",
          rpcUrls: ["https://rpc-amoy.polygon.technology/"],
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
          },
          blockExplorerUrls: ["https://amoy.polygonscan.com/"]
        }]);
        return true;
      } catch (addError) {
        console.error("Failed to add network:", addError);
        return false;
      }
    }
    console.error("Failed to switch network:", switchError);
    return false;
  }
};
