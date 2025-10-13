import React from 'react';
import styled from 'styled-components';

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border-radius: 20px;
  color: #1a1a2e;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
`;

const CoinIcon = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  background: #1a1a2e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  font-weight: bold;
  font-size: 0.75rem;
`;

const BalanceText = styled.span`
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
`;

export const ScrollCoinBalance: React.FC = () => {
  // Mock balance - in real implementation, this would come from state/API
  const balance = 1247.50;

  return (
    <BalanceContainer>
      <CoinIcon>SC</CoinIcon>
      <BalanceText>{balance.toLocaleString()}</BalanceText>
    </BalanceContainer>
  );
};

export default ScrollCoinBalance;