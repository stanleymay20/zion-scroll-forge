import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const ScholarshipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ScholarshipsPage: React.FC = () => {
  return (
    <ScholarshipsContainer>
      <h1>Scholarships</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>Scholarship applications and financial aid will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </ScrollNodesContainer>
  );
};

export default ScholarshipsPage;