import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const ScrollNodesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ScrollNodesPage: React.FC = () => {
  return (
    <ScrollNodesContainer>
      <h1>ScrollNodes</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>ScrollNode management and global network coordination will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </ScrollNodesContainer>
  );
};

export default ScrollNodesPage;