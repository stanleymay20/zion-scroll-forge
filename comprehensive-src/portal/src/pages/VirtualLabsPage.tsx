import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const VirtualLabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const VirtualLabsPage: React.FC = () => {
  return (
    <VirtualLabsContainer>
      <h1>Virtual Labs</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>Virtual laboratory experiences will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </VirtualLabsContainer>
  );
};

export default VirtualLabsPage;