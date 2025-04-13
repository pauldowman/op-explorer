import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <p>Made by <a href="https://warpcast.com/pauldowman.eth" target="_blank" rel="noopener noreferrer">pauldowman.eth</a></p>
        </div>
        <div className="footer-section">
          <ul className="footer-links">
            <li><a href="https://github.com/pauldowman/op-explorer" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://github.com/pauldowman/op-explorer/blob/main/README.md#hiring" target="_blank" rel="noopener noreferrer">Help build Optimism, we're hiring!</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 