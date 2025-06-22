'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Leaf, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { web3Service } from '@/lib/web3';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export function TokenMinter() {
  const { user, authenticated } = usePrivy();
  const [amount, setAmount] = useState('100');
  const [isMinting, setIsMinting] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [userBalance, setUserBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTokenInfo();
  }, [authenticated, user?.wallet?.address]);

  const loadTokenInfo = async () => {
    if (!authenticated || !user?.wallet?.address) return;
    
    try {
      setIsLoading(true);
      await web3Service.initialize();
      
      const [info, balance] = await Promise.all([
        web3Service.getTokenInfo(),
        web3Service.getTokenBalance(user.wallet.address)
      ]);
      
      setTokenInfo(info);
      setUserBalance(balance);
    } catch (error) {
      console.error('Failed to load token info:', error);
      toast.error('Failed to load token information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!authenticated || !user?.wallet?.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > 1000) {
      toast.error('Cannot mint more than 1000 tokens at once');
      return;
    }

    try {
      setIsMinting(true);
      
      const tx = await web3Service.mintTokens(amount);
      toast.success('Minting transaction submitted!');
      
      // Wait for transaction to be mined
      await tx.wait();
      toast.success(`Successfully minted ${amount} CCT tokens!`);
      
      // Refresh balance
      await loadTokenInfo();
      setAmount('100');
    } catch (error: any) {
      console.error('Minting failed:', error);
      toast.error(error.message || 'Failed to mint tokens');
    } finally {
      setIsMinting(false);
    }
  };

  const presetAmounts = ['10', '100', '500', '1000'];

  if (!authenticated) {
    return (
      <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#fd79a8] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
              <Wallet className="w-8 h-8 text-[#1a2332]" />
            </div>
          </div>
          <h3 className="text-xl font-black font-space-grotesk text-[#1a2332] mb-2">
            CONNECT WALLET
          </h3>
          <p className="text-[#2d3748] font-mono">
            Connect your wallet to mint Carbon Credit Tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Info Card */}
      <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-[#00b894] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[2px_2px_0px_0px_#1a2332]"
            >
              <Coins className="w-5 h-5 text-white" />
            </motion.div>
            CARBON CREDIT TOKENS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#4a90e2]" />
            </div>
          ) : (
            <>
              {tokenInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-bold font-space-grotesk text-[#1a2332]">
                        TOKEN NAME
                      </Label>
                      <p className="text-lg font-mono font-bold text-[#2d3748]">
                        {tokenInfo.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-bold font-space-grotesk text-[#1a2332]">
                        SYMBOL
                      </Label>
                      <Badge className="bg-[#4a90e2] text-white font-bold font-space-grotesk px-3 py-1 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332]">
                        {tokenInfo.symbol}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-bold font-space-grotesk text-[#1a2332]">
                        YOUR BALANCE
                      </Label>
                      <p className="text-2xl font-black font-space-grotesk text-[#00b894]">
                        {parseFloat(userBalance).toFixed(2)} {tokenInfo.symbol}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-bold font-space-grotesk text-[#1a2332]">
                        TOTAL SUPPLY
                      </Label>
                      <p className="text-lg font-mono font-bold text-[#2d3748]">
                        {parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Minting Card */}
      <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#00b894]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-space-grotesk text-[#1a2332] flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 bg-[#fdcb6e] border-4 border-[#1a2332] rounded-none flex items-center justify-center shadow-[2px_2px_0px_0px_#1a2332]"
            >
              <Sparkles className="w-5 h-5 text-[#1a2332]" />
            </motion.div>
            MINT TOKENS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold font-space-grotesk text-[#1a2332] mb-2 block">
                AMOUNT TO MINT
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max="1000"
                placeholder="Enter amount"
                className="bg-white border-4 border-[#4a90e2] text-[#1a2332] placeholder:text-gray-500 font-bold font-space-grotesk shadow-[4px_4px_0px_0px_#4a90e2] focus:shadow-[6px_6px_0px_0px_#4a90e2] transition-all"
              />
              <p className="text-xs text-[#2d3748] font-mono mt-1">
                Maximum: 1000 tokens per transaction
              </p>
            </div>

            {/* Preset Amounts */}
            <div>
              <Label className="text-sm font-bold font-space-grotesk text-[#1a2332] mb-2 block">
                QUICK SELECT
              </Label>
              <div className="flex gap-2 flex-wrap">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset)}
                    className={`
                      font-bold font-space-grotesk border-2 rounded-none shadow-[2px_2px_0px_0px_#1a2332] hover:shadow-[4px_4px_0px_0px_#1a2332] transition-all
                      ${amount === preset 
                        ? 'bg-[#4a90e2] text-white border-[#4a90e2]' 
                        : 'bg-white text-[#1a2332] border-[#1a2332] hover:bg-[#f5f5f5]'
                      }
                    `}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mint Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={handleMint}
                disabled={isMinting || !amount || parseFloat(amount) <= 0}
                className="w-full bg-[#00b894] hover:bg-[#00a085] text-white font-black font-space-grotesk px-8 py-4 text-lg border-4 border-[#00b894] rounded-none shadow-[8px_8px_0px_0px_#1a2332] hover:shadow-[12px_12px_0px_0px_#1a2332] transition-all duration-200"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    MINTING...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-3 h-6 w-6" />
                    MINT {amount} CCT TOKENS
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Info Box */}
          <div className="bg-[#f5f5f5] border-4 border-[#4a90e2] p-4 rounded-none shadow-[4px_4px_0px_0px_#4a90e2]">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00b894] mt-0.5" />
              <div>
                <p className="font-bold font-space-grotesk text-[#1a2332] mb-1">
                  ABOUT CARBON CREDIT TOKENS
                </p>
                <p className="text-sm text-[#2d3748] font-mono">
                  Each CCT token represents 1 metric ton of CO2 equivalent carbon credit. 
                  Use these tokens to deposit into the vault and earn optimized yields.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
