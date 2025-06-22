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
        name: 'Carbon Credit Token (CCT)',
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contract Status</h1>
        <p className="text-muted-foreground">
          Check the deployment status of OmniFi smart contracts on Avalanche Fuji testnet.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Avalanche Fuji Testnet
          </Badge>
          <Badge variant="outline">
            Chain ID: 43113
          </Badge>
        </div>
        
        <Button 
          onClick={checkContracts} 
          disabled={isLoading}
          variant="outline"
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

      <div className="grid gap-4">
        {contractStatuses.map((contract, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contract.name}</CardTitle>
                {contract.isValid ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Deployed
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Found
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contract Address
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {contract.address || 'Not configured'}
                    </code>
                    {contract.address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`${explorerUrl}/address/${contract.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {contract.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {contract.error}
                    </p>
                  </div>
                )}

                {!contract.address && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Missing Configuration:</strong> Add this contract address to your <code>.env.local</code> file.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">If contracts are not found:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Check that contract addresses are correctly set in your <code>.env.local</code> file</li>
              <li>Verify contracts are deployed to Avalanche Fuji testnet (Chain ID: 43113)</li>
              <li>Make sure you're connected to the correct network</li>
              <li>Try redeploying contracts using the Hardhat deployment scripts</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Next steps:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>If all contracts show as deployed, you can proceed to the <a href="/vault" className="text-blue-600 hover:underline">Vault page</a></li>
              <li>If contracts are missing, deploy them using: <code>cd hardhat && npx hardhat run scripts/deploy.ts --network fuji</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
