import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const MentorshipContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const MentorshipPage: React.FC = () => {
  return (
    <MentorshipContainer>
      <h1>Mentorship</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>Mentorship connections and management will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </MentorshipContainer>
  );
};

export default MentorshipPage;