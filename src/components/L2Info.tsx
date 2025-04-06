import React, { useEffect, useState } from 'react';
import { PublicClient, Address, formatGwei } from 'viem';
import { L2_CONTRACTS } from '../config';
import DisplayAddress from './DisplayAddress';

type L2InfoProps = {
  client: PublicClient;
  config?: {
    l2BlockExplorerURL: string;
  };
};

const L2Info = ({ client, config }: L2InfoProps) => {
  const [blockNumber, setBlockNumber] = useState<bigint>(0n);
  const [chainId, setChainId] = useState<number>(0);
  const [chainInfo, setChainInfo] = useState<{name: string; nativeCurrency: any}>({
    name: 'Loading...',
    nativeCurrency: { name: '', symbol: '', decimals: 18 }
  });
  const [gasPrice, setGasPrice] = useState<bigint>(0n);
  const [rpcUrl, setRpcUrl] = useState<string>('');
  const [l1BlockNumber, setL1BlockNumber] = useState<bigint>(0n);
  const [syncStatus, setSyncStatus] = useState<any>({});

  useEffect(() => {
    const fetchInfo = async () => {
      try {
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
          const l1BlockData = await client.readContract({
            address: L2_CONTRACTS.L1Block as Address,
            abi: [{
              name: 'number',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'uint64' }]
            }],
            functionName: 'number',
          });
          setL1BlockNumber(BigInt(l1BlockData as any));
        } catch (error) {
          console.error('Error fetching L1 block number:', error);
        }

        const block = await client.getBlock();
        setSyncStatus({
          timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
          hash: block.hash,
          gasUsed: block.gasUsed
        });
      } catch (error) {
        console.error('Error fetching L2 information:', error);
      }
    };

    fetchInfo();

  }, [client]);

  return (
    <div>
      <h2 className="mb-4">L2: {chainInfo.name}</h2>
      <div className="mb-4">
        <h3 className="mb-2">Network Details</h3>
        <div><strong>Chain ID:</strong> {chainId}</div>
        <div><strong>RPC URL:</strong> {rpcUrl}</div>
        <div><strong>Currency:</strong> {chainInfo.nativeCurrency?.symbol} ({chainInfo.nativeCurrency?.name})</div>
        <div><strong>L2 Block Number:</strong> {blockNumber.toString()}</div>
        <div><strong>L1 Block Number:</strong> {l1BlockNumber.toString()}</div>
        <div><strong>Gas Price:</strong> {formatGwei(gasPrice)} Gwei</div>
      </div>
      
      <div className="mb-4">
        <h3 className="mb-2">Predeploys</h3>
        <div><strong>L2ToL1MessagePasser:</strong> <DisplayAddress address={L2_CONTRACTS.L2ToL1MessagePasser as Address} blockExplorerURL={config?.l2BlockExplorerURL} /></div>
        <div><strong>L2CrossDomainMessenger:</strong> <DisplayAddress address={L2_CONTRACTS.L2CrossDomainMessenger as Address} blockExplorerURL={config?.l2BlockExplorerURL} /></div>
        <div><strong>L2StandardBridge:</strong> <DisplayAddress address={L2_CONTRACTS.L2StandardBridge as Address} blockExplorerURL={config?.l2BlockExplorerURL} /></div>
        <div><strong>GasPriceOracle:</strong> <DisplayAddress address={L2_CONTRACTS.GasPriceOracle as Address} blockExplorerURL={config?.l2BlockExplorerURL} /></div>
      </div>
    </div>
  );
};

export default L2Info;
