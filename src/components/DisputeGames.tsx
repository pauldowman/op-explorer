import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { PublicClient, Address } from 'viem';
import { L1_ABIs, getGameTypeName } from '../config';

type DisputeGame = {
  address: Address;
  timestamp: bigint;
  type: number;
  status?: number;
};

interface RawDisputeGame {
  index: bigint;
  metadata: `0x${string}`;
  timestamp: bigint;
  rootClaim: `0x${string}`;
  extraData: `0x${string}`;
}

type DisputeGamesProps = {
  publicClientL1: PublicClient;
  superchainRegistryInfo: any;
  chainConfig: {
    SystemConfigProxy: Address;
    interestingDisputeGames: {
      address: Address;
      description: string;
    }[];
  };
};

const getStatusText = (status?: number): string => {
  if (status === undefined) return 'Loading...';
  
  const statusMap: Record<number, string> = {
    0: 'In Progress',
    1: 'Challenger Wins',
    2: 'Defender Wins',
  };
  return statusMap[status] || `Unknown (${status})`;
};

const getStatusClass = (status?: number): string => {
  if (status === undefined) return '';
  if (status === 1) return 'status-challenger-wins';
  if (status === 2) return 'status-defender-wins';
  return '';
};

const DisputeGames: React.FC<DisputeGamesProps> = ({
  publicClientL1,
  superchainRegistryInfo,
  chainConfig
}) => {
  const systemConfigProxy = superchainRegistryInfo?.addresses?.SystemConfigProxy;

  const [searchParams, setSearchParams] = useSearchParams();
  const [gameCount, setGameCount] = useState<number>(0);
  const [disputeGames, setDisputeGames] = useState<DisputeGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInterestingGamesOpen, setIsInterestingGamesOpen] = useState<boolean>(false);
  const [disputeGameFactoryProxy, setDisputeGameFactoryProxy] = useState<Address | null>(null);
  const gameType = 0;
  const pageSize = 20;

  const getCurrentPage = (): number => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    return page > 0 ? page : 1;
  };

  useEffect(() => {
    const fetchDisputeGameFactoryProxy = async () => {
      try {
        const factoryProxy = await publicClientL1.readContract({
          address: systemConfigProxy,
          abi: L1_ABIs.systemConfigABI,
          functionName: 'disputeGameFactory',
        }) as Address;
        console.log('disputeGameFactoryProxy', factoryProxy);
        setDisputeGameFactoryProxy(factoryProxy);
      } catch (error) {
        console.error('Error fetching dispute game factory proxy:', error);
      }
    };

    setDisputeGameFactoryProxy(null);
    setDisputeGames([]);
    setGameCount(0);
    
    fetchDisputeGameFactoryProxy();
  }, [publicClientL1, systemConfigProxy]);

  useEffect(() => {
    const loadDisputeGames = async () => {
      if (!disputeGameFactoryProxy) return;
      
      try {
        setLoading(true);
        console.log('Fetching game count...');
        const totalGameCount = await publicClientL1.readContract({
          address: disputeGameFactoryProxy,
          abi: L1_ABIs.disputeGameFactoryABI,
          functionName: 'gameCount',
        }) as bigint;
        setGameCount(Number(totalGameCount));

        const currentPage = getCurrentPage();
        const offset = (currentPage - 1) * pageSize;
        const latestGames = await publicClientL1.readContract({
          address: disputeGameFactoryProxy,
          abi: L1_ABIs.disputeGameFactoryABI,
          functionName: 'findLatestGames',
          args: [gameType, totalGameCount - 1n - BigInt(offset), pageSize],
        }) as RawDisputeGame[];
        
        console.log('latestGames', latestGames);
        
        const mappedGames = latestGames.map((game: RawDisputeGame) => {
          console.log('game', game);
          const metadata = game.metadata as `0x${string}`;
          const address = metadata.slice(-40) as Address;
          const typeHex = metadata.slice(0, 6); // 4 bytes plus `0x`
          const typeInt = parseInt(typeHex);
          return {
            address: `0x${address}`,
            timestamp: game.timestamp,
            type: typeInt,
          }
        });
        
        const gamesWithStatus = await Promise.all(
          mappedGames.map(async (game) => {
            try {
              const status = await publicClientL1.readContract({
                address: game.address as Address,
                abi: L1_ABIs.faultDisputeGameABI,
                functionName: 'status',
              }) as number;
              
              return {
                ...game,
                status,
              } as DisputeGame;
            } catch (error) {
              console.error(`Error fetching status for game ${game.address}:`, error);
              return game as DisputeGame;
            }
          })
        );
        setDisputeGames(gamesWithStatus);
      } catch (error) {
        console.error('Error loading dispute games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDisputeGames();
  }, [disputeGameFactoryProxy, publicClientL1, searchParams]);

  useEffect(() => {
    console.log('Current gameCount state:', gameCount);
  }, [gameCount]);

  const totalPages = Math.ceil(gameCount / pageSize);
  const currentPage = getCurrentPage();

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newParams = new URLSearchParams(searchParams);
      const newPage = currentPage - 1;
      
      if (newPage === 1) {
        newParams.delete('page');
      } else {
        newParams.set('page', newPage.toString());
      }
      
      setSearchParams(newParams);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', (currentPage + 1).toString());
      setSearchParams(newParams);
    }
  };

  if (loading) {
    return <div className="mb-4">Loading dispute games...</div>;
  }

  return (
    <div>
      {chainConfig.interestingDisputeGames.length > 0 && (
      <div className="interesting-games-section mb-4">
        <div 
          className="interesting-games-header" 
          onClick={() => setIsInterestingGamesOpen(!isInterestingGamesOpen)}
        >
          <strong>Interesting dispute games</strong>
          <span className="toggle-icon">{isInterestingGamesOpen ? '▼' : '►'}</span>
        </div>
        
        {isInterestingGamesOpen && (
          <div className="interesting-games-content">
            {chainConfig.interestingDisputeGames.map(game => (
              <div key={game.address} className="interesting-game-item">
                <Link to={`/dispute-game/${game.address}`} className="game-address hex">{game.address}</Link>
                <span className="game-description">{game.description}</span>
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      <div>
        <strong>Game count:</strong> {gameCount}
      </div>
      {disputeGames.length === 0 ? (
        <p>No dispute games found.</p>
      ) : (
        <>
          <div className="table-container">
            <table className="dispute-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {disputeGames.map(game => (
                  <tr key={game.address}>
                    <td>
                      <Link to={`/dispute-game/${game.address}`} className="hex">{game.address}</Link>
                    </td>
                    <td>{getGameTypeName(game.type)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(game.status)}`}>
                        {getStatusText(game.status)}
                      </span>
                    </td>
                    <td>{new Date(Number(game.timestamp) * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls mt-4" style={{ margin: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading}
              className="btn btn-sm btn-outline"
              style={{ padding: '8px 16px' }}
            >
              Previous
            </button>
            <span style={{ margin: '0 16px' }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
              className="btn btn-sm btn-outline"
              style={{ padding: '8px 16px' }}
            >
              Next
            </button>
          </div>
        </>
      )}
      <style>
        {`
          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          /* Light theme styles (default) */
          .status-challenger-wins {
            background-color: #ffdddd;
            color: #cc0000;
          }
          
          .status-defender-wins {
            background-color: #ddffdd;
            color: #006600;
          }
          
          .interesting-games-section {
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
          }
          
          .interesting-games-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background-color: #f5f5f5;
            cursor: pointer;
            user-select: none;
          }
          
          .interesting-games-content {
            padding: 0.75rem 1rem;
            background-color: #fff;
          }
          
          .interesting-game-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eee;
          }
          
          .interesting-game-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          
          .game-address {
            font-family: monospace;
            margin-right: 1rem;
            flex-shrink: 0;
          }
          
          .game-description {
            color: #666;
          }
          
          .toggle-icon {
            font-size: 0.75rem;
          }
          
          /* Dark theme styles - only apply when specifically in dark mode */
          html.dark .status-challenger-wins,
          body.dark .status-challenger-wins,
          .dark-mode .status-challenger-wins,
          [data-theme="dark"] .status-challenger-wins,
          .dark .status-challenger-wins {
            background-color: rgba(204, 0, 0, 0.2);
            color: #ff6666;
          }
          
          html.dark .status-defender-wins,
          body.dark .status-defender-wins,
          .dark-mode .status-defender-wins,
          [data-theme="dark"] .status-defender-wins,
          .dark .status-defender-wins {
            background-color: rgba(0, 102, 0, 0.2);
            color: #66cc66;
          }
          
          html.dark .interesting-games-section,
          body.dark .interesting-games-section,
          .dark-mode .interesting-games-section,
          [data-theme="dark"] .interesting-games-section,
          .dark .interesting-games-section {
            border-color: #444;
          }
          
          html.dark .interesting-games-header,
          body.dark .interesting-games-header,
          .dark-mode .interesting-games-header,
          [data-theme="dark"] .interesting-games-header,
          .dark .interesting-games-header {
            background-color: #333;
          }
          
          html.dark .interesting-games-content,
          body.dark .interesting-games-content,
          .dark-mode .interesting-games-content,
          [data-theme="dark"] .interesting-games-content,
          .dark .interesting-games-content {
            background-color: #222;
          }
          
          html.dark .interesting-game-item,
          body.dark .interesting-game-item,
          .dark-mode .interesting-game-item,
          [data-theme="dark"] .interesting-game-item,
          .dark .interesting-game-item {
            border-color: #444;
          }
          
          html.dark .game-description,
          body.dark .game-description,
          .dark-mode .game-description,
          [data-theme="dark"] .game-description,
          .dark .game-description {
            color: #aaa;
          }
          
          /* Only apply system preference if no theme is explicitly set */
          @media (prefers-color-scheme: dark) {
            html:not([data-theme]) .status-challenger-wins:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              background-color: rgba(204, 0, 0, 0.2);
              color: #ff6666;
            }
            
            html:not([data-theme]) .status-defender-wins:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              background-color: rgba(0, 102, 0, 0.2);
              color: #66cc66;
            }
            
            html:not([data-theme]) .interesting-games-section:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              border-color: #444;
            }
            
            html:not([data-theme]) .interesting-games-header:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              background-color: #333;
            }
            
            html:not([data-theme]) .interesting-games-content:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              background-color: #222;
            }
            
            html:not([data-theme]) .interesting-game-item:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              border-color: #444;
            }
            
            html:not([data-theme]) .game-description:not(.light-mode *):not(.light *):not([data-theme="light"] *) {
              color: #aaa;
            }
          }
          
          /* Pagination button styles */
          .pagination-btn {
            padding: 0.5rem 1rem;
          }
        `}
      </style>
    </div>
  );
};

export default DisputeGames; 