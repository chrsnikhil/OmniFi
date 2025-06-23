import { ethers } from 'ethers';
import { CONTRACTS, AVALANCHE_FUJI } from './contracts';

/**
 * Custom service for interacting with Web3 using ethers and Privy
 * This replaces the need for wagmi/viem while providing similar functionality
 */
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async initialize() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
      await this.switchToAvalancheFuji();
      this.signer = await this.provider.getSigner();
    }
  }

  async switchToAvalancheFuji() {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('No wallet found');

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${AVALANCHE_FUJI.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${AVALANCHE_FUJI.chainId.toString(16)}`,
            chainName: AVALANCHE_FUJI.name,
            nativeCurrency: {
              name: AVALANCHE_FUJI.currency,
              symbol: AVALANCHE_FUJI.currency,
              decimals: 18,
            },
            rpcUrls: [AVALANCHE_FUJI.rpcUrl],
            blockExplorerUrls: [AVALANCHE_FUJI.explorerUrl],
          }],
        });
      }
    }
  }

  getContract(contractName: 'CUSTOM_ERC20' | 'VAULT') {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = CONTRACTS[contractName];
    if (!contract.address) throw new Error(`${contractName} address not configured`);
    
    return new ethers.Contract(contract.address, contract.abi, this.signer);
  }

  getReadOnlyContract(contractName: 'CUSTOM_ERC20' | 'VAULT') {
    const provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
    const contract = CONTRACTS[contractName];
    if (!contract.address) throw new Error(`${contractName} address not configured`);
    
    return new ethers.Contract(contract.address, contract.abi, provider);
  }

  async getTokenBalance(userAddress: string): Promise<string> {
    try {
      console.log('Getting token balance for:', userAddress);
      console.log('Contract address:', CONTRACTS.CUSTOM_ERC20.address);
      
      // Check if contract address is set
      if (!CONTRACTS.CUSTOM_ERC20.address) {
        console.error('Custom ERC20 address not configured');
        return '0.0';
      }

      const contract = this.getReadOnlyContract('CUSTOM_ERC20');
      
      // First, let's check if the contract exists by trying to get its code
      const provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const code = await provider.getCode(CONTRACTS.CUSTOM_ERC20.address);
      
      if (code === '0x') {
        console.error('No contract found at address:', CONTRACTS.CUSTOM_ERC20.address);
        return '0.0';
      }

      console.log('Contract exists, getting balance...');
      const balance = await contract.balanceOf(userAddress);
      console.log('Raw balance:', balance.toString());
      
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error('Error getting token balance:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      return '0.0';
    }
  }

  async getTokenAllowance(userAddress: string, spenderAddress: string): Promise<string> {
    const contract = this.getReadOnlyContract('CUSTOM_ERC20');
    const allowance = await contract.allowance(userAddress, spenderAddress);
    return ethers.formatEther(allowance);
  }

  async approveToken(spenderAddress: string, amount: string): Promise<ethers.TransactionResponse> {
    const contract = this.getContract('CUSTOM_ERC20');
    const amountWei = ethers.parseEther(amount);
    return await contract.approve(spenderAddress, amountWei);
  }

  async depositToVault(amount: string): Promise<ethers.TransactionResponse> {
    const contract = this.getContract('VAULT');
    const amountWei = ethers.parseEther(amount);
    return await contract.deposit(amountWei);
  }

  async withdrawFromVault(amount: string): Promise<ethers.TransactionResponse> {
    const contract = this.getContract('VAULT');
    const amountWei = ethers.parseEther(amount);
    return await contract.withdraw(amountWei);
  }

  async getUserVaultInfo(userAddress: string) {
    try {
      console.log('Getting vault info for:', userAddress);
      console.log('Vault address:', CONTRACTS.VAULT.address);
      
      if (!CONTRACTS.VAULT.address) {
        console.error('Vault address not configured');
        return {
          depositAmount: '0.0',
          depositTime: '0',
          availableLimit: '0.0'
        };
      }

      // Check if vault contract exists
      const provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const code = await provider.getCode(CONTRACTS.VAULT.address);
      
      if (code === '0x') {
        console.error('No vault contract found at address:', CONTRACTS.VAULT.address);
        return {
          depositAmount: '0.0',
          depositTime: '0',
          availableLimit: '0.0'
        };
      }

      const contract = this.getReadOnlyContract('VAULT');
      const [depositAmount, depositTime, availableLimit] = await contract.getUserInfo(userAddress);
      
      return {
        depositAmount: ethers.formatEther(depositAmount),
        depositTime: depositTime.toString(),
        availableLimit: ethers.formatEther(availableLimit)
      };
    } catch (error: any) {
      console.error('Error getting vault info:', error);
      return {
        depositAmount: '0.0',
        depositTime: '0',
        availableLimit: '0.0'
      };
    }
  }

  async getVaultStatus() {
    try {
      console.log('Getting vault status...');
      
      if (!CONTRACTS.VAULT.address) {
        console.error('Vault address not configured');
        return {
          totalDeposits: '0.0',
          currentPrice: '0.00',
          currentDepositLimit: '0.0',
          vaultBalance: '0.0'
        };
      }

      // Check if vault contract exists
      const provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
      const code = await provider.getCode(CONTRACTS.VAULT.address);
      
      if (code === '0x') {
        console.error('No vault contract found at address:', CONTRACTS.VAULT.address);
        return {
          totalDeposits: '0.0',
          currentPrice: '0.00',
          currentDepositLimit: '0.0',
          vaultBalance: '0.0'
        };
      }

      const contract = this.getReadOnlyContract('VAULT');
      const [totalDeposits, currentPrice, currentDepositLimit, vaultBalance] = await contract.getVaultStatus();
      
      return {
        totalDeposits: ethers.formatEther(totalDeposits),
        currentPrice: (Number(currentPrice) / 1e8).toFixed(2), // Convert from 8 decimals to USD
        currentDepositLimit: ethers.formatEther(currentDepositLimit),
        vaultBalance: ethers.formatEther(vaultBalance)
      };
    } catch (error: any) {
      console.error('Error getting vault status:', error);
      return {
        totalDeposits: '0.0',
        currentPrice: '0.00',
        currentDepositLimit: '0.0',
        vaultBalance: '0.0'
      };
    }
  }

  async getCurrentPrice(): Promise<string> {
    const contract = this.getReadOnlyContract('VAULT');
    const price = await contract.getLatestPrice();
    return (Number(price) / 1e8).toFixed(2); // Convert from 8 decimals to USD
  }

  async mintTokens(amount: string): Promise<ethers.TransactionResponse> {
    const contract = this.getContract('CUSTOM_ERC20');
    const amountWei = ethers.parseEther(amount);
    return await contract.publicMint(amountWei);
  }

  async getTokenInfo() {
    const contract = this.getReadOnlyContract('CUSTOM_ERC20');
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatEther(totalSupply)
    };
  }

  // New methods for volatility and rebalancing features
  
  async getVolatilityInfo() {
    try {
      const contract = this.getReadOnlyContract('VAULT');
      const [currentVolatility, priceCount, lastUpdate, canUpdate] = await contract.getVolatilityInfo();
      
      return {
        currentVolatility: Number(currentVolatility),
        priceCount: Number(priceCount),
        lastUpdate: Number(lastUpdate),
        canUpdate: Boolean(canUpdate),
        volatilityPercentage: (Number(currentVolatility) / 100).toFixed(2) // Convert to percentage
      };
    } catch (error: any) {
      console.error('Error getting volatility info:', error);
      return {
        currentVolatility: 0,
        priceCount: 0,
        lastUpdate: 0,
        canUpdate: false,
        volatilityPercentage: '0.00'
      };
    }
  }

  async getRebalanceInfo() {
    try {
      const contract = this.getReadOnlyContract('VAULT');
      const [threshold, lastRebalance, rebalanceCount, timeSinceLastRebalance, nextRebalanceEligible] = await contract.getRebalanceInfo();
      
      return {
        threshold: Number(threshold),
        lastRebalance: Number(lastRebalance),
        rebalanceCount: Number(rebalanceCount),
        timeSinceLastRebalance: Number(timeSinceLastRebalance),
        nextRebalanceEligible: Number(nextRebalanceEligible),
        thresholdPercentage: (Number(threshold) / 100).toFixed(2) // Convert to percentage
      };
    } catch (error: any) {
      console.error('Error getting rebalance info:', error);
      return {
        threshold: 0,
        lastRebalance: 0,
        rebalanceCount: 0,
        timeSinceLastRebalance: 0,
        nextRebalanceEligible: 0,
        thresholdPercentage: '0.00'
      };
    }
  }

  async getAllocationInfo() {
    try {
      const contract = this.getReadOnlyContract('VAULT');
      const [conservative, moderate, aggressive, totalAllocation] = await contract.getAllocationInfo();
      
      return {
        conservative: Number(conservative),
        moderate: Number(moderate),
        aggressive: Number(aggressive),
        totalAllocation: Number(totalAllocation),
        conservativePercentage: (Number(conservative) / 100).toFixed(1),
        moderatePercentage: (Number(moderate) / 100).toFixed(1),
        aggressivePercentage: (Number(aggressive) / 100).toFixed(1)
      };
    } catch (error: any) {
      console.error('Error getting allocation info:', error);
      return {
        conservative: 0,
        moderate: 0,
        aggressive: 0,
        totalAllocation: 0,
        conservativePercentage: '0.0',
        moderatePercentage: '0.0',
        aggressivePercentage: '0.0'
      };
    }
  }

  async getPriceHistory() {
    try {
      const contract = this.getReadOnlyContract('VAULT');
      const [prices, timestamps] = await contract.getPriceHistory();
      
      return {
        prices: prices.map((price: any) => (Number(price) / 1e8).toFixed(2)),
        timestamps: timestamps.map((timestamp: any) => Number(timestamp)),
        count: prices.length
      };
    } catch (error: any) {
      console.error('Error getting price history:', error);
      return {
        prices: [],
        timestamps: [],
        count: 0
      };
    }
  }

  async checkUpkeepNeeded() {
    try {
      const contract = this.getReadOnlyContract('VAULT');
      const [upkeepNeeded, performData] = await contract.checkUpkeep('0x');
      
      return {
        upkeepNeeded: Boolean(upkeepNeeded),
        performData: performData
      };
    } catch (error: any) {
      console.error('Error checking upkeep:', error);
      return {
        upkeepNeeded: false,
        performData: '0x'
      };
    }
  }

  async updateVolatilityIndex(): Promise<ethers.TransactionResponse> {
    const contract = this.getContract('VAULT');
    return await contract.updateVolatilityIndex();
  }

  async manualRebalance(): Promise<ethers.TransactionResponse> {
    const contract = this.getContract('VAULT');
    return await contract.manualRebalance();
  }

  // Enhanced vault status with new features
  async getEnhancedVaultStatus() {
    try {
      const [
        basicStatus,
        volatilityInfo,
        rebalanceInfo,
        allocationInfo,
        priceHistory,
        upkeepStatus
      ] = await Promise.all([
        this.getVaultStatus(),
        this.getVolatilityInfo(),
        this.getRebalanceInfo(),
        this.getAllocationInfo(),
        this.getPriceHistory(),
        this.checkUpkeepNeeded()
      ]);

      return {
        ...basicStatus,
        volatility: volatilityInfo,
        rebalancing: rebalanceInfo,
        allocations: allocationInfo,
        priceHistory: priceHistory,
        automation: upkeepStatus
      };
    } catch (error: any) {
      console.error('Error getting enhanced vault status:', error);
      return null;
    }
  }
}

export const web3Service = new Web3Service();
