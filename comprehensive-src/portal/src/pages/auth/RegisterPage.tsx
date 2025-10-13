import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../../components/ui/ScrollCard';
import { ScrollButton } from '../../components/ui/ScrollButton';
import { ScrollInput } from '../../components/ui/ScrollInput';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  padding: 2rem;
`;

const RegisterCard = styled(ScrollCard)`
  width: 100%;
  max-width: 500px;
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  font-weight: bold;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  color: #1a1a2e;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const RegisterPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log('Registration submitted');
  };

  return (
    <RegisterContainer>
      <RegisterCard variant="elevated" padding="large">
        <Logo>
          <LogoIcon>SU</LogoIcon>
          <LogoText>Join ScrollUniversity</LogoText>
        </Logo>
        
        <RegisterForm onSubmit={handleSubmit}>
          <FormRow>
            <ScrollInput
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              fullWidth
            />
            
            <ScrollInput
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              fullWidth
            />
          </FormRow>
          
          <ScrollInput
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            fullWidth
          />
          
          <ScrollInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
            fullWidth
          />
          
          <ScrollInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            fullWidth
          />
          
          <ScrollButton type="submit" variant="primary" fullWidth>
            Create Account
          </ScrollButton>
          
          <ScrollButton type="button" variant="secondary" fullWidth>
            Already have an account? Sign In
          </ScrollButton>
        </RegisterForm>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;