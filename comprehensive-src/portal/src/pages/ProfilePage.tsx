import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ProfilePage: React.FC = () => {
  return (
    <ProfileContainer>
      <h1>Profile</h1>
      <ScrollCard>
        <ScrollCard.Content>
          <p>User profile management and settings will be implemented here.</p>
        </ScrollCard.Content>
      </ScrollCard>
    </ProfileContainer>
  );
};

export default ProfilePage;