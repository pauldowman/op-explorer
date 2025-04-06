import React, {useEffect, useState} from 'react';
import { createPublicClient, http, formatGwei, PublicClient, Address } from 'viem';
import { systemConfigABI } from '@eth-optimism/contracts-ts';
import DisplayAddress from './DisplayAddress';

type OptimismConfig = {
  l1StandardBridge: Address;
  optimismPortal: Address;
  l1CrossDomainMessenger: Address;
};

type L1InfoProps = {
  client: PublicClient;
  config: {
    SystemConfigProxy: Address;
    l1BlockExplorerURL: string;
  };
};

const L1Info = ({ client, config }: L1InfoProps) => {
  const [blockNumber, setBlockNumber] = useState<bigint>(0n);
  const [chainId, setChainId] = useState<number>(0);
  const [chainInfo, setChainInfo] = useState<{name: string; nativeCurrency: any}>({
    name: 'Loading...',
    nativeCurrency: { name: '', symbol: '', decimals: 18 }
  });
  const [gasPrice, setGasPrice] = useState<bigint>(0n);
  const [rpcUrl, setRpcUrl] = useState<string>('');
  const [optimismConfig, setOptimismConfig] = useState<OptimismConfig>({
    l1StandardBridge: "0x0000000000000000000000000000000000000000",
    optimismPortal: "0x0000000000000000000000000000000000000000",
    l1CrossDomainMessenger: "0x0000000000000000000000000000000000000000",
  });
 
  useEffect(() => {
    const fetchInfo = async () => {
      setBlockNumber(await client.getBlockNumber());
      setChainId(await client.getChainId());
      setGasPrice(await client.getGasPrice());
      
      const chainData = client.chain;
      if (chainData) {
        setChainInfo({
          name: chainData.name,
          nativeCurrency: chainData.nativeCurrency
        });
      }

      if (client.transport && 'url' in client.transport && client.transport.url) {
        setRpcUrl(client.transport.url.toString());
      } else if (client.transport && 'transports' in client.transport && client.transport.transports?.[0]?.url) {
        setRpcUrl(client.transport.transports[0].url.toString());
      }

      try {
        const data = await client.multicall({
          contracts: [
            {
              address: config.SystemConfigProxy,
              abi: systemConfigABI,
              functionName: 'l1StandardBridge',
            },
            {
              address: config.SystemConfigProxy,
              abi: systemConfigABI,
              functionName: 'optimismPortal',
            },
            {
              address: config.SystemConfigProxy,
              abi: systemConfigABI,
              functionName: 'l1CrossDomainMessenger',
            }
          ]
        });

        setOptimismConfig({
          l1StandardBridge: data[0].result as Address,
          optimismPortal: data[1].result as Address,
          l1CrossDomainMessenger: data[2].result as Address,
        });
      } catch (err) {
        console.error("Error fetching L1 contract data:", err);
      }
    };

    fetchInfo();
  }, [client]);

  return (
    <div>
      <h2 className="mb-4">L1: {chainInfo.name}</h2>
      <div>
        <div className="mb-4">
          <h3 className="mb-2">Network Details</h3>
          <div><strong>Chain ID:</strong> {chainId}</div>
          <div><strong>RPC URL:</strong> {rpcUrl}</div>
          <div><strong>Currency:</strong> {chainInfo.nativeCurrency?.symbol} ({chainInfo.nativeCurrency?.name})</div>
          <div><strong>Block Number:</strong> {blockNumber.toString()}</div>
          <div><strong>Gas Price:</strong> {formatGwei(gasPrice)} Gwei</div>
        </div>
        <div className="mb-2">
          <h3 className="mb-2">Optimism Config</h3>
          <div>
            <strong>L1StandardBridge:</strong> <DisplayAddress address={optimismConfig.l1StandardBridge} blockExplorerURL={config.l1BlockExplorerURL} />
          </div>
          <div>
            <strong>OptimismPortal:</strong> <DisplayAddress address={optimismConfig.optimismPortal} blockExplorerURL={config.l1BlockExplorerURL} />
          </div>
          <div>
            <strong>L1CrossDomainMessenger:</strong> <DisplayAddress address={optimismConfig.l1CrossDomainMessenger} blockExplorerURL={config.l1BlockExplorerURL} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default L1Info;
