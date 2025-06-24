"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Coins, TrendingUp, Globe, ArrowUpRight, ArrowDownRight, Link, Zap } from "lucide-react"
import { useCrossChainTransfer } from "@/hooks/useCrossChainTransfer"
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'

interface ChainBalance {
  chainId: string
  chainName: string
  symbol: string
  balance: string
  usdValue: string
  color: string
  apy: number
  change24h: number
  tvl: string
  isActive: boolean
}

interface MultiChainBalanceProps {
  userAddress?: string
  showHeader?: boolean
  compact?: boolean
}

export function MultiChainBalance({ userAddress, showHeader = true, compact = false }: MultiChainBalanceProps) {
  const { authenticated, user } = usePrivy()
  const { 
    balances: realBalances, 
    isLoading: isLoadingBalances, 
    fetchBalances 
  } = useCrossChainTransfer()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Convert real balances to display format
  const balances: ChainBalance[] = [
    {
      chainId: "43113",
      chainName: "Avalanche Fuji",
      symbol: "CCT",
      balance: realBalances.find(b => b.chainId === "43113")?.balance || "0.00",
      usdValue: realBalances.find(b => b.chainId === "43113")?.usdValue || "0.00",
      color: "#e84142",
      apy: 4.2,
      change24h: 2.3,
      tvl: "$2.4M",
      isActive: true
    },
    {
      chainId: "84532", 
      chainName: "Base Sepolia",
      symbol: "CCT",
      balance: realBalances.find(b => b.chainId === "84532")?.balance || "0.00",
      usdValue: realBalances.find(b => b.chainId === "84532")?.usdValue || "0.00",
      color: "#0052ff",
      apy: 5.8,
      change24h: 1.8,
      tvl: "$1.8M",
      isActive: true
    },
    {
      chainId: "11155111",
      chainName: "Ethereum Sepolia",
      symbol: "CCT", 
      balance: "0.00",
      usdValue: "0.00",
      color: "#627eea",
      apy: 3.1,
      change24h: -0.5,
      tvl: "$5.2M",
      isActive: false
    }
  ]

  const totalUsdValue = balances.reduce((sum, chain) => {
    return sum + parseFloat(chain.usdValue.replace(',', ''))
  }, 0)

  const totalTokens = balances.reduce((sum, chain) => {
    return sum + parseFloat(chain.balance.replace(',', ''))
  }, 0)

  // Fetch balances when user connects
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      console.log('Fetching balances for user:', user.wallet.address)
      fetchBalances()
    }
  }, [authenticated, user?.wallet?.address, fetchBalances])

  const handleRefresh = async () => {
    if (!authenticated) {
      toast.error('Please connect your wallet first')
      return
    }
    
    console.log('Manual refresh triggered')
    setIsRefreshing(true)
    try {
      await fetchBalances()
      toast.success('Balances refreshed!')
    } catch (error) {
      console.error('Error refreshing balances:', error)
      toast.error('Failed to refresh balances')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (compact) {
    return (
      <Card className="bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2]">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black font-space-grotesk text-[#1a2332] text-lg">TOTAL BALANCE</h3>
              <p className="text-2xl font-black font-space-grotesk text-[#4a90e2]">
                {totalTokens.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CCT
              </p>
              <p className="text-sm font-mono text-[#2d3748]">
                ≈ ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingBalances || !authenticated}
              variant="outline"
              size="sm"
              className="bg-white border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#f5f5f5] font-bold font-space-grotesk shadow-[2px_2px_0px_0px_#4a90e2]"
            >
              <motion.div
                animate={(isRefreshing || isLoadingBalances) ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: (isRefreshing || isLoadingBalances) ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>
          
          <div className="space-y-2">
            {balances.filter(chain => parseFloat(chain.balance.replace(',', '')) > 0).map((chain) => (
              <div key={chain.chainId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-[#1a2332]"
                    style={{ backgroundColor: chain.color }}
                  />
                  <span className="font-bold font-space-grotesk text-[#1a2332] text-sm">
                    {chain.chainName}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold font-space-grotesk text-[#1a2332]">
                    {chain.balance} CCT
                  </p>
                  <p className="text-xs font-mono text-[#2d3748]">
                    ${chain.usdValue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
      {showHeader && (
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#4a90e2]" />
                MULTI-CHAIN BALANCE
              </CardTitle>
              <p className="text-sm font-mono text-[#2d3748] mt-1">
                CROSS-CHAIN PORTFOLIO OVERVIEW
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingBalances || !authenticated}
              variant="outline"
              className="bg-white border-4 border-[#4a90e2] text-[#4a90e2] hover:bg-[#f5f5f5] font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
            >
              <motion.div
                animate={(isRefreshing || isLoadingBalances) ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: (isRefreshing || isLoadingBalances) ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              REFRESH
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        
        {/* Total Portfolio Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#f5f5f5] border-4 border-[#4a90e2] p-4 shadow-[4px_4px_0px_0px_#4a90e2]">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-[#4a90e2]" />
              <span className="font-bold font-space-grotesk text-[#1a2332]">TOTAL TOKENS</span>
            </div>
            <p className="text-2xl font-black font-space-grotesk text-[#1a2332]">
              {totalTokens.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CCT
            </p>
          </div>
          
          <div className="bg-[#f5f5f5] border-4 border-[#00b894] p-4 shadow-[4px_4px_0px_0px_#00b894]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#00b894]" />
              <span className="font-bold font-space-grotesk text-[#1a2332]">USD VALUE</span>
            </div>
            <p className="text-2xl font-black font-space-grotesk text-[#1a2332]">
              ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-[#f5f5f5] border-4 border-[#6c5ce7] p-4 shadow-[4px_4px_0px_0px_#6c5ce7]">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-5 h-5 text-[#6c5ce7]" />
              <span className="font-bold font-space-grotesk text-[#1a2332]">CHAINS</span>
            </div>
            <p className="text-2xl font-black font-space-grotesk text-[#1a2332]">
              {balances.filter(chain => parseFloat(chain.balance.replace(',', '')) > 0).length} / {balances.length}
            </p>
          </div>
        </div>

        {/* Chain-by-Chain Breakdown */}
        <div className="space-y-4">
          <h3 className="font-black font-space-grotesk text-[#1a2332] text-lg">CHAIN BREAKDOWN</h3>
          
          {balances.map((chain, index) => (
            <motion.div
              key={chain.chainId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#f5f5f5] border-4 border-[#4a90e2] p-4 shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-[#1a2332]"
                      style={{ backgroundColor: chain.color }}
                    />
                    <span className="font-black font-space-grotesk text-[#1a2332] text-lg">
                      {chain.chainName}
                    </span>
                    {!chain.isActive && (
                      <Badge 
                        variant="outline"
                        className="bg-white border-2 border-[#2d3748] text-[#2d3748] font-bold font-space-grotesk px-2 py-1"
                      >
                        INACTIVE
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-bold font-space-grotesk text-[#2d3748]">BALANCE</p>
                      <p className="text-xl font-black font-space-grotesk text-[#1a2332]">
                        {chain.balance} {chain.symbol}
                      </p>
                      <p className="text-sm font-mono text-[#2d3748]">
                        ≈ ${chain.usdValue}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-bold font-space-grotesk text-[#2d3748]">APY</p>
                      <p className="text-lg font-black font-space-grotesk text-[#00b894]">
                        {chain.apy}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-bold font-space-grotesk text-[#2d3748]">24H CHANGE</p>
                      <div className="flex items-center gap-1">
                        {chain.change24h >= 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-[#00b894]" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-bold font-space-grotesk ${
                          chain.change24h >= 0 ? 'text-[#00b894]' : 'text-red-500'
                        }`}>
                          {Math.abs(chain.change24h).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold font-space-grotesk text-[#2d3748]">TVL</p>
                  <p className="text-lg font-black font-space-grotesk text-[#4a90e2]">
                    {chain.tvl}
                  </p>
                  {parseFloat(chain.balance.replace(',', '')) > 0 && (
                    <Badge className="mt-2 bg-[#00b894] text-white font-bold font-space-grotesk px-2 py-1 border-2 border-[#1a2332]">
                      ACTIVE
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-6 py-3 border-4 border-[#4a90e2] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[6px_6px_0px_0px_#1a2332] transition-all"
            onClick={() => window.location.href = '/transfer'}
          >
            <Zap className="mr-2 h-4 w-4" />
            CROSS-CHAIN TRANSFER
          </Button>
          
          <Button
            variant="outline"
            className="bg-white border-4 border-[#1a2332] text-[#1a2332] hover:bg-[#f5f5f5] font-black font-space-grotesk px-6 py-3 shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
            onClick={() => window.location.href = '/tokenize'}
          >
            <Coins className="mr-2 h-4 w-4" />
            MINT MORE TOKENS
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
