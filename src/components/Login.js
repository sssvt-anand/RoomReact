import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, values);

      if (response.data.status === "success") {
        localStorage.setItem("username", values.username);
        message.success("Login successful!");
        onLogin();
      } else {
        setErrorMsg(response.data.message);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed - server not connect server unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Card
        hoverable
        style={{
          width: "90%",
          maxWidth: 400,
          borderRadius: 15,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          border: "none",
        }}
        bodyStyle={{ padding: "40px 25px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Title level={3} style={{ color: "#2c3e50", marginBottom: 5 }}>
            Welcome Back
          </Title>
          <p style={{ color: "#7f8c8d", margin: 0 }}>Please login to continue</p>
        </div>

        {errorMsg && (
          <div style={{ color: "red", textAlign: "center", marginBottom: 20 }}>
            {errorMsg}
          </div>
        )}

        <Form name="login-form" initialValues={{ remember: true }} onFinish={handleLogin} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
            <Input
              prefix={<UserOutlined style={{ color: "#7f8c8d" }} />}
              placeholder="Username"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: "#7f8c8d" }} />}
              placeholder="Password"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                marginTop: 15,
              }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 20, color: "#7f8c8d" }}>
          <span>Don't have an account? </span>
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/register";
            }}
            style={{ color: "#764ba2", fontWeight: 600, textDecoration: "none" }}
          >
            Register now
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Login;
