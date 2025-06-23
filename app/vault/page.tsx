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
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Wallet, TrendingUp, Coins, ArrowUpRight, ArrowDownRight, RefreshCw, Activity, BarChart3, PieChart, Timer, Zap, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export default function VaultPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const { vaultData, isConnected, deposit, withdraw, updateVolatility, manualRebalance, refreshData } = useWeb3();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [isVolatilityLoading, setIsVolatilityLoading] = useState(false);
  const [isRebalanceLoading, setIsRebalanceLoading] = useState(false);

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

  const handleUpdateVolatility = async () => {
    setIsVolatilityLoading(true);
    try {
      await updateVolatility();
      toast.success('Volatility index updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update volatility');
    } finally {
      setIsVolatilityLoading(false);
    }
  };

  const handleManualRebalance = async () => {
    setIsRebalanceLoading(true);
    try {
      await manualRebalance();
      toast.success('Manual rebalance completed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Manual rebalance failed');
    } finally {
      setIsRebalanceLoading(false);
    }
  };

  const formatNumber = (value: string, decimals: number = 2) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getVolatilityStatus = (volatility: number) => {
    if (volatility >= 2000) return { label: 'Very High', color: 'bg-red-500', textColor: 'text-red-500' };
    if (volatility >= 1000) return { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-500' };
    if (volatility >= 500) return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    if (volatility >= 200) return { label: 'Low', color: 'bg-green-500', textColor: 'text-green-500' };
    return { label: 'Very Low', color: 'bg-blue-500', textColor: 'text-blue-500' };
  };

  const getRiskLevel = (volatility?: number) => {
    if (!volatility) return 'Unknown';
    if (volatility >= 1000) return 'High Risk';
    if (volatility >= 500) return 'Medium Risk';
    return 'Low Risk';
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
            Intelligent RWA Vault with Volatility-Based Rebalancing
          </motion.p>
          <div className="flex gap-2 justify-center mt-4">
            <Badge variant="outline" className="border-2 border-[#4a90e2] text-[#4a90e2] font-bold px-4 py-2">
              Chainlink Data Feeds
            </Badge>
            <Badge variant="outline" className="border-2 border-[#e94e77] text-[#e94e77] font-bold px-4 py-2">
              Automation Ready
            </Badge>
            <Badge variant="outline" className="border-2 border-[#22c55e] text-[#22c55e] font-bold px-4 py-2">
              Dynamic Risk Management
            </Badge>
          </div>
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

            {/* Volatility & Risk Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Volatility Index */}
              <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#e94e77]">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-[#1a2332] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#e94e77]" />
                    Volatility Index
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#e94e77] mb-2">
                      {vaultData.volatility ? (vaultData.volatility.currentVolatility / 10).toFixed(1) : '0.0'}%
                    </div>
                    <Badge 
                      className={`${getVolatilityStatus(vaultData.volatility?.currentVolatility || 0).color} text-white font-bold px-3 py-1`}
                    >
                      {getVolatilityStatus(vaultData.volatility?.currentVolatility || 0).label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Risk Level:</span>
                      <span className={getVolatilityStatus(vaultData.volatility?.currentVolatility || 0).textColor}>
                        {getRiskLevel(vaultData.volatility?.currentVolatility)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Price Updates:</span>
                      <span className="text-[#4a90e2]">{vaultData.volatility?.priceCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Last Update:</span>
                      <span className="text-[#1a2332]">
                        {vaultData.volatility?.lastUpdate ? formatTime(vaultData.volatility.lastUpdate) : 'Never'}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleUpdateVolatility}
                    disabled={isVolatilityLoading || vaultData.isLoading || !vaultData.volatility?.canUpdate}
                    className="w-full bg-[#e94e77] hover:bg-[#d63384] text-white font-bold py-2 border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all"
                  >
                    {isVolatilityLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Update Volatility
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Price */}
              <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-[#1a2332] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#4a90e2]" />
                    Current RWA Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#4a90e2] mb-2">
                      ${formatNumber(vaultData.currentPrice)}
                    </div>
                    <Badge variant="outline" className="border-2 border-[#4a90e2] text-[#4a90e2] font-bold">
                      ETH/USD via Chainlink
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Price History:</span>
                      <span className="text-[#4a90e2]">{vaultData.priceHistory?.count || 0} records</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Data Source:</span>
                      <span className="text-[#4a90e2]">Chainlink Feeds</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automation Status */}
              <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#22c55e]">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-[#1a2332] flex items-center gap-2">
                    <Timer className="w-5 h-5 text-[#22c55e]" />
                    Automation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="mb-3">
                      <Badge 
                        className={`${vaultData.automation?.upkeepNeeded ? 'bg-orange-500' : 'bg-[#22c55e]'} text-white font-bold px-3 py-1`}
                      >
                        {vaultData.automation?.upkeepNeeded ? 'Action Needed' : 'All Good'}
                      </Badge>
                    </div>
                    <div className="text-sm text-[#1a2332] font-semibold">
                      {vaultData.automation?.upkeepNeeded 
                        ? 'Rebalancing conditions met' 
                        : 'Monitoring market conditions'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Rebalance Count:</span>
                      <span className="text-[#22c55e]">{vaultData.rebalancing?.rebalanceCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#1a2332]">Last Rebalance:</span>
                      <span className="text-[#1a2332]">
                        {vaultData.rebalancing?.lastRebalance ? formatTime(vaultData.rebalancing.lastRebalance) : 'Never'}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleManualRebalance}
                    disabled={isRebalanceLoading || vaultData.isLoading}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2 border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all"
                  >
                    {isRebalanceLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Rebalancing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Manual Rebalance
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Asset Allocation Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Asset Allocation */}
              <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
                    <PieChart className="w-6 h-6" />
                    Asset Allocation
                  </CardTitle>
                  <CardDescription className="text-[#1a2332] font-semibold">
                    Dynamic allocation based on volatility risk
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {vaultData.allocations ? (
                    <>
                      {/* Conservative */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[#1a2332] font-bold flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            Conservative
                          </Label>
                          <span className="text-green-600 font-black text-lg">
                            {vaultData.allocations.conservativePercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={parseFloat(vaultData.allocations.conservativePercentage)} 
                          className="h-3"
                        />
                        <div className="text-sm text-[#1a2332] font-semibold">
                          {formatNumber(vaultData.allocations.conservative.toString())} CCT
                        </div>
                      </div>

                      {/* Moderate */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[#1a2332] font-bold flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            Moderate
                          </Label>
                          <span className="text-yellow-600 font-black text-lg">
                            {vaultData.allocations.moderatePercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={parseFloat(vaultData.allocations.moderatePercentage)} 
                          className="h-3"
                        />
                        <div className="text-sm text-[#1a2332] font-semibold">
                          {formatNumber(vaultData.allocations.moderate.toString())} CCT
                        </div>
                      </div>

                      {/* Aggressive */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[#1a2332] font-bold flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            Aggressive
                          </Label>
                          <span className="text-red-600 font-black text-lg">
                            {vaultData.allocations.aggressivePercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={parseFloat(vaultData.allocations.aggressivePercentage)} 
                          className="h-3"
                        />
                        <div className="text-sm text-[#1a2332] font-semibold">
                          {formatNumber(vaultData.allocations.aggressive.toString())} CCT
                        </div>
                      </div>

                      <Separator className="bg-[#1a2332] h-0.5" />
                      
                      <div className="flex justify-between items-center">
                        <Label className="text-[#1a2332] font-bold">Total Allocated:</Label>
                        <span className="text-[#4a90e2] font-black text-xl">
                          {formatNumber(vaultData.allocations.totalAllocation.toString())} CCT
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-[#1a2332] font-semibold mb-2">No allocation data available</div>
                      <div className="text-sm text-gray-500">Make some vault deposits to see allocation</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rebalancing Strategy */}
              <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#e94e77]">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Rebalancing Strategy
                  </CardTitle>
                  <CardDescription className="text-[#1a2332] font-semibold">
                    Automated rebalancing based on volatility threshold
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vaultData.rebalancing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[#1a2332] font-bold">Volatility Threshold</Label>
                          <div className="text-2xl font-black text-[#e94e77]">
                            {vaultData.rebalancing.thresholdPercentage}%
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[#1a2332] font-bold">Rebalance Count</Label>
                          <div className="text-2xl font-black text-[#4a90e2]">
                            {vaultData.rebalancing.rebalanceCount}
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="bg-[#1a2332] h-0.5" />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-[#1a2332]">Last Rebalance:</span>
                          <span className="text-[#1a2332]">
                            {formatTime(vaultData.rebalancing.lastRebalance)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-[#1a2332]">Time Since:</span>
                          <span className="text-[#1a2332]">
                            {vaultData.rebalancing.timeSinceLastRebalance} seconds
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-[#1a2332]">Next Eligible:</span>
                          <span className="text-[#1a2332]">
                            {formatTime(vaultData.rebalancing.nextRebalanceEligible)}
                          </span>
                        </div>
                      </div>

                      <Alert className="border-2 border-[#e94e77] bg-pink-50">
                        <AlertCircle className="h-4 w-4 text-[#e94e77]" />
                        <AlertDescription className="text-[#1a2332] font-semibold">
                          Rebalancing is triggered automatically when volatility exceeds {vaultData.rebalancing.thresholdPercentage}% using Chainlink Automation.
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-[#1a2332] font-semibold mb-2">No rebalancing data available</div>
                      <div className="text-sm text-gray-500">Rebalancing info will appear after vault activity</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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

            {/* How Volatility-Based Rebalancing Works */}
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-[#1a2332]">
                  How Volatility-Based Rebalancing Works
                </CardTitle>
                <CardDescription className="text-[#1a2332] font-semibold">
                  Advanced risk management powered by Chainlink automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl">�</div>
                    <h3 className="font-black text-[#1a2332]">Price Monitoring</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">
                      Chainlink Data Feeds track ETH/USD price changes continuously
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">🌊</div>
                    <h3 className="font-black text-[#1a2332]">Volatility Calculation</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">
                      Algorithm computes price variance and volatility index
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">⚡</div>
                    <h3 className="font-black text-[#1a2332]">Automated Triggers</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">
                      Chainlink Automation triggers rebalancing when volatility exceeds threshold
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">🎯</div>
                    <h3 className="font-black text-[#1a2332]">Dynamic Allocation</h3>
                    <p className="text-sm text-[#1a2332] font-semibold">
                      Assets reallocated between conservative, moderate, and aggressive strategies
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-[#1a2332] h-0.5 my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Alert className="border-2 border-green-500 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 font-semibold">
                      <strong>Low Volatility (&lt;5%):</strong> More allocation to aggressive strategies for higher yield potential
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-2 border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 font-semibold">
                      <strong>Medium Volatility (5-10%):</strong> Balanced allocation across all risk levels
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-2 border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 font-semibold">
                      <strong>High Volatility (&gt;10%):</strong> Increased allocation to conservative strategies for capital preservation
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
