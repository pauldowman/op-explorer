import { useEffect, useState } from 'react';
import { PublicClient, Address, formatGwei, hexToBytes } from 'viem';
import { L2_CONTRACTS } from '../config';
import { L1_ABIs } from '../config';
import DisplayAddress from './DisplayAddress';

type L2InfoProps = {
  l1Client: PublicClient;
  l2Client: PublicClient;
  config: {
    displayName: string;
    l1BlockExplorerURL: string;
  };
  superchainRegistryInfo: any; // TODO: give this a type
};

export type EIP1559Params = {
  version: number;
  denominator: number;
  elasticity: number;
  isValid: boolean;
};

export const parseEIP1559Params = (extraDataHex: string): EIP1559Params => {
  try {
    const formattedHex = extraDataHex.startsWith('0x')
      ? (extraDataHex as `0x${string}`)
      : (`0x${extraDataHex}` as `0x${string}`);
    const bytes = hexToBytes(formattedHex);

    if (bytes.length < 9) {
      return { version: 0, denominator: 0, elasticity: 0, isValid: false };
    }

    const version = bytes[0];
    const denominator =
      (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
    const elasticity =
      (bytes[5] << 24) | (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];

    const isValid = version === 0 && denominator !== 0 && bytes.length <= 32;

    return { version, denominator, elasticity, isValid };
  } catch (error) {
    console.error('Error parsing EIP-1559 parameters:', error);
    return { version: 0, denominator: 0, elasticity: 0, isValid: false };
  }
};

export const formatGasLimitPerBlock = (gasLimit?: bigint): string => {
  if (!gasLimit) return '0';
  return (gasLimit / 1000000n).toString();
};

export const formatGasLimitPerSecond = (
  gasLimit: bigint | undefined,
  superchainRegistryInfo: any
): string => {
  if (!gasLimit || !superchainRegistryInfo?.block_time) return '0';
  return (
    gasLimit / BigInt(superchainRegistryInfo.block_time) / 1000000n
  ).toString();
};

export const formatGasTargetPerBlock = (
  gasLimit: bigint | undefined,
  eip1559Params: EIP1559Params
): string => {
  if (!gasLimit || !eip1559Params.isValid) return '0';
  return (gasLimit / BigInt(eip1559Params.elasticity) / 1000000n).toString();
};

export const formatGasTargetPerSecond = (
  gasLimit: bigint | undefined,
  eip1559Params: EIP1559Params,
  superchainRegistryInfo: any
): string => {
  if (!gasLimit || !eip1559Params.isValid || !superchainRegistryInfo?.block_time)
    return '0';
  return (
    gasLimit /
    BigInt(eip1559Params.elasticity) /
    BigInt(superchainRegistryInfo.block_time) /
    1000000n
  ).toString();
};

const L2Info = ({ l1Client, l2Client, config, superchainRegistryInfo }: L2InfoProps) => {
  const [blockNumber, setBlockNumber] = useState<bigint>(0n);
  const [chainId, setChainId] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<bigint>(0n);
  const [rpcUrl, setRpcUrl] = useState<string>('');
  const [l1BlockNumber, setL1BlockNumber] = useState<bigint>(0n);
  const [_, setExtraData] = useState<string>('');
  const [eip1559Params, setEip1559Params] = useState<EIP1559Params>({
    version: 0,
    denominator: 0,
    elasticity: 0,
    isValid: false
  });
  const [gasLimit, setGasLimit] = useState<bigint>(0n);


  useEffect(() => {
    const fetchL2ClientInfo = async () => {
      try {
        const blockNum = await l2Client.getBlockNumber();
        setBlockNumber(blockNum);
        
        // Get latest block to retrieve extraData
        const latestBlock = await l2Client.getBlock({ blockNumber: blockNum });
        const extraDataHex = latestBlock.extraData || '';
        setExtraData(extraDataHex);
        
        // Parse EIP-1559 parameters from extraData
        if (extraDataHex) {
          const params = parseEIP1559Params(extraDataHex);
          setEip1559Params(params);
        }
        
        setChainId(await l2Client.getChainId());
        setGasPrice(await l2Client.getGasPrice());
        
        if (l2Client.transport && 'url' in l2Client.transport && l2Client.transport.url) {
          setRpcUrl(l2Client.transport.url.toString());
        } else if (l2Client.transport && 'transports' in l2Client.transport && l2Client.transport.transports?.[0]?.url) {
          setRpcUrl(l2Client.transport.transports[0].url.toString());
        }

        try {
          const l1BlockData = await l2Client.readContract({
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
      } catch (error) {
        console.error('Error fetching L2 information:', error);
      }
    };

    const fetchL1ClientInfo = async () => {
      if (superchainRegistryInfo?.addresses?.SystemConfigProxy) {
        try {
          const data = await l1Client.multicall({
            contracts: [
              {
                address: superchainRegistryInfo?.addresses?.SystemConfigProxy,
                abi: L1_ABIs.systemConfigABI,
                functionName: 'gasLimit',
              }
            ]
          });
          setGasLimit(data[0].result as bigint);
        } catch (err) {
          console.error("Error fetching L1 contract data:", err);
        }
      }
    };

    fetchL2ClientInfo();
    fetchL1ClientInfo();
  }, [l1Client, l2Client, config, superchainRegistryInfo]);

  const gasLimitPerBlock = () => formatGasLimitPerBlock(gasLimit);
  const gasLimitPerSecond = (info: any) =>
    formatGasLimitPerSecond(gasLimit, info);
  const gasTargetPerBlock = (params: EIP1559Params) =>
    formatGasTargetPerBlock(gasLimit, params);
  const gasTargetPerSecond = (params: EIP1559Params, info: any) =>
    formatGasTargetPerSecond(gasLimit, params, info);

  return (
    <div>
      <h2 className="mb-4">L2: {config.displayName}</h2>
      <div className="mb-4">
        <div><strong>Chain ID:</strong> {chainId}</div>
        <div><strong>RPC URL:</strong> {rpcUrl}</div>
        <div><strong>Block Time:</strong> {superchainRegistryInfo?.block_time} seconds</div>
        <div><strong>L2 Block Number:</strong> {blockNumber.toString()}</div>
        <div><strong>L1 Block Number:</strong> {l1BlockNumber.toString()}</div>
        <div><strong>Gas Price:</strong> {formatGwei(gasPrice)} Gwei</div>
        {eip1559Params.isValid && (
          <div><strong>EIP-1559 Parameters:</strong> Version: {eip1559Params.version}; Denominator: {eip1559Params.denominator}; Elasticity: {eip1559Params.elasticity}</div>
        )}
      </div>
        
      <div className="mb-4">
        <h3 className="mb-2">Gas Limit</h3>
        <div><strong>Limit:</strong> {gasLimitPerBlock()}M/block; {gasLimitPerSecond(superchainRegistryInfo)}M/sec</div>
          <div><strong>Target:</strong> {gasTargetPerBlock(eip1559Params)}M/block; {gasTargetPerSecond(eip1559Params, superchainRegistryInfo)}M/sec</div>
      </div>
      
      <div className="mb-4">
        <h3 className="mb-2">Predeploys</h3>
        <div><strong>L2ToL1MessagePasser:</strong> <DisplayAddress address={L2_CONTRACTS.L2ToL1MessagePasser as Address} blockExplorerURL={superchainRegistryInfo?.explorer} /></div>
        <div><strong>L2CrossDomainMessenger:</strong> <DisplayAddress address={L2_CONTRACTS.L2CrossDomainMessenger as Address} blockExplorerURL={superchainRegistryInfo?.explorer} /></div>
        <div><strong>L2StandardBridge:</strong> <DisplayAddress address={L2_CONTRACTS.L2StandardBridge as Address} blockExplorerURL={superchainRegistryInfo?.explorer} /></div>
        <div><strong>GasPriceOracle:</strong> <DisplayAddress address={L2_CONTRACTS.GasPriceOracle as Address} blockExplorerURL={superchainRegistryInfo?.explorer} /></div>
      </div>
    </div>
  );
};

export default L2Info;
