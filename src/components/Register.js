import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

// Get API URL from environment variable
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (values) => {
    setLoading(true);
    setSuccessMessage("");
    try {
      const response = await axios.post("http://ec2-65-1-112-188.ap-south-1.compute.amazonaws.com:8080", values);

      if (response.data.status === "success") {
        setSuccessMessage(response.data.message || "Registration successful!");
        message.success(response.data.message || "Registration successful!");

        // Automatically redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        message.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Registration failed");
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
            Create Account
          </Title>
          <p style={{ color: "#7f8c8d" }}>Join our community</p>
          {successMessage && (
            <div style={{ color: "green", marginBottom: 20 }}>{successMessage}</div>
          )}
        </div>

        <Form onFinish={handleRegister}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter username!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#7f8c8d" }} />}
              placeholder="Username"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter password!" }]}
          >
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
              disabled={loading}
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
              {loading ? "Registering..." : "Register"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 20, color: "#7f8c8d" }}>
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/login";
            }}
            style={{ color: "#764ba2", fontWeight: 600, textDecoration: "none" }}
          >
            Login now
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Register;
