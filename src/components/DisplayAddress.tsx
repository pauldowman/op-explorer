import React, { useState, useEffect } from 'react';
import type { Address } from 'viem';

type DisplayAddressProps = {
  address: Address;
  blockExplorerURL?: string;
};

const DisplayAddress: React.FC<DisplayAddressProps> = ({ address, blockExplorerURL }) => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <span className="hex" title={address}>
      {`${address.substring(0, 10)}...${address.substring(address.length - 8)}`}
      <a 
        href={`${blockExplorerURL}address/${address}`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ display: 'inline-block', marginLeft: '4px' }}
      >
        🔍
      </a>
    </span>
  );
};

export default DisplayAddress; 
