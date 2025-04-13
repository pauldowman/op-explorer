import { useState } from 'react';
import { Address } from 'viem';
import DisplayAddress from './DisplayAddress';
import { CHAIN_CONFIG, ChainName } from '../config';

interface SettingsProps {
  account?: Address;
  connect: () => Promise<void>;
  disconnect: () => void;
  currentChain: ChainName;
  onChainChange: (chain: ChainName) => void;
}

const Settings = ({ account, connect, disconnect, currentChain, onChainChange }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  // Helper function to truncate wallet address
  const truncateAddress = (address: Address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <button 
        className="settings-button" 
        onClick={openDialog}
        aria-label="Settings"
      >
        {CHAIN_CONFIG[currentChain].config.displayName}
        {account && <span className="address-display"> | {truncateAddress(account)}</span>}
      </button>

      {isOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <h2>Settings</h2>
              <button className="close-button" onClick={closeDialog}>×</button>
            </div>
            <div className="dialog-body">
              <div className="settings-section">
                <h3>Wallet</h3>
                {account ? (
                  <>
                    <p>Connected: <DisplayAddress address={account} blockExplorerURL={CHAIN_CONFIG[currentChain].config.l1BlockExplorerURL} /></p>
                    <button className="primary-button" onClick={disconnect}>Disconnect Wallet</button>
                  </>
                ) : (
                  <button className="primary-button" onClick={connect}>Connect Wallet</button>
                )}
              </div>
              <div className="settings-section">
                <h3>Network</h3>
                <div className="network-selector">
                  <label htmlFor="chain-select">Select L2 Chain:</label>
                  <select 
                    id="chain-select" 
                    value={currentChain}
                    onChange={(e) => {
                      onChainChange(e.target.value as ChainName);
                      closeDialog();
                    }}
                    className="chain-select"
                  >
                    {Object.entries(CHAIN_CONFIG).map(([chainName, chainData]) => (
                      <option key={chainName} value={chainName}>
                        {chainData.config.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="settings-section">
                <h3>Other Settings</h3>
                <p>Additional settings can be added here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings; 