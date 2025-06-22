import { ethers } from 'ethers';
import { AVALANCHE_FUJI } from './contracts';

/**
 * Utility to verify if contracts are deployed and working
 */
export class ContractVerifier {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrl);
  }

  async verifyContract(address: string, contractName: string) {
    try {
      console.log(`\n=== Verifying ${contractName} at ${address} ===`);
      
      if (!address || address === '') {
        console.error(`❌ ${contractName} address is not configured`);
        return false;
      }

      // Check if contract exists
      const code = await this.provider.getCode(address);
      if (code === '0x') {
        console.error(`❌ No contract found at ${address}`);
        return false;
      }

      console.log(`✅ Contract exists at ${address}`);
      console.log(`Contract code length: ${code.length} characters`);

      // Try to get some basic info
      if (contractName === 'ERC20') {
        await this.verifyERC20(address);
      } else if (contractName === 'Vault') {
        await this.verifyVault(address);
      }

      return true;
    } catch (error: any) {
      console.error(`❌ Error verifying ${contractName}:`, error.message);
      return false;
    }
  }

  private async verifyERC20(address: string) {
    try {
      const abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)"
      ];
      
      const contract = new ethers.Contract(address, abi, this.provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      console.log(`  Name: ${name}`);
      console.log(`  Symbol: ${symbol}`);
      console.log(`  Decimals: ${decimals}`);
      console.log(`  Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    } catch (error: any) {
      console.error(`  ❌ Failed to get ERC20 info:`, error.message);
    }
  }

  private async verifyVault(address: string) {
    try {
      const abi = [
        "function totalDeposits() view returns (uint256)",
        "function baseDepositLimit() view returns (uint256)"
      ];
      
      const contract = new ethers.Contract(address, abi, this.provider);
      
      const [totalDeposits, baseDepositLimit] = await Promise.all([
        contract.totalDeposits(),
        contract.baseDepositLimit()
      ]);

      console.log(`  Total Deposits: ${ethers.formatEther(totalDeposits)} tokens`);
      console.log(`  Base Deposit Limit: ${ethers.formatEther(baseDepositLimit)} tokens`);
    } catch (error: any) {
      console.error(`  ❌ Failed to get Vault info:`, error.message);
    }
  }

  async verifyAllContracts() {
    console.log('🔍 Verifying all contracts...');
    
    const erc20Address = process.env.NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS;
    const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

    const results = await Promise.all([
      this.verifyContract(erc20Address || '', 'ERC20'),
      this.verifyContract(vaultAddress || '', 'Vault')
    ]);

    const allValid = results.every(result => result);
    
    if (allValid) {
      console.log('\n✅ All contracts verified successfully!');
    } else {
      console.log('\n❌ Some contracts failed verification. Check the addresses in your .env.local file.');
    }

    return allValid;
  }
}

export const contractVerifier = new ContractVerifier();
