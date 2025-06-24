'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupPage() {
  const [customErc20Address, setCustomErc20Address] = useState('');
  const [vaultAddress, setVaultAddress] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if environment variables are configured
    const erc20 = process.env.NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS;
    const vault = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
    
    if (erc20 && vault) {
      setCustomErc20Address(erc20);
      setVaultAddress(vault);
      setIsConfigured(true);
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const openExplorer = (address: string) => {
    window.open(`https://testnet.snowtrace.io/address/${address}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-[#1a2332] tracking-tight">
            OMNI<span className="text-[#4a90e2]">FI</span> SETUP
          </h1>
          <p className="text-xl text-[#1a2332] font-bold">
            Configuration & Contract Deployment Guide
          </p>
        </div>

        {/* Configuration Status */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1a2332] flex items-center gap-2">
              {isConfigured ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              )}
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConfigured ? (
              <Alert className="border-2 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 font-semibold">
                  ✅ Contracts are configured! You can use the vault functionality.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-2 border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700 font-semibold">
                  ⚠️ Contracts not configured. Please deploy contracts and update environment variables.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Deployment Steps */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1a2332]">
              Step 1: Deploy Contracts
            </CardTitle>
            <CardDescription className="text-[#1a2332] font-semibold">
              Deploy the smart contracts to Avalanche Fuji testnet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#1a2332] text-white p-4 rounded-lg font-mono text-sm space-y-2">
              <div># Navigate to hardhat directory</div>
              <div>cd hardhat</div>
              <div className="mt-2"># Install dependencies</div>
              <div>npm install</div>
              <div className="mt-2"># Set up environment variables</div>
              <div>cp .env.example .env</div>
              <div># Edit .env with your private key</div>
              <div className="mt-2"># Deploy to Fuji testnet</div>
              <div>npx hardhat run scripts/deploy.ts --network fuji</div>
            </div>
            
            <Alert className="border-2 border-[#4a90e2] bg-blue-50">
              <AlertDescription className="text-[#1a2332] font-semibold">
                💡 Make sure you have AVAX in your wallet from the faucet: 
                <a href="https://faucet.avax.network/" target="_blank" className="text-[#4a90e2] underline ml-1">
                  https://faucet.avax.network/
                </a> (use code: avalanche-academy)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Environment Setup */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1a2332]">
              Step 2: Configure Environment Variables
            </CardTitle>
            <CardDescription className="text-[#1a2332] font-semibold">
              Update your .env.local file with the deployed contract addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="erc20-address" className="text-[#1a2332] font-bold">
                  CustomERC20 Contract Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="erc20-address"
                    value={customErc20Address}
                    onChange={(e) => setCustomErc20Address(e.target.value)}
                    placeholder="0x..."
                    className="border-2 border-[#1a2332] focus:border-[#4a90e2] font-mono"
                  />
                  {customErc20Address && (
                    <>
                      <Button
                        onClick={() => copyToClipboard(customErc20Address, 'ERC20 Address')}
                        variant="outline"
                        size="icon"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => openExplorer(customErc20Address)}
                        variant="outline"
                        size="icon"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vault-address" className="text-[#1a2332] font-bold">
                  Vault Contract Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="vault-address"
                    value={vaultAddress}
                    onChange={(e) => setVaultAddress(e.target.value)}
                    placeholder="0x..."
                    className="border-2 border-[#1a2332] focus:border-[#4a90e2] font-mono"
                  />
                  {vaultAddress && (
                    <>
                      <Button
                        onClick={() => copyToClipboard(vaultAddress, 'Vault Address')}
                        variant="outline"
                        size="icon"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => openExplorer(vaultAddress)}
                        variant="outline"
                        size="icon"
                        className="border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {customErc20Address && vaultAddress && (
              <div className="space-y-4">
                <div className="bg-[#1a2332] text-white p-4 rounded-lg font-mono text-sm space-y-1">
                  <div># Add these to your .env.local file:</div>
                  <div>NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS={customErc20Address}</div>
                  <div>NEXT_PUBLIC_VAULT_ADDRESS={vaultAddress}</div>
                </div>
                
                <Button
                  onClick={() => copyToClipboard(
                    `NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS=${customErc20Address}\nNEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`,
                    'Environment variables'
                  )}
                  className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Environment Variables
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1a2332]">
              Step 3: Test the Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-black text-[#1a2332]">🔄 Restart Development Server</h3>
                <p className="text-sm text-[#1a2332] font-semibold">After updating environment variables, restart your dev server.</p>
                <div className="bg-[#1a2332] text-white p-2 rounded text-sm font-mono">
                  npm run dev
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-black text-[#1a2332]">🚀 Visit Vault Page</h3>
                <p className="text-sm text-[#1a2332] font-semibold">Go to the vault page to interact with your contracts.</p>
                <Button
                  onClick={() => window.location.href = '/vault'}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold border-2 border-[#1a2332] shadow-[4px_4px_0px_0px_#1a2332] hover:shadow-[2px_2px_0px_0px_#1a2332] transition-all hover:text-white"
                >
                  Go to Vault →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1a2332]">
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-red-500 text-red-500 font-bold">
                    Contract Not Found
                  </Badge>
                  <p className="text-sm text-[#1a2332] font-semibold">
                    Make sure contract addresses are correct and deployed to Fuji testnet.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="border-orange-500 text-orange-500 font-bold">
                    Wallet Connection Issues
                  </Badge>
                  <p className="text-sm text-[#1a2332] font-semibold">
                    Ensure MetaMask is connected to Avalanche Fuji testnet (Chain ID: 43113).
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-500 font-bold">
                    No AVAX for Gas
                  </Badge>
                  <p className="text-sm text-[#1a2332] font-semibold">
                    Get testnet AVAX from the faucet using code "avalanche-academy".
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="border-purple-500 text-purple-500 font-bold">
                    Environment Variables
                  </Badge>
                  <p className="text-sm text-[#1a2332] font-semibold">
                    Restart the dev server after updating .env.local file.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
