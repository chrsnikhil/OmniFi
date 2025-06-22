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
}

export const web3Service = new Web3Service();
