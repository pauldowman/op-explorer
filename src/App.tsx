import { useState, useEffect } from 'react'
import './App.css'
import { 
  createWalletClient,
  custom,
  type Address,
  type PublicClient,
} from 'viem'
import { mainnet } from 'viem/chains'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { parse } from 'smol-toml'

import L1Info from './components/L1Info';
import L2Info from './components/L2Info';
import DisputeGamesPage from './pages/DisputeGamesPage';
import DisputeGamePage from './pages/DisputeGamePage';
import Settings from './components/Settings';
import { CHAIN_CONFIG, ChainName } from './config';

interface EthereumProvider {
  on(event: string, callback: any): void;
  removeListener(event: string, callback: any): void;
  request(args: { method: string, params?: any[] }): Promise<any>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [account, setAccount] = useState<Address>()
  const [currentChain, setCurrentChain] = useState<ChainName>('optimism')
  const [publicClientL1, setPublicClientL1] = useState<PublicClient>(CHAIN_CONFIG.optimism.l1_client as any)
  const [publicClientL2, setPublicClientL2] = useState<PublicClient>(CHAIN_CONFIG.optimism.l2_client as any)
  const [walletClient, setWalletClient] = useState<any>(null)
  const [chainConfig, setChainConfig] = useState<any>(CHAIN_CONFIG.optimism.config)
  const [superchainRegistryInfo, setSuperchainRegistryInfo] = useState<any>(null);
  
  useEffect(() => {
    if (window.ethereum) {
      const client = createWalletClient({ 
        chain: mainnet, // TODO this should be set from current chain
        transport: custom(window.ethereum),
      })
      setWalletClient(client)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    setPublicClientL1(CHAIN_CONFIG[currentChain].l1_client as any);
    setPublicClientL2(CHAIN_CONFIG[currentChain].l2_client as any);
    setChainConfig(CHAIN_CONFIG[currentChain].config)

    const loadSuperchainRegistryInfo = async () => {
      const superchainRegistryInfo = await fetch(chainConfig.superchainRegistry)
      const superchainRegistry = parse(await superchainRegistryInfo.text())
      console.log("superchainRegistry", superchainRegistry)
      setSuperchainRegistryInfo(superchainRegistry)
    }

    setSuperchainRegistryInfo(loadSuperchainRegistryInfo());
  }, [currentChain]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        if (walletClient) {
          const [address] = await walletClient.getAddresses();
          setAccount(address);
        }
      } catch (error) {
        console.error('Failed to fetch address:', error);
      }
    };

    if (walletClient) {
      fetchAddress();
    }


    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet from MetaMask
        setAccount(undefined);
      } else {
        // User switched accounts
        setAccount(accounts[0] as Address);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [walletClient]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const connect = async () => {
    if (walletClient) {
      const [address] = await walletClient.requestAddresses()
      setAccount(address)
    } else {
      console.error('Wallet client not initialized. MetaMask may not be installed.')
    }
  }

  const disconnect = () => {
    setAccount(undefined)
  }

  const handleChainChange = (chain: ChainName) => {
    setCurrentChain(chain)
  }

  return (
    <div className="app-container">
      <div className="settings-container">
        <Settings 
          account={account} 
          connect={connect} 
          disconnect={disconnect}
          currentChain={currentChain}
          onChainChange={handleChainChange}
        />
        <button 
          className="theme-toggle-button" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      
      <BrowserRouter>
        <div>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dispute-games">Dispute Games</Link></li>
            </ul>
          </nav>
          
          <Routes>
            <Route path="/" element={
              <div className="grid">
                <div className="card">
                  {publicClientL1 && <L1Info client={publicClientL1} config={chainConfig} superchainRegistryInfo={superchainRegistryInfo} />}
                </div>
                <div className="card">
                  {publicClientL2 && <L2Info l1Client={publicClientL1} l2Client={publicClientL2} config={chainConfig} superchainRegistryInfo={superchainRegistryInfo} />}
                </div>
              </div>
            } />
            <Route path="/dispute-games" element={
              <div className="card">
                <DisputeGamesPage 
                  publicClientL1={publicClientL1} 
                  chainConfig={chainConfig}
                />
              </div>
            } />
            <Route path="/dispute-game/:address" element={
              <div className="card">
                <DisputeGamePage 
                  publicClientL1={publicClientL1} 
                  chainConfig={chainConfig}
                />
              </div>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
