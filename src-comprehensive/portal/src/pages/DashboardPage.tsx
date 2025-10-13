import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../components/ui/ScrollCard';
import { ScrollButton } from '../components/ui/ScrollButton';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(ScrollCard)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

export const DashboardPage: React.FC = () => {
  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Welcome to ScrollUniversity Portal</h1>
        <p>Your prophetic journey in AI-powered global education begins here.</p>
      </WelcomeSection>

      <StatsGrid>
        <StatCard variant="elevated">
          <StatValue>12</StatValue>
          <StatLabel>Courses Enrolled</StatLabel>
        </StatCard>
        
        <StatCard variant="elevated">
          <StatValue>1,247</StatValue>
          <StatLabel>ScrollCoins Earned</StatLabel>
        </StatCard>
        
        <StatCard variant="elevated">
          <StatValue>89%</StatValue>
          <StatLabel>Overall Progress</StatLabel>
        </StatCard>
        
        <StatCard variant="prophetic">
          <StatValue>✨ 7</StatValue>
          <StatLabel>Prophetic Achievements</StatLabel>
        </StatCard>
      </StatsGrid>

      <ScrollCard variant="course">
        <ScrollCard.Header>
          <ScrollCard.Title>Quick Actions</ScrollCard.Title>
          <ScrollCard.Subtitle>Get started with your learning journey</ScrollCard.Subtitle>
        </ScrollCard.Header>
        
        <QuickActions>
          <ScrollButton variant="primary" fullWidth>
            Browse Courses
          </ScrollButton>
          <ScrollButton variant="secondary" fullWidth>
            Start AI Tutor Session
          </ScrollButton>
          <ScrollButton variant="prophetic" fullWidth>
            Join XR Classroom
          </ScrollButton>
          <ScrollButton variant="tertiary" fullWidth>
            View Scholarships
          </ScrollButton>
        </QuickActions>
      </ScrollCard>
    </DashboardContainer>
  );
};

export default DashboardPage;