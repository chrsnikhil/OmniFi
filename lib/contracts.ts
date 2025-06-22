// Contract configuration for OmniFi
export const CONTRACTS = {
  // These will be populated after deployment
  CUSTOM_ERC20: {
    address: process.env.NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS || "",
    abi: [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address, uint256) returns (bool)",
      "function approve(address, uint256) returns (bool)",
      "function allowance(address, address) view returns (uint256)",
      "function mint(address, uint256) external",
      "function publicMint(uint256) external",
      "event Transfer(address indexed, address indexed, uint256)",
      "event Approval(address indexed, address indexed, uint256)"
    ]
  },
  VAULT: {
    address: process.env.NEXT_PUBLIC_VAULT_ADDRESS || "",
    abi: [
      "function deposit(uint256) external",
      "function withdraw(uint256) external", 
      "function getUserInfo(address) view returns (uint256, uint256, uint256)",
      "function getVaultStatus() view returns (uint256, int256, uint256, uint256)",
      "function getLatestPrice() view returns (int256)",
      "function getCurrentDepositLimit() view returns (uint256)",
      "function userDeposits(address) view returns (uint256)",
      "function totalDeposits() view returns (uint256)",
      "function baseDepositLimit() view returns (uint256)",
      "function priceThreshold() view returns (uint256)",
      "event Deposit(address indexed, uint256, uint256)",
      "event Withdrawal(address indexed, uint256, uint256)"
    ]
  }
};

// Network configuration
export const AVALANCHE_FUJI = {
  chainId: 43113,
  name: "Avalanche Fuji Testnet",
  currency: "AVAX",
  explorerUrl: "https://testnet.snowtrace.io",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc"
};

// Token configuration
export const CCT_TOKEN = {
  name: "Carbon Credit Token",
  symbol: "CCT",
  decimals: 18
};
