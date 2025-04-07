import React from 'react';
import { Address, type PublicClient } from 'viem';
import DisputeGames from '../components/DisputeGames';

interface DisputeGamesPageProps {
  publicClientL1: PublicClient | null;
  superchainRegistryInfo: any;
  chainConfig: {
    SystemConfigProxy: Address;
    l1BlockExplorerURL?: string;
    interestingDisputeGames: {
      address: Address;
      description: string;
    }[];
  };
}

const DisputeGamesPage: React.FC<DisputeGamesPageProps> = ({ publicClientL1, superchainRegistryInfo, chainConfig }) => {
  if (!publicClientL1) {
    return <div>Loading client...</div>;
  }

  return (
    <div>
      <h1 className="mb-6">Dispute Games</h1>
      <DisputeGames publicClientL1={publicClientL1} superchainRegistryInfo={superchainRegistryInfo} chainConfig={chainConfig} />
    </div>
  );
};

export default DisputeGamesPage; 