import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, values);

      // Check if response contains a valid token
      if (response.data.token) {
        const token = response.data.token;

        // Validate token format (JWT has two dots)
        if (token.split(".").length === 3) {
          localStorage.setItem("token", token);
          localStorage.setItem("username", response.data.username);
          localStorage.setItem("userRole", response.data.role);

          message.success("Login successful!");
          onLogin();
          navigate("/dashboard");
        } else {
          throw new Error("Invalid token received from server.");
        }
      } else {
        throw new Error("Token not provided in response.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorMsg(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <Card hoverable style={cardStyle} bodyStyle={{ padding: "40px 25px" }}>
        <div style={headerStyle}>
          <Title level={3} style={titleStyle}>
            Welcome Back
          </Title>
          <p style={subtitleStyle}>Please login to continue</p>
        </div>

        {errorMsg && <div style={errorStyle}>{errorMsg}</div>}

        <Form name="login-form" initialValues={{ remember: true }} onFinish={handleLogin} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
            <Input prefix={<UserOutlined style={iconStyle} />} placeholder="Username" size="large" style={inputStyle} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password prefix={<LockOutlined style={iconStyle} />} placeholder="Password" size="large" style={inputStyle} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={buttonStyle}>
              Log in
            </Button>
          </Form.Item>

          <Divider style={{ margin: "16px 0" }} />

          <div style={footerStyle}>
            <Text>Don't have an account? </Text>
            <Button type="link" onClick={() => navigate("/register")} style={linkStyle}>
              Register now
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

// Style constants
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
};

const cardStyle = {
  width: "90%",
  maxWidth: 400,
  borderRadius: 15,
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  border: "none",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: 30,
};

const titleStyle = {
  color: "#2c3e50",
  marginBottom: 5,
};

const subtitleStyle = {
  color: "#7f8c8d",
  margin: 0,
};

const errorStyle = {
  color: "red",
  textAlign: "center",
  marginBottom: 20,
};

const iconStyle = {
  color: "#7f8c8d",
};

const inputStyle = {
  borderRadius: 8,
};

const buttonStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  marginTop: 15,
};

const footerStyle = {
  textAlign: "center",
  marginTop: 20,
  color: "#7f8c8d",
};

const linkStyle = {
  color: "#764ba2",
  fontWeight: 600,
  padding: 0,
  height: "auto",
};

export default Login;
