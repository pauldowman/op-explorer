import { render, screen } from '@testing-library/react';
import DisplayAddress from '../DisplayAddress';

const address = '0x1234567890abcdef1234567890abcdef12345678' as const;

it('renders truncated address and link', () => {
  render(<DisplayAddress address={address} blockExplorerURL="https://etherscan.io" />);
  // truncated address should appear
  const truncated = '0x12345678...12345678';
  expect(screen.getByText(truncated)).toBeInTheDocument();
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', `https://etherscan.io/address/${address}`);
});
