import l1CrossDomainMessengerABI from './abi/L1CrossDomainMessenger.json'
import disputeGameFactoryABI from './abi/DisputeGameFactory.json'
import faultDisputeGameABI from './abi/FaultDisputeGame.json'
import systemConfigABI from './abi/SystemConfig.json'
import { createPublicClient, http } from 'viem'
import { 
  base,
  baseSepolia,
  ink,
  inkSepolia,
  mainnet,
  metalL2,
  mode,
  modeTestnet,
  optimism,
  optimismSepolia,
  sepolia,
  soneium,
  soneiumMinato,
  unichain,
  unichainSepolia,
  worldchain,
  worldchainSepolia,
  zora,
  zoraSepolia,
} from 'viem/chains'

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

const SUPERCHAIN_REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/refs/heads/main/superchain/configs/';

export function getGameTypeName(typeValue: number) {
  return (gameTypes as Record<number, string>)[typeValue] || 'UNKNOWN';
}

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
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: optimism,
      transport: http(),
    }),
    config: {
      displayName: 'Optimism',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/op.toml',
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
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: optimismSepolia,
      transport: http(),
    }),
    config: {
      displayName: 'Optimism Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/op.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  base: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: base,
      transport: http(),
    }),
    config: {
      displayName: 'Base',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/base.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  baseSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }),
    config: {
      displayName: 'Base Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/base.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  ink: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: ink,
      transport: http(),
    }),
    config: {
      displayName: 'Ink',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/ink.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  inkSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: inkSepolia,
      transport: http(),
    }),
    config: {
      displayName: 'Ink Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/ink.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  unichain: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: unichain,
      transport: http(),
    }),
    config: {
      displayName: 'Unichain',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/unichain.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  unichainSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: unichainSepolia,
      transport: http(),
    }),
    config: {
      displayName: 'Unichain Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/unichain.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  soneium: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: soneium,
      transport: http(),
    }),
    config: {
      displayName: 'Soneium',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/soneium.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  soneiumMinatoSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: soneiumMinato,
      transport: http(),
    }),
    config: {
      displayName: 'Soneium Minato Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/soneium.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  worldchain: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: worldchain,
      transport: http(),
    }),
    config: {
      displayName: 'Worldchain',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/worldchain.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  worldchainSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: worldchainSepolia,
      transport: http(),
    }),
    config: {
      displayName: 'Worldchain Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/worldchain.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  metal: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: metalL2,
      transport: http(),
    }),
    config: {
      displayName: 'Metal',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/metal.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  // Metal L2 is not supported by viem: https://github.com/wevm/viem/blob/main/src/chains/index.ts
  // metalSepolia: {
  //   l1_client: L1_SEPOLIA,
  //   l2_client: createPublicClient({
  //     chain: metalL2Sepolia,
  //     transport: http(),
  //   }),
  //   config: {
  //     displayName: 'Metal Sepolia',
  //     superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/metal.toml',
  //     l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
  //     interestingDisputeGames: [],
  //   },
  // },
  mode: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: mode,
      transport: http(),
    }),
    config: {
      displayName: 'Mode',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/mode.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  modeSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: modeTestnet,
      transport: http(),
    }),
    config: {
      displayName: 'Mode Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/mode.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
  zora: {
    l1_client: L1_ETHEREUM,
    l2_client: createPublicClient({
      chain: zora,
      transport: http(),
    }),
    config: {
      displayName: 'Zora',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'mainnet/zora.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_MAINNET,
      interestingDisputeGames: [],
    },
  },
  zoraSepolia: {
    l1_client: L1_SEPOLIA,
    l2_client: createPublicClient({
      chain: zoraSepolia,
      transport: http(),
    }),
    config: {
      displayName: 'Zora Sepolia',
      superchainRegistry: SUPERCHAIN_REGISTRY_BASE_URL + 'sepolia/zora.toml',
      l1BlockExplorerURL: L1_BLOCK_EXPLORER_URL_SEPOLIA,
      interestingDisputeGames: [],
    },
  },
} as const;

export type ChainName = keyof typeof CHAIN_CONFIG;

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
