import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const CoursesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const CoursesPage: React.FC = () => {
  return (
    <CoursesContainer>
      <h1>Courses</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>Course browsing and enrollment functionality will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </CoursesContainer>
  );
};

export default CoursesPage;