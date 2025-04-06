import React from 'react';
import { Address, type PublicClient } from 'viem';
import DisputeGames from '../components/DisputeGames';

interface DisputeGamesPageProps {
  publicClientL1: PublicClient | null;
  l1Config: {
    SystemConfigProxy: Address;
    l1BlockExplorerURL?: string;
    interestingDisputeGames: {
      address: Address;
      description: string;
    }[];
  };
}

const DisputeGamesPage: React.FC<DisputeGamesPageProps> = ({ publicClientL1, l1Config }) => {
  if (!publicClientL1) {
    return <div>Loading client...</div>;
  }

  return (
    <div>
      <h1 className="mb-6">Dispute Games</h1>
      <DisputeGames publicClientL1={publicClientL1} l1Config={l1Config} />
    </div>
  );
};

export default DisputeGamesPage; 