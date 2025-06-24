"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, ArrowRight, Target, TrendingUp, Coins, CheckCircle, AlertCircle, Clock, Wallet, RefreshCw } from "lucide-react"
import { NavigationHeader } from "@/components/navigation-header"
import { useCrossChainTransfer } from "@/hooks/useCrossChainTransfer"
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'

interface ChainData {
  id: string
  name: string
  yield: number
  color: string
  isRecommended: boolean
  tvl: string
  gasEstimate: string
}

export default function CrossChainTransferPage() {
  const { login, authenticated, user } = usePrivy()
  const { 
    transferState, 
    balances, 
    isLoading,
    executeCrossChainTransfer, 
    resetTransfer, 
    fetchBalances,
    manualMint,
    networks 
  } = useCrossChainTransfer()
  
  const [transferAmount, setTransferAmount] = useState("")
  const [selectedChain, setSelectedChain] = useState("auto")
  const [useSmartContract, setUseSmartContract] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Mock chain data with yields (static for UI)
  const chainData: ChainData[] = [
    {
      id: "43113",
      name: "Avalanche Fuji",
      yield: 4.2,
      color: "#e84142",
      isRecommended: false,
      tvl: "$2.4M",
      gasEstimate: "~$0.02"
    },
    {
      id: "84532", 
      name: "Base Sepolia",
      yield: 5.8,
      color: "#0052ff",
      isRecommended: true,
      tvl: "$1.8M",
      gasEstimate: "~$0.01"
    },
    {
      id: "11155111",
      name: "Ethereum Sepolia", 
      yield: 3.1,
      color: "#627eea",
      isRecommended: false,
      tvl: "$5.2M",
      gasEstimate: "~$0.15"
    }
  ]

  // Load balances on mount and when authenticated
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchBalances()
    }
  }, [authenticated, user?.wallet?.address, fetchBalances])

  // Show success alert when transfer completes
  useEffect(() => {
    if (transferState.status === 'completed') {
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)
    }
  }, [transferState.status])

  const getFujiBalance = () => {
    const fujiBalance = balances.find(b => b.chainId === '43113')
    return fujiBalance ? parseFloat(fujiBalance.balance) : 0
  }

  const getBaseBalance = () => {
    const baseBalance = balances.find(b => b.chainId === '84532')
    return baseBalance ? parseFloat(baseBalance.balance) : 0
  }

  const getRecommendedChain = () => {
    return chainData.find(chain => chain.isRecommended) || chainData[0]
  }

  const handleTransfer = async () => {
    if (!authenticated) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error('Please enter a valid transfer amount')
      return
    }

    const fujiBalance = getFujiBalance()
    if (parseFloat(transferAmount) > fujiBalance) {
      toast.error('Insufficient balance on Avalanche Fuji')
      return
    }

    try {
      await executeCrossChainTransfer(transferAmount, useSmartContract)
      setTransferAmount("")
    } catch (error: any) {
      console.error('Transfer failed:', error)
    }
  }

  const handleManualMint = async () => {
    if (!transferState.burnAmount) {
      toast.error('No burned amount to mint')
      return
    }

    try {
      await manualMint(transferState.burnAmount, true) // true indicates this is for bridge completion
    } catch (error: any) {
      console.error('Manual mint failed:', error)
    }
  }

  const handleTestMint = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error('Please enter a valid amount to test mint')
      return
    }

    try {
      await manualMint(transferAmount, false) // false indicates this is direct testing
    } catch (error: any) {
      console.error('Test mint failed:', error)
    }
  }

  const getStatusIcon = (status: typeof transferState.status) => {
    switch (status) {
      case 'burning':
        return <Zap className="w-4 h-4 text-orange-500" />
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'minting':
        return <Coins className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: typeof transferState.status) => {
    switch (status) {
      case 'burning': return 'BURNING TOKENS'
      case 'waiting': return 'WAITING FOR MINT'
      case 'minting': return 'MINTING TOKENS'
      case 'completed': return 'COMPLETED'
      case 'error': return 'FAILED'
      default: return 'READY'
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <NavigationHeader />
      <div className="bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-black text-[#1a2332] font-space-grotesk tracking-wider">
            CROSS-CHAIN TRANSFER
          </h1>
          <p className="text-xl text-[#2d3748] font-mono font-bold">
            OMNIFI YIELD-OPTIMIZED BRIDGE
          </p>
        </motion.div>

        {/* Success Alert */}
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Alert className="bg-[#00b894] border-4 border-[#1a2332] text-white shadow-[8px_8px_0px_0px_#1a2332]">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="font-bold font-space-grotesk">
                ✅ TRANSFER COMPLETED! Tokens have been burned on Fuji and are ready for minting on the destination chain.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Transfer Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2] hover:shadow-[16px_16px_0px_0px_#4a90e2] transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#4a90e2]" />
                  INITIATE TRANSFER
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Balance Display */}
                <div className="bg-[#f5f5f5] border-4 border-[#4a90e2] p-4 shadow-[4px_4px_0px_0px_#4a90e2]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-space-grotesk text-[#1a2332]">YOUR BALANCE</span>
                    <span className="text-xl font-black font-space-grotesk text-[#4a90e2]">
                      {getFujiBalance().toFixed(2)} CCT
                    </span>
                  </div>
                  <p className="text-sm font-mono text-[#2d3748] mt-1">ON AVALANCHE FUJI</p>
                  {isLoading && (
                    <div className="flex items-center gap-2 mt-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#4a90e2]" />
                      <span className="text-xs font-mono text-[#4a90e2]">UPDATING BALANCE...</span>
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold font-space-grotesk text-[#1a2332]">
                    TRANSFER AMOUNT
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="100.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all pr-16"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Coins className="w-5 h-5 text-[#4a90e2]" />
                    </div>
                  </div>
                </div>

                {/* Chain Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold font-space-grotesk text-[#1a2332]">
                    DESTINATION CHAIN
                  </label>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger className="bg-white border-4 border-[#4a90e2] font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-4 border-[#1a2332]">
                      <SelectItem value="auto" className="font-bold font-space-grotesk">
                        🎯 AUTO-SELECT (RECOMMENDED)
                      </SelectItem>
                      {chainData.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id} className="font-bold font-space-grotesk">
                          {chain.name} - {chain.yield}% APY
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transfer Button */}
                <Button
                  onClick={handleTransfer}
                  disabled={transferState.status !== 'idle' || !transferAmount || parseFloat(transferAmount) <= 0 || !authenticated}
                  className="w-full bg-[#1a2332] hover:bg-[#2d3748] text-white font-black font-space-grotesk px-8 py-6 border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2] hover:shadow-[12px_12px_0px_0px_#4a90e2] transition-all text-lg disabled:opacity-50"
                >
                  {transferState.status !== 'idle' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      {getStatusText(transferState.status)}
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      INITIATE TRANSFER
                    </div>
                  )}
                </Button>

                {/* Debug Section */}
                {authenticated && (
                  <div className="bg-[#f5f5f5] border-4 border-orange-400 p-4 shadow-[4px_4px_0px_0px_orange-400]">
                    <h4 className="font-bold font-space-grotesk text-[#1a2332] mb-2">🔧 DEBUG INFO</h4>
                    
                    {/* Real Transfer Status Badge */}
                    {user?.wallet?.address !== '0x3aC23Fc97c9BED195A1CA74B593eDBf6d5688EaF' && (
                      <div className="mb-3 p-2 bg-green-100 border-2 border-green-500 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-bold text-green-800">
                            🔥 REAL TRANSFER MODE: You will receive actual CCT tokens!
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-xs font-mono">
                      <p><strong>Wallet:</strong> {user?.wallet?.address?.slice(0, 10)}...</p>
                      <p><strong>Fuji Balance:</strong> {getFujiBalance().toFixed(4)} CCT</p>
                      <p><strong>Base Balance:</strong> {getBaseBalance().toFixed(4)} CCT</p>
                      <p><strong>Transfer Status:</strong> {transferState.status}</p>
                      {transferState.txHash && <p><strong>Last TX:</strong> {transferState.txHash.slice(0, 20)}...</p>}
                      {transferState.bridgeNote && <p><strong>Bridge:</strong> {transferState.bridgeNote}</p>}
                      <p><strong>Bridge Mode:</strong> {user?.wallet?.address === '0x3aC23Fc97c9BED195A1CA74B593eDBf6d5688EaF' ? 'Owner (Direct)' : 'Bridge (Real Transfers)'}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => fetchBalances()}
                        size="sm"
                        className="bg-orange-400 hover:bg-orange-500 text-white font-bold text-xs"
                      >
                        Refresh Balances
                      </Button>
                      <Button
                        onClick={() => console.log('Current state:', { transferState, balances })}
                        size="sm"
                        variant="outline"
                        className="border-orange-400 text-orange-400 hover:bg-orange-50 font-bold text-xs"
                      >
                        Log State
                      </Button>
                      {transferAmount && parseFloat(transferAmount) > 0 && (
                        <Button
                          onClick={handleTestMint}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs"
                        >
                          {user?.wallet?.address === '0x3aC23Fc97c9BED195A1CA74B593eDBf6d5688EaF' 
                            ? `Direct Mint ${transferAmount}` 
                            : `Real Transfer ${transferAmount}`}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Bridge Info Panel */}
                <div className="bg-blue-50 border-4 border-blue-300 p-4 shadow-[4px_4px_0px_0px_blue-300]">
                  <h4 className="font-bold font-space-grotesk text-[#1a2332] mb-2 flex items-center gap-2">
                    🌉 HOW CROSS-CHAIN BRIDGE WORKS
                  </h4>
                  <div className="text-xs font-mono text-[#2d3748] space-y-1">
                    <p><strong>1. BURN:</strong> Tokens are burned on source chain (Fuji)</p>
                    <p><strong>2. VERIFY:</strong> Bridge verifies burn transaction</p>
                    <p><strong>3. MINT:</strong> Bridge mints equivalent tokens on destination chain</p>
                    <p><strong>4. DELIVER:</strong> New tokens delivered to your address</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 border-2 border-blue-400 rounded">
                    <p className="text-xs font-mono text-blue-800">
                      💡 <strong>Note:</strong> This demo uses REAL token transfers! For non-owners, 
                      the bridge operator (contract owner) transfers actual tokens from their balance 
                      to your wallet. You'll receive real CCT tokens on Base Sepolia!
                    </p>
                  </div>
                </div>

                {/* Estimated Fees */}
                <div className="text-center space-y-1">
                  <p className="text-sm font-mono text-[#2d3748]">ESTIMATED GAS: ~$0.02</p>
                  <p className="text-xs font-mono text-[#2d3748]">CHAINLINK FUNCTIONS: INCLUDED</p>
                </div>

              </CardContent>
            </Card>
          </motion.div>

          {/* Yield Optimization Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
              <CardHeader>
                <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#00b894]" />
                  REAL-TIME YIELD DATA
                </CardTitle>
                <p className="text-sm font-mono text-[#2d3748]">
                  POWERED BY CHAINLINK FUNCTIONS • UPDATED EVERY 30 SECONDS
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border-4 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332]">
                  <Table>
                    <TableHeader className="bg-[#1a2332]">
                      <TableRow>
                        <TableHead className="text-white font-black font-space-grotesk">CHAIN</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk">APY</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk">TVL</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk">GAS</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chainData.map((chain, index) => (
                        <motion.tr
                          key={chain.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b-2 border-[#f5f5f5] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <TableCell className="font-bold font-space-grotesk text-[#1a2332]">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full border-2 border-[#1a2332]"
                                style={{ backgroundColor: chain.color }}
                              />
                              {chain.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black font-space-grotesk text-[#00b894]">
                                {chain.yield}%
                              </span>
                              {chain.yield > 5 && (
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                                >
                                  <TrendingUp className="w-4 h-4 text-[#00b894]" />
                                </motion.div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-[#2d3748]">
                            {chain.tvl}
                          </TableCell>
                          <TableCell className="font-mono text-[#2d3748]">
                            {chain.gasEstimate}
                          </TableCell>
                          <TableCell>
                            {chain.isRecommended ? (
                              <Badge className="bg-[#00b894] text-white font-bold font-space-grotesk px-3 py-1 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332]">
                                🎯 OPTIMAL
                              </Badge>
                            ) : (
                              <Badge 
                                variant="outline"
                                className="bg-white border-2 border-[#1a2332] text-[#1a2332] font-bold font-space-grotesk px-3 py-1 shadow-[2px_2px_0px_0px_#4a90e2]"
                              >
                                AVAILABLE
                              </Badge>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Auto-selection explanation */}
                <div className="mt-4 p-4 bg-[#f5f5f5] border-4 border-[#4a90e2] shadow-[4px_4px_0px_0px_#4a90e2]">
                  <p className="text-sm font-bold font-space-grotesk text-[#1a2332] mb-2">
                    🧠 AI-POWERED CHAIN SELECTION
                  </p>
                  <p className="text-sm font-mono text-[#2d3748]">
                    OmniFi automatically selects the optimal destination chain based on real-time yield data, 
                    gas costs, and liquidity. Current recommendation: 
                    <span className="font-bold text-[#00b894]"> {getRecommendedChain().name}</span> 
                    with <span className="font-bold text-[#00b894]">{getRecommendedChain().yield}% APY</span>.
                  </p>
                </div>

              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Transfer Status */}
        {transferState.status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
              <CardHeader>
                <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#4a90e2]" />
                  TRANSFER STATUS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#f5f5f5] border-4 border-[#4a90e2] p-4 shadow-[4px_4px_0px_0px_#4a90e2]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transferState.status)}
                          <span className="font-black font-space-grotesk text-[#1a2332]">
                            {transferState.burnAmount || transferAmount} CCT
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#2d3748]" />
                          <span className="font-bold font-space-grotesk text-[#2d3748]">
                            Fuji → Base Sepolia
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`font-bold font-space-grotesk px-2 py-1 border-2 border-[#1a2332] ${
                            transferState.status === 'completed' 
                              ? 'bg-[#00b894] text-white shadow-[2px_2px_0px_0px_#1a2332]'
                              : transferState.status === 'error'
                              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_#1a2332]'
                              : 'bg-[#fdcb6e] text-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332]'
                          }`}>
                            {getStatusText(transferState.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {transferState.txHash && (
                          <p className="text-xs font-mono text-[#4a90e2] break-all max-w-32">
                            {transferState.txHash.slice(0, 10)}...
                          </p>
                        )}
                        {transferState.error && (
                          <p className="text-xs font-mono text-red-500 mt-1">
                            {transferState.error}
                          </p>
                        )}
                        {transferState.bridgeNote && (
                          <p className="text-xs font-mono text-blue-600 mt-1">
                            🌉 {transferState.bridgeNote}
                          </p>
                        )}
                        {transferState.status === 'waiting' && (
                          <div className="mt-2 space-y-2">
                            <Button
                              onClick={handleManualMint}
                              className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold font-space-grotesk px-4 py-2 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332] block"
                            >
                              Complete Bridge Transfer
                            </Button>
                            <p className="text-xs font-mono text-[#2d3748]">
                              🔧 In production, this would be automated by bridge infrastructure
                            </p>
                          </div>
                        )}
                        {transferState.status === 'completed' && transferState.bridgeNote && (
                          <div className="mt-2">
                            <Badge className="bg-blue-500 text-white font-bold font-space-grotesk px-2 py-1 border-2 border-[#1a2332]">
                              🌉 {transferState.bridgeNote.includes('Real') ? 'REAL' : 'BRIDGE'} TRANSFER
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        </div>
      </div>
    </div>
  )
}
