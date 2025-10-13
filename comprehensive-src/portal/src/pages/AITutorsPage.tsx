import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const AITutorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const AITutorsPage: React.FC = () => {
  return (
    <AITutorsContainer>
      <h1>AI Tutors</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>AI tutor sessions and interactions will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </AITutorsContainer>
  );
};

export default AITutorsPage;