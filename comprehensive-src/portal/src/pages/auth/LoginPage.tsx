import React from 'react';
import styled from 'styled-components';
import { ScrollCard } from '../../components/ui/ScrollCard';
import { ScrollButton } from '../../components/ui/ScrollButton';
import { ScrollInput } from '../../components/ui/ScrollInput';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled(ScrollCard)`
  width: 100%;
  max-width: 400px;
`;

const LoginForm = styled.form`
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

export const LoginPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login submitted');
  };

  return (
    <LoginContainer>
      <LoginCard variant="elevated" padding="large">
        <Logo>
          <LogoIcon>SU</LogoIcon>
          <LogoText>ScrollUniversity</LogoText>
        </Logo>
        
        <LoginForm onSubmit={handleSubmit}>
          <ScrollInput
            label="Email or ScrollCoin Wallet"
            type="email"
            placeholder="Enter your email or wallet address"
            fullWidth
          />
          
          <ScrollInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            fullWidth
          />
          
          <ScrollButton type="submit" variant="primary" fullWidth>
            Sign In
          </ScrollButton>
          
          <ScrollButton type="button" variant="prophetic" fullWidth>
            Connect ScrollCoin Wallet
          </ScrollButton>
          
          <ScrollButton type="button" variant="tertiary" fullWidth>
            Create Account
          </ScrollButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;