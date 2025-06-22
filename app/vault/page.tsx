'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Wallet, TrendingUp, Coins, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export default function VaultPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const { vaultData, isConnected, deposit, withdraw, refreshData } = useWeb3();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    if (parseFloat(depositAmount) > parseFloat(vaultData.userTokenBalance)) {
      toast.error('Insufficient RWA token balance');
      return;
    }

    if (parseFloat(depositAmount) > parseFloat(vaultData.availableDepositLimit)) {
      toast.error('Amount exceeds current deposit limit');
      return;
    }

    setIsDepositLoading(true);
    try {
      await deposit(depositAmount);
      toast.success(`Successfully deposited ${depositAmount} CCT!`);
      setDepositAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed');
    } finally {
      setIsDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(vaultData.userVaultDeposits)) {
      toast.error('Insufficient vault deposits');
      return;
    }

    setIsWithdrawLoading(true);
    try {
      await withdraw(withdrawAmount);
      toast.success(`Successfully withdrew ${withdrawAmount} CCT!`);
      setWithdrawAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const formatNumber = (value: string, decimals: number = 2) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              className="w-16 h-16 bg-[#4a90e2] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[8px_8px_0px_0px_#1a2332] mb-2"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-6xl font-black text-[#1a2332] font-space-grotesk tracking-wider">
              OMNI<span className="text-[#4a90e2]">FI</span> <span className="text-[#1a2332]">VAULT</span>
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-[#2d3748] font-mono font-bold"
          >
            Real-World Asset Token Vault with Dynamic Limits
          </motion.p>
          <Badge variant="outline" className="border-2 border-[#4a90e2] text-[#4a90e2] font-bold px-4 py-2 mt-4">
            Powered by Chainlink Data Feeds
          </Badge>
        </motion.div>

        {/* Connection Status */}
        {!authenticated ? (
          <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2] max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center justify-center gap-2">
                <Wallet className="w-6 h-6" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-[#1a2332] font-semibold">
                Connect your wallet to interact with the OmniFi Vault
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={login}
                className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold py-3 border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* User Info */}
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    Wallet Connected
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={refreshData}
                      variant="outline"
                      size="sm"
                      className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white font-bold"
                      disabled={vaultData.isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${vaultData.isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      onClick={logout}
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-[#1a2332] font-semibold break-all">
                  {user?.wallet?.address}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Error Display */}
            {vaultData.error && (
              <Alert className="border-2 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 font-semibold">
                  {vaultData.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vault Stats */}
              <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Vault Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#1a2332] font-bold">Current ETH/USD Price</Label>
                      <div className="text-3xl font-black text-[#4a90e2]">
                        ${formatNumber(vaultData.currentPrice)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1a2332] font-bold">Total Vault Deposits</Label>
                      <div className="text-3xl font-black text-[#1a2332]">
                        {formatNumber(vaultData.totalVaultDeposits)} CCT
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#1a2332] h-0.5" />
                  
                  <div className="space-y-2">
                    <Label className="text-[#1a2332] font-bold">Your RWA Token Balance</Label>
                    <div className="text-2xl font-black text-[#4a90e2]">
                      {formatNumber(vaultData.userTokenBalance, 4)} CCT
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[#1a2332] font-bold">Your Vault Deposits</Label>
                    <div className="text-2xl font-black text-green-600">
                      {formatNumber(vaultData.userVaultDeposits, 4)} CCT
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[#1a2332] font-bold">Available Deposit Limit</Label>
                    <div className="text-xl font-black text-orange-600">
                      {formatNumber(vaultData.availableDepositLimit, 4)} CCT
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-6">
                {/* Deposit */}
                <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
                      <ArrowUpRight className="w-6 h-6 text-green-600" />
                      Deposit RWA Tokens
                    </CardTitle>
                    <CardDescription className="text-[#1a2332] font-semibold">
                      Deposit your RWA tokens to the vault
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount" className="text-[#1a2332] font-bold">
                        Amount to Deposit
                      </Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="border-2 border-[#1a2332] focus:border-[#4a90e2] font-semibold"
                        disabled={isDepositLoading || vaultData.isLoading}
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a2332] font-semibold">
                          Balance: {formatNumber(vaultData.userTokenBalance, 4)} CCT
                        </span>
                        <span className="text-[#1a2332] font-semibold">
                          Limit: {formatNumber(vaultData.availableDepositLimit, 4)} CCT
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setDepositAmount((parseFloat(vaultData.userTokenBalance) * 0.25).toString())}
                        variant="outline"
                        size="sm"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white font-bold"
                        disabled={isDepositLoading || vaultData.isLoading}
                      >
                        25%
                      </Button>
                      <Button
                        onClick={() => setDepositAmount((parseFloat(vaultData.userTokenBalance) * 0.5).toString())}
                        variant="outline"
                        size="sm"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white font-bold"
                        disabled={isDepositLoading || vaultData.isLoading}
                      >
                        50%
                      </Button>
                      <Button
                        onClick={() => setDepositAmount(Math.min(parseFloat(vaultData.userTokenBalance), parseFloat(vaultData.availableDepositLimit)).toString())}
                        variant="outline"
                        size="sm"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white font-bold"
                        disabled={isDepositLoading || vaultData.isLoading}
                      >
                        MAX
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleDeposit}
                      disabled={isDepositLoading || vaultData.isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all"
                    >
                      {isDepositLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Depositing...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Deposit Tokens
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Withdraw */}
                <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
                      <ArrowDownRight className="w-6 h-6 text-red-600" />
                      Withdraw RWA Tokens
                    </CardTitle>
                    <CardDescription className="text-[#1a2332] font-semibold">
                      Withdraw your RWA tokens from the vault
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount" className="text-[#1a2332] font-bold">
                        Amount to Withdraw
                      </Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.0"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="border-2 border-[#1a2332] focus:border-[#4a90e2] font-semibold"
                        disabled={isWithdrawLoading || vaultData.isLoading}
                      />
                      <div className="text-sm text-[#1a2332] font-semibold">
                        Available: {formatNumber(vaultData.userVaultDeposits, 4)} CCT
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setWithdrawAmount((parseFloat(vaultData.userVaultDeposits) * 0.25).toString())}
                        variant="outline"
                        size="sm"
                        className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold"
                        disabled={isWithdrawLoading || vaultData.isLoading}
                      >
                        25%
                      </Button>
                      <Button
                        onClick={() => setWithdrawAmount((parseFloat(vaultData.userVaultDeposits) * 0.5).toString())}
                        variant="outline"
                        size="sm"
                        className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold"
                        disabled={isWithdrawLoading || vaultData.isLoading}
                      >
                        50%
                      </Button>
                      <Button
                        onClick={() => setWithdrawAmount(vaultData.userVaultDeposits)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold"
                        disabled={isWithdrawLoading || vaultData.isLoading}
                      >
                        ALL
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleWithdraw}
                      disabled={isWithdrawLoading || vaultData.isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(vaultData.userVaultDeposits) <= 0}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all"
                    >
                      {isWithdrawLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-4 h-4 mr-2" />
                          Withdraw Tokens
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* How it Works */}
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-[#1a2332]">
                  How Dynamic Limits Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl">📈</div>
                    <h3 className="font-black text-[#1a2332]">High Price (≥$2000)</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">Deposit limit: 2,000 CCT (2x multiplier)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">📊</div>
                    <h3 className="font-black text-[#1a2332]">Current Price</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">Real-time ETH/USD from Chainlink</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">📉</div>
                    <h3 className="font-black text-[#1a2332]">Low Price (&lt;$2000)</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">Deposit limit: 500 CCT (0.5x multiplier)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
