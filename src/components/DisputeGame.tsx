import React, { useEffect, useState } from 'react';
import type { Address, PublicClient } from 'viem';
import { formatEther } from 'viem';
import DisplayAddress from './DisplayAddress';
import { getGameTypeName, L1_ABIs } from '../config';


type DisputeGameProps = {
  address: Address;
  publicClientL1: PublicClient;
  chainConfig: {
    SystemConfigProxy: Address;
    l1BlockExplorerURL?: string;
  };
};

type DisputeGame = {
  address: Address;
  createdAt: bigint;
  gameType: number;
  rootClaim: `0x${string}`;
  status: number;
  l1Head: `0x${string}`;
  gameCreator: `0x${string}`;
  l2BlockNumber: bigint;
  l2ChainId: bigint;
  claimDataLen: bigint;
};

type Position = bigint; // uint128
type Clock = bigint; // uint128

export const unpackClock = (clock: Clock): { duration: bigint; timestamp: bigint } => {
  const duration = clock & ((1n << 64n) - 1n);
  const timestamp = clock >> 64n;
  return { duration, timestamp };
};

type ClaimData = {
  parentIndex: number; // uint32
  counteredBy: Address; // address
  claimant: Address; // address
  bond: bigint; // uint128
  claim: `0x${string}`; // Claim - bytes32
  position: Position; // Position - uint128
  clock: Clock; // Clock - uint128
};

type Claim = {
  index: number;
  claimData: ClaimData;
};

export type RawClaimData = [number, Address, Address, bigint, `0x${string}`, bigint, bigint];

export const parseClaimData = (raw: RawClaimData, index: number): Claim => ({
  index,
  claimData: {
    parentIndex: raw[0],
    counteredBy: raw[1],
    claimant: raw[2],
    bond: raw[3],
    claim: raw[4],
    position: raw[5],
    clock: raw[6],
  },
});

const ClaimDataDisplay: React.FC<{ claim: Claim, blockExplorerURL?: string }> = ({ claim, blockExplorerURL }) => {
  const { duration, timestamp } = unpackClock(claim.claimData.clock);
  
  return (
    <div className="claim-item">
      <h3>Claim #{claim.index}</h3>
      <div className="claim-details">
        <div><strong>Parent Index:</strong> {claim.claimData.parentIndex}</div>
        <div><strong>Claimant:</strong> <DisplayAddress address={claim.claimData.claimant} blockExplorerURL={blockExplorerURL} /></div>
        <div><strong>Countered By:</strong> {claim.claimData.counteredBy === "0x0000000000000000000000000000000000000000" ? "None" : <DisplayAddress address={claim.claimData.counteredBy} blockExplorerURL={blockExplorerURL} />}</div>
        <div><strong>Bond:</strong> {formatEther(claim.claimData.bond)} ETH</div>
        <div><strong>Claim Value:</strong> <TruncatedHex value={claim.claimData.claim} /></div>
        <div><strong>Position:</strong> {claim.claimData.position.toString()}</div>
        <div><strong>Clock:</strong> {new Date(Number(duration) * 1000).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })} ({timestamp.toString()} seconds)</div>
      </div>
    </div>
  );
};

const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'In Progress',
    1: 'Challenger Wins',
    2: 'Defender Wins',
  };
  return statusMap[status] || `Unknown (${status})`;
};

const TruncatedHex: React.FC<{ value: string }> = ({ value }) => {
  if (!value) return null;
  const truncated = `${value.substring(0, 10)}...${value.substring(value.length - 8)}`;
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  return (
    <div className="hex-container">
      <span className="hex-value" title={value}>
        {truncated}
      </span>
      <button 
        className={`copy-button ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? '✓' : '📋'}
      </button>
    </div>
  );
};

const DisputeGame: React.FC<DisputeGameProps> = ({
  address,
  publicClientL1,
  chainConfig
}) => {
  const [game, setGame] = useState<DisputeGame | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [contractExists, setContractExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkContractExists = async () => {
      try {
        setLoading(true);
        const bytecode = await publicClientL1.getCode({ address });
        // Contract exists if bytecode is not null, undefined or empty
        const exists = bytecode !== null && bytecode !== undefined && bytecode !== '0x';
        setContractExists(exists);
        return exists;
      } catch (error) {
        console.error('Error checking contract existence:', error);
        setContractExists(false);
        return false;
      } finally {
        setLoading(false);
      }
    };

    const fetchGame = async () => {
      if (!await checkContractExists()) return;

      const results = await publicClientL1.multicall({
        contracts: [
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'createdAt',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'gameType',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'rootClaim',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'status',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'l1Head',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'gameCreator',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'l2BlockNumber',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'l2ChainId',
          },
          {
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'claimDataLen',
          },
        ],
      });
      
      if (results.every(result => result.status === 'success')) {
        setGame({
          address,
          createdAt: results[0].result as bigint,
          gameType: results[1].result as number,
          rootClaim: results[2].result as `0x${string}`,
          status: results[3].result as number,
          l1Head: results[4].result as `0x${string}`,
          gameCreator: results[5].result as `0x${string}`,
          l2BlockNumber: results[6].result as bigint,
          l2ChainId: results[7].result as bigint,
          claimDataLen: results[8].result as bigint,
        });
      } else {
        console.error('Error fetching game data:', results);
      }
    };

    const fetchClaims = async () => {
      setLoadingClaims(true);
      try {
        if (!contractExists) {
          setClaims([]);
          return;
        }
        
        const claimDataLenResult = await publicClientL1.readContract({
          address: address,
          abi: L1_ABIs.faultDisputeGameABI,
          functionName: 'claimDataLen',
        });
        
        const claimDataLen = claimDataLenResult as bigint;
        const allClaims: Claim[] = [];

        for (let i = 0n; i < claimDataLen; i++) {
          const result = await publicClientL1.readContract({
            address: address,
            abi: L1_ABIs.faultDisputeGameABI,
            functionName: 'claimData',
            args: [i],
          });

          const claimData = result as RawClaimData;
          const claim: Claim = parseClaimData(claimData, Number(i));

          allClaims.push(claim);
        }
        
        setClaims(allClaims);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoadingClaims(false);
      }
    };
    
    const initializeData = async () => {
      const exists = await checkContractExists();
      if (exists) {
        await fetchGame();
        await fetchClaims();
      }
    };
    
    initializeData();
  }, [address, publicClientL1]);
  
  if (loading) {
    return <div className="dispute-game-details loading">Checking dispute game contract...</div>;
  }
  
  if (contractExists === false) {
    return (
      <div className="dispute-game-details error">
        <div className="error-message">
          No contract found at address <DisplayAddress address={address} blockExplorerURL={chainConfig.l1BlockExplorerURL} />
        </div>
      </div>
    );
  }
  
  if (!game) {
    return <div className="dispute-game-details loading">Loading game data...</div>;
  }
  
  return (
    <div className="dispute-game-container">
      {game ? (
        <>
          <div className="game-header">
            <h2>Dispute Game</h2>
            <div className="game-address"><DisplayAddress address={address} blockExplorerURL={chainConfig.l1BlockExplorerURL} /></div>
          </div>
          
          <div className="game-details">
            <div><strong>Creation Time:</strong> {new Date(Number(game.createdAt) * 1000).toLocaleString()}</div>
            <div><strong>Game Type:</strong> {getGameTypeName(game.gameType)} ({game.gameType})</div>
            <div><strong>Status:</strong> <span className={`status-${game.status}`}>{getStatusText(game.status)}</span></div>
            <div><strong>Game Creator:</strong> <DisplayAddress address={game.gameCreator} blockExplorerURL={chainConfig.l1BlockExplorerURL} /></div>
            <div><strong>L2 Block Number:</strong> {game.l2BlockNumber.toString()}</div>
            <div><strong>L2 Chain ID:</strong> {game.l2ChainId.toString()}</div>
            <div><strong>L1 Head:</strong> <TruncatedHex value={game.l1Head} /></div>
            <div><strong>Root Claim:</strong> <TruncatedHex value={game.rootClaim} /></div>
            <div><strong>Total Claims:</strong> {game.claimDataLen.toString()}</div>
          </div>
          
          <div className="claims-section">
            <h3>Claims ({claims.length})</h3>
            {loadingClaims ? (
              <div className="loading">Loading claims...</div>
            ) : claims.length === 0 ? (
              <div className="empty-state">No claims found</div>
            ) : (
              <div className="claims-list">
                {claims.map(claim => (
                  <ClaimDataDisplay key={claim.index} claim={claim} blockExplorerURL={chainConfig.l1BlockExplorerURL} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="loading">Loading dispute game details...</div>
      )}
    </div>
  );
};

export default DisputeGame;
