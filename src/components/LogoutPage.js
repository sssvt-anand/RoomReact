import React from 'react';
import styled from 'styled-components';

const LogoutPage = () => {
  return (
    <Container>
      <LogoutContainer>
        <Title>You've Successfully Logged Out</Title>
        
        <ButtonGroup>
          <PrimaryButton href="/login">Return to Login</PrimaryButton>
          <SecondaryButton href="/forgot-password">Forgot Password?</SecondaryButton>
        </ButtonGroup>

        <SecurityTip>
          Security Tip: For your safety, always close this browser after logging out.
        </SecurityTip>

        <HelpSection>
          <div>Need Help?</div>
          <HelpLinks>
            <a href="/contact-support">Contact Support</a> | 
            <a href="/tutorials">View Tutorials</a>
          </HelpLinks>
        </HelpSection>

        <CreateAccount>
          New Here? <a href="/register">Create an Account</a>
        </CreateAccount>
      </LogoutContainer>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
`;

const LogoutContainer = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 25px 0;
`;

const BaseButton = styled.a`
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
`;

const PrimaryButton = styled(BaseButton)`
  background: #3498db;
  color: white;
  border: 2px solid #3498db;

  &:hover {
    background: #2980b9;
    border-color: #2980b9;
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: none;
  color: #3498db;
  border: 2px solid #3498db;

  &:hover {
    background: #f0f8ff;
  }
`;

const SecurityTip = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
  color: #7f8c8d;
  font-size: 14px;
`;

const HelpSection = styled.div`
  margin: 25px 0;
  color: #7f8c8d;
`;

const HelpLinks = styled.div`
  margin: 15px 0;
  
  a {
    color: #3498db;
    text-decoration: none;
    margin: 0 10px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CreateAccount = styled.div`
  margin-top: 20px;
  color: #7f8c8d;
  
  a {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default LogoutPage;