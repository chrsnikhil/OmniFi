'use client';

import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '@/lib/web3';
import { contractVerifier } from '@/lib/contract-verifier';
import { usePrivy } from '@privy-io/react-auth';

export interface VaultData {
  userTokenBalance: string;
  userVaultDeposits: string;
  availableDepositLimit: string;
  currentPrice: string;
  totalVaultDeposits: string;
  isLoading: boolean;
  error: string | null;
}

export function useWeb3() {
  const { user, authenticated } = usePrivy();
  const [vaultData, setVaultData] = useState<VaultData>({
    userTokenBalance: '0',
    userVaultDeposits: '0',
    availableDepositLimit: '0',
    currentPrice: '0',
    totalVaultDeposits: '0',
    isLoading: false,
    error: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;
    
    try {
      // First verify contracts are deployed
      console.log('🔍 Verifying contracts...');
      const contractsValid = await contractVerifier.verifyAllContracts();
      
      if (!contractsValid) {
        setVaultData(prev => ({ 
          ...prev, 
          error: 'Smart contracts not found. Please check contract addresses in .env.local file.' 
        }));
        return;
      }

      await web3Service.initialize();
      setIsInitialized(true);
      console.log('✅ Web3 initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      setVaultData(prev => ({ ...prev, error: 'Failed to initialize wallet connection' }));
    }
  }, [authenticated, user?.wallet?.address]);

  const loadVaultData = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address || !isInitialized) return;

    setVaultData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(user.wallet.address);
      const [tokenBalance, userVaultInfo, vaultStatus] = await Promise.all([
        web3Service.getTokenBalance(user.wallet.address),
        web3Service.getUserVaultInfo(user.wallet.address),
        web3Service.getVaultStatus(),
      ]);

      setVaultData({
        userTokenBalance: tokenBalance,
        userVaultDeposits: userVaultInfo.depositAmount,
        availableDepositLimit: userVaultInfo.availableLimit,
        currentPrice: vaultStatus.currentPrice,
        totalVaultDeposits: vaultStatus.totalDeposits,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Failed to load vault data:', error);
      setVaultData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load vault data',
      }));
    }
  }, [authenticated, user?.wallet?.address, isInitialized]);

  const deposit = useCallback(async (amount: string): Promise<boolean> => {
    if (!authenticated || !user?.wallet?.address || !isInitialized) {
      throw new Error('Wallet not connected');
    }

    try {
      // First, check and approve if needed
      const currentAllowance = await web3Service.getTokenAllowance(
        user.wallet.address,
        process.env.NEXT_PUBLIC_VAULT_ADDRESS || ''
      );

      if (parseFloat(currentAllowance) < parseFloat(amount)) {
        console.log('Approving tokens...');
        const approveTx = await web3Service.approveToken(
          process.env.NEXT_PUBLIC_VAULT_ADDRESS || '',
          amount
        );
        await approveTx.wait();
        console.log('Approval successful');
      }

      // Then deposit
      console.log('Depositing tokens...');
      const depositTx = await web3Service.depositToVault(amount);
      await depositTx.wait();
      console.log('Deposit successful');

      // Reload data
      await loadVaultData();
      return true;
    } catch (error: any) {
      console.error('Deposit failed:', error);
      throw new Error(error.message || 'Deposit failed');
    }
  }, [authenticated, user?.wallet?.address, isInitialized, loadVaultData]);

  const withdraw = useCallback(async (amount: string): Promise<boolean> => {
    if (!authenticated || !user?.wallet?.address || !isInitialized) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Withdrawing tokens...');
      const withdrawTx = await web3Service.withdrawFromVault(amount);
      await withdrawTx.wait();
      console.log('Withdrawal successful');

      // Reload data
      await loadVaultData();
      return true;
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      throw new Error(error.message || 'Withdrawal failed');
    }
  }, [authenticated, user?.wallet?.address, isInitialized, loadVaultData]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized) {
      loadVaultData();
    }
  }, [isInitialized, loadVaultData]);

  return {
    vaultData,
    isConnected: authenticated && isInitialized,
    userAddress: user?.wallet?.address,
    deposit,
    withdraw,
    refreshData: loadVaultData,
  };
}
