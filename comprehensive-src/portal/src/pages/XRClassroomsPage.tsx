import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const XRClassroomsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const XRClassroomsPage: React.FC = () => {
  return (
    <XRClassroomsContainer>
      <h1>XR Classrooms</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>XR classroom sessions and immersive learning will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </XRClassroomsContainer>
  );
};

export default XRClassroomsPage;