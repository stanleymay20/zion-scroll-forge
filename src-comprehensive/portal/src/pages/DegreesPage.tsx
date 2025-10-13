import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const DegreesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const DegreesPage: React.FC = () => {
  return (
    <DegreesContainer>
      <h1>Degree Programs</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>Degree program management and progress tracking will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </DegreesContainer>
  );
};

export default DegreesPage;