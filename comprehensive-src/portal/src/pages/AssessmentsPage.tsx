import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const AssessmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const AssessmentsPage: React.FC = () => {
  return (
    <AssessmentsContainer>
      <h1>Assessments</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>Assessment and evaluation functionality will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </AssessmentsContainer>
  );
};

export default AssessmentsPage;