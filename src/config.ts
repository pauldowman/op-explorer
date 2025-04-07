import l1CrossDomainMessengerABI from './abi/L1CrossDomainMessenger.json'
import disputeGameFactoryABI from './abi/DisputeGameFactory.json'
import faultDisputeGameABI from './abi/FaultDisputeGame.json'
import systemConfigABI from './abi/SystemConfig.json'
import { createPublicClient, http } from 'viem'
import { mainnet, sepolia, optimism, optimismSepolia, base, baseSepolia } from 'viem/chains'

export const L1_ABIs = {
  l1CrossDomainMessengerABI,
  disputeGameFactoryABI,
  faultDisputeGameABI,
  systemConfigABI,
}

// see https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/dispute/lib/Types.sol
const gameTypes = {
  0: 'Cannon',
  1: 'Permissioned Cannon',
  2: 'Asterisc',
  3: 'Asterisc Kona',
  6: 'OP Succinct',
  254: 'Fast',
  255: 'Alphabet',
  1337: 'Kailua'
};

export function getGameTypeName(typeValue: number) {
  return (gameTypes as Record<number, string>)[typeValue] || 'UNKNOWN';
}


// Define a type for valid chain names
export type ChainName = 'optimism' | 'optimismSepolia' | 'base' | 'baseSepolia';

const L1_ETHEREUM = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const L1_SEPOLIA = createPublicClient({
  chain: sepolia,
  transport: http(),
})

const L1_BLOCK_EXPLORER_URL_MAINNET = 'https://etherscan.io'
const L1_BLOCK_EXPLORER_URL_SEPOLIA = 'https://sepolia.etherscan.io'

export const CHAIN_CONFIG = {
  optimism: {
    displayName: 'Optimism',
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: optimism,
      transport: http(),
    }),
    config: {
      superchainRegistry: 'https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/refs/heads/main/superchain/configs/mainnet/op.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [
        {
          address: '0x52cE243d552369b11D6445Cd187F6393d3B42D4a', 
          description: 'First invalid dispute game by unknown creator',
        },
        {
          address: '0x3bfb761ad1bdc7d3dfa68fe7fa910b478bcc1e99', 
          description: 'Second invalid dispute game by unknown creator',
        },
        {
          address: '0x6c7972232c4632b5fb1537472d757ef4fdced23c', 
          description: 'Invalid dispute game by OP Labs tester',
        },
        {
          address: '0xE5b12d605983fFcEE97D95191Db604B129928423',
          description: 'Unchallenged dispute game by Optimism State Root Proposer',
        },
      ],
    },
  },
  optimismSepolia: {
    displayName: 'Optimism Sepolia',
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: optimismSepolia,
      transport: http(),
    }),
    config: {
      superchainRegistry: 'https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/refs/heads/main/superchain/configs/sepolia/op.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  base: {
    displayName: 'Base',
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: base,
      transport: http(),
    }),
    config: {
      superchainRegistry: 'https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/refs/heads/main/superchain/configs/mainnet/base.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  baseSepolia: {
    displayName: 'Base Sepolia',
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }),
    config: {
      superchainRegistry: 'https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/refs/heads/main/superchain/configs/sepolia/base.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  }
}


export const L2_CONTRACTS: Record<string, `0x${string}`> = {
  L2ToL1MessagePasser: "0x4200000000000000000000000000000000000016",
  L2CrossDomainMessenger: "0x4200000000000000000000000000000000000007",
  L2StandardBridge: "0x4200000000000000000000000000000000000010",
  L2ERC721Bridge: "0x4200000000000000000000000000000000000014",
  SequencerFeeVault: "0x4200000000000000000000000000000000000011",
  OptimismMintableERC20Factory: "0x4200000000000000000000000000000000000012",
  OptimismMintableERC721Factory: "0x4200000000000000000000000000000000000017",
  L1Block: "0x4200000000000000000000000000000000000015",
  GasPriceOracle: "0x420000000000000000000000000000000000000F",
  ProxyAdmin: "0x4200000000000000000000000000000000000018",
  BaseFeeVault: "0x4200000000000000000000000000000000000019",
  L1FeeVault: "0x420000000000000000000000000000000000001A",
  GovernanceToken: "0x4200000000000000000000000000000000000042",
  SchemaRegistry: "0x4200000000000000000000000000000000000020",
  EAS: "0x4200000000000000000000000000000000000021",
}
