'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contractVerifier } from '@/lib/contract-verifier';
import { ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ContractStatus {
  name: string;
  address: string;
  isValid: boolean;
  error?: string;
}

export default function ContractsPage() {
  const [contractStatuses, setContractStatuses] = useState<ContractStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkContracts = async () => {
    setIsLoading(true);
    
    const contracts = [
      {
        name: 'Real World Asset Tokens (RWA TOKENS)',
        address: process.env.NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS || '',
        type: 'ERC20'
      },
      {
        name: 'Vault Contract',
        address: process.env.NEXT_PUBLIC_VAULT_ADDRESS || '',
        type: 'Vault'
      }
    ];

    const statuses: ContractStatus[] = [];

    for (const contract of contracts) {
      try {
        const isValid = await contractVerifier.verifyContract(contract.address, contract.type);
        statuses.push({
          name: contract.name,
          address: contract.address,
          isValid
        });
      } catch (error: any) {
        statuses.push({
          name: contract.name,
          address: contract.address,
          isValid: false,
          error: error.message
        });
      }
    }

    setContractStatuses(statuses);
    setIsLoading(false);
  };

  useEffect(() => {
    checkContracts();
  }, []);

  const explorerUrl = 'https://testnet.snowtrace.io';

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a90e2_1px,transparent_1px),linear-gradient(90deg,#4a90e2_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-[#1a2332] font-space-grotesk tracking-wider mb-2">Contract Status</h1>
          <p className="text-lg text-[#2d3748] font-mono font-bold">Check the deployment status of OmniFi smart contracts on Avalanche Fuji testnet.</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#4a90e2] border-2 border-[#1a2332] text-white font-bold font-space-grotesk px-3 py-1 shadow-[2px_2px_0px_0px_#1a2332]">Avalanche Fuji Testnet</Badge>
            <Badge className="bg-[#1a2332] border-2 border-[#4a90e2] text-white font-bold font-space-grotesk px-3 py-1 shadow-[2px_2px_0px_0px_#4a90e2]">Chain ID: 43113</Badge>
          </div>
          <Button 
            onClick={checkContracts} 
            disabled={isLoading}
            className="bg-white border-4 border-[#4a90e2] text-[#1a2332] font-black font-space-grotesk px-6 py-2 shadow-[4px_4px_0px_0px_#4a90e2] hover:shadow-[6px_6px_0px_0px_#4a90e2] transition-all hover:text-white"
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {contractStatuses.map((contract, index) => (
            <Card key={index} className="bg-white border-4 border-[#1a2332] shadow-[8px_8px_0px_0px_#4a90e2]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black font-space-grotesk text-[#1a2332]">{contract.name}</CardTitle>
                  {contract.isValid ? (
                    <Badge className="bg-[#00b894] border-2 border-[#1a2332] text-white font-bold font-space-grotesk px-3 py-1 shadow-[2px_2px_0px_0px_#1a2332] flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Deployed
                    </Badge>
                  ) : (
                    <Badge className="bg-[#fdcb6e] border-2 border-[#1a2332] text-[#1a2332] font-bold font-space-grotesk px-3 py-1 shadow-[2px_2px_0px_0px_#4a90e2] flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      Not Found
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold font-space-grotesk text-[#2d3748]">Contract Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-[#f5f5f5] border border-gray-300 px-2 py-1 rounded text-sm font-mono text-[#1a2332]">{contract.address || 'Not configured'}</code>
                      {contract.address && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-[#4a90e2]/10 hover:text-white"
                          asChild
                        >
                          <a
                            href={`${explorerUrl}/address/${contract.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {contract.error && (
                    <div className="bg-[#fd79a8]/10 border-2 border-[#fd79a8] rounded-md p-4 shadow-[2px_2px_0px_0px_#fd79a8]">
                      <p className="text-sm font-bold font-space-grotesk text-[#fd79a8]">
                        <strong>Error:</strong> {contract.error}
                      </p>
                    </div>
                  )}

                  {!contract.address && (
                    <div className="bg-[#fdcb6e]/10 border-2 border-[#fdcb6e] rounded-md p-4 shadow-[2px_2px_0px_0px_#fdcb6e]">
                      <p className="text-sm font-bold font-space-grotesk text-[#b8860b]">
                        <strong>Missing Configuration:</strong> Add this contract address to your <code className="bg-white border border-gray-300 px-1 rounded">.env.local</code> file.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
