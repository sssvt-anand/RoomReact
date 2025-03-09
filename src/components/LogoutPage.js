import React, { useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear all client-side storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies by expiring them
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.split("=");
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });

        // Call logout API
        await axios.post(
          `${apiBaseUrl}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );

        // Force full reload to clear application state
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout error:", error);
        navigate("/login");
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <Container>
      <LogoutContainer>
        <Title>Logging You Out...</Title>
        <LoadingSpinner>
          <div className="spinner"></div>
          <p>Clearing session and redirecting to login</p>
        </LoadingSpinner>
      </LogoutContainer>
    </Container>
  );
};

// Styled Components
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 24px;
`;

const LoadingSpinner = styled.div`
  margin: 30px 0;

  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #7f8c8d;
    margin-top: 15px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default LogoutPage;