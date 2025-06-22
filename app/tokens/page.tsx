"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";

const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
const CHAIN_ID = 43113; // Avalanche Fuji

// Helper to format token balances
function formatTokenBalance(balance: number) {
  if (balance === 0) return '0';
  if (balance < 0.000001 && balance > 0) return balance.toExponential(2);
  // Show up to 6 significant digits, trim trailing zeros
  const str = balance.toLocaleString(undefined, { maximumSignificantDigits: 6 });
  // Remove trailing .0 or .000...
  return str.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}

export default function TokensPage() {
  const { user, authenticated, ready } = usePrivy();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("TokensPage useEffect running", { authenticated, ready, user });
    const fetchTokens = async () => {
      if (!user?.wallet?.address || !COVALENT_API_KEY) return;
      console.log("Using wallet address:", user.wallet.address);
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.covalenthq.com/v1/${CHAIN_ID}/address/${user.wallet.address}/balances_v2/?key=${COVALENT_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Raw Covalent API response:", data);
        if (data.error) throw new Error(data.error_message || "API error");
        const filtered = data.data.items.filter(
          (item: any) =>
            item.contract_address &&
            item.contract_address !== "0x0000000000000000000000000000000000000000" &&
            item.contract_ticker_symbol !== "AVAX" &&
            item.balance && item.balance !== "0"
        );
        console.log("Filtered tokens:", filtered);
        setTokens(filtered);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tokens");
      } finally {
        setLoading(false);
      }
    };
    if (authenticated && ready) fetchTokens();
  }, [user, authenticated, ready]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-7xl w-full mx-auto">
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2] mb-10">
          <CardHeader>
            <CardTitle className="text-3xl font-black font-space-grotesk text-[#1a2332] text-center">Your Tokens</CardTitle>
          </CardHeader>
        </Card>
        {!ready || loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[#4a90e2] mb-4" />
            <span className="text-lg font-mono font-bold text-[#2d3748]">Loading tokens...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-mono font-bold py-8">{error}</div>
        ) : !authenticated ? (
          <div className="text-center text-[#2d3748] font-mono font-bold py-8">Connect your wallet to view tokens.</div>
        ) : tokens.length === 0 ? (
          <div className="text-center text-[#2d3748] font-mono font-bold py-8">No tokens found for this wallet.</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4"
          >
            {tokens.map((token, idx) => (
              <motion.div
                key={token.contract_address}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + idx * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.025, boxShadow: "16px 16px 0px 0px #4a90e2" }}
                whileTap={{ scale: 0.98, boxShadow: "8px 8px 0px 0px #1a2332" }}
                className="h-full flex flex-col justify-between"
              >
                <Card
                  className="bg-white border-4 border-[#4a90e2] shadow-[12px_12px_0px_0px_#1a2332] rounded-xl p-6 flex flex-col h-full min-h-[340px] transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#4a90e2] border-4 border-[#1a2332] flex items-center justify-center shadow-[4px_4px_0px_0px_#1a2332]">
                      {/* Lucide icon for ERC-20 */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h8M12 8v8" /></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-black font-space-grotesk text-[#1a2332] text-xl">{token.contract_name || "Unknown Token"}</div>
                      <div className="font-mono text-[#4a90e2] text-base">{token.contract_ticker_symbol}</div>
                    </div>
                    <div>
                      <span className="inline-block"><span className="bg-[#6c5ce7] text-white font-bold font-space-grotesk px-3 py-1 border-2 border-[#1a2332] shadow-[2px_2px_0px_0px_#1a2332] rounded-full text-xs">ERC-20</span></span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="font-mono text-[#2d3748] text-xs break-all">{token.contract_address}</div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <div className="font-black text-2xl text-[#1a2332]">{formatTokenBalance(Number(token.balance) / 10 ** token.contract_decimals)}</div>
                      <div className="font-mono text-[#2d3748] text-xs">Balance</div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <motion.a
                        href={`https://testnet.snowtrace.io/address/${token.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <button className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-black font-space-grotesk px-4 py-2 border-4 border-[#4a90e2] shadow-[8px_8px_0px_0px_#1a2332] hover:shadow-[12px_12px_0px_0px_#1a2332] transition-all text-xs rounded">
                          View on Snowtrace
                        </button>
                      </motion.a>
                      <motion.button
                        className="bg-white border-4 border-[#1a2332] text-[#1a2332] hover:bg-gray-100 font-black font-space-grotesk px-4 py-2 shadow-[4px_4px_0px_0px_#4a90e2] text-xs rounded transition-all"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => {
                          if (window.ethereum) {
                            (window.ethereum as any).request({
                              method: 'wallet_watchAsset',
                              params: {
                                type: 'ERC20',
                                options: {
                                  address: token.contract_address,
                                  symbol: token.contract_ticker_symbol,
                                  decimals: token.contract_decimals,
                                  image: '',
                                },
                              },
                            });
                          }
                        }}
                      >
                        Add to Wallet
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
} 