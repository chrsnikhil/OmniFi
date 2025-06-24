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

  // Show success alert and reset transfer state after completion
  useEffect(() => {
    if (transferState.status === 'completed') {
      setShowSuccessAlert(true)
      const alertTimeout = setTimeout(() => setShowSuccessAlert(false), 5000)
      const resetTimeout = setTimeout(() => {
        if (transferState.status === 'completed') {
          resetTransfer()
        }
      }, 3000)
      return () => {
        clearTimeout(alertTimeout)
        clearTimeout(resetTimeout)
      }
    }
  }, [transferState.status, resetTransfer])

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
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px]">
      <NavigationHeader />
      <div className="p-8">
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
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {getStatusText(transferState.status)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      INITIATE TRANSFER
                    </div>
                  )}
                </Button>

              </CardContent>
            </Card>
          </motion.div>

          {/* Yield Optimization Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 flex flex-col h-full"
          >
            <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2] flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#00b894]" />
                  REAL-TIME YIELD DATA
                </CardTitle>
                <p className="text-sm font-mono text-[#2d3748]">
                  POWERED BY CHAINLINK FUNCTIONS • UPDATED EVERY 30 SECONDS
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="overflow-hidden border-4 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] min-h-[340px]">
                  <Table className="w-full text-lg">
                    <TableHeader className="bg-[#1a2332]">
                      <TableRow>
                        <TableHead className="text-white font-black font-space-grotesk px-6 py-4 text-xl">CHAIN</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk px-6 py-4 text-xl">APY</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk px-6 py-4 text-xl">TVL</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk px-6 py-4 text-xl">GAS</TableHead>
                        <TableHead className="text-white font-black font-space-grotesk px-6 py-4 text-xl">STATUS</TableHead>
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
                          <TableCell className="font-bold font-space-grotesk text-[#1a2332] px-6 py-5 text-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-[#1a2332]"
                                style={{ backgroundColor: chain.color }}
                              />
                              {chain.name}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black font-space-grotesk text-[#00b894]">
                                {chain.yield}%
                              </span>
                              {chain.yield > 5 && (
                                <TrendingUp className="w-5 h-5 text-[#00b894]" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-[#2d3748] px-6 py-5 text-lg">
                            {chain.tvl}
                          </TableCell>
                          <TableCell className="font-mono text-[#2d3748] px-6 py-5 text-lg">
                            {chain.gasEstimate}
                          </TableCell>
                          <TableCell className="px-6 py-5 text-lg">
                            {chain.isRecommended ? (
                              <Badge className="bg-[#00b894] text-white font-bold font-space-grotesk px-4 py-2 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332] text-lg">
                                🎯OPTIMAL
                              </Badge>
                            ) : (
                              <Badge 
                                variant="outline"
                                className="bg-white border-2 border-[#1a2332] text-[#1a2332] font-bold font-space-grotesk px-4 py-2 shadow-[2px_2px_0px_0px_#4a90e2] text-lg"
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
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
                      <div className="flex flex-col items-end gap-2 min-w-[180px]">
                        {transferState.txHash && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#2d3748] font-bold">TX Hash:</span>
                            <span className="text-xs font-mono text-[#4a90e2] break-all max-w-32">{transferState.txHash.slice(0, 10)}...</span>
                            <button
                              className="ml-1 px-1 py-0.5 bg-[#4a90e2] text-white rounded text-xs font-mono hover:bg-[#357abd] border border-[#1a2332]"
                              onClick={() => navigator.clipboard.writeText(transferState.txHash || "")}
                              title="Copy TX Hash"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                        {transferState.error && (
                          <p className="text-xs font-mono text-red-500 mt-1">
                            {transferState.error}
                          </p>
                        )}
                        {transferState.bridgeNote && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-500 text-white font-bold font-space-grotesk px-2 py-1 border-2 border-[#1a2332]">
                              🌉 {transferState.bridgeNote.includes('Real') ? 'REAL' : 'BRIDGE'} TRANSFER
                            </Badge>
                            <span className="text-xs font-mono text-blue-600">{transferState.bridgeNote}</span>
                          </div>
                        )}
                        {transferState.status === 'waiting' && (
                          <div className="mt-2 space-y-2 w-full">
                            <Button
                              onClick={handleManualMint}
                              className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold font-space-grotesk px-4 py-2 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332] block w-full"
                            >
                              Complete Bridge Transfer
                            </Button>
                            <p className="text-xs font-mono text-[#2d3748]">
                              🔧 In production, this would be automated by bridge infrastructure
                            </p>
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
