import React from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Address, PublicClient } from 'viem';
import DisputeGame from '../components/DisputeGame';

type DisputeGamePageProps = {
  publicClientL1: PublicClient | null;
  l1Config: {
    SystemConfigProxy: Address;
    l1BlockExplorerURL?: string;
  };
};

const DisputeGamePage: React.FC<DisputeGamePageProps> = ({ publicClientL1, l1Config }) => {
  const { address } = useParams<{ address: string }>();
  
  if (!publicClientL1) {
    return <div>Loading client...</div>;
  }

  if (!address) {
    return <div>No dispute game address provided</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Link to="/dispute-games" className="back-link">← Back to Dispute Games</Link>
        <h1>Dispute Game</h1>
      </div>
      
      <DisputeGame address={address as Address} publicClientL1={publicClientL1} l1Config={l1Config} />
    </div>
  );
};

export default DisputeGamePage; 