import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import TopNavbar from "./components/TopNavbar"; // Import the TopNavbar component
import Dashboard from "./components/Dashboard";
import ExpenseDashboard from "./components/ExpenseDashboard";
import UserManagement from "./components/UserManagement";
import Login from "./components/Login";
import Register from "./components/Register";
import ExportPage from "./components/ExportPage";
import AdminDashboard from "./components/AdminDashboard";

const { Header, Content } = Layout;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <Layout style={{ minHeight: "100vh" }}>
                  <Header>
                    <TopNavbar onLogout={handleLogout} />
                  </Header>
                  <Content style={{ margin: "20px" }}>
                    <Dashboard />
                  </Content>
                </Layout>
              }
            />
            <Route
              path="/expenses"
              element={
                <Layout style={{ minHeight: "100vh" }}>
                  <Header>
                    <TopNavbar onLogout={handleLogout} />
                  </Header>
                  <Content style={{ margin: "20px" }}>
                    <ExpenseDashboard />
                  </Content>
                </Layout>
              }
            />
            <Route
              path="/users"
              element={
                <Layout style={{ minHeight: "100vh" }}>
                  <Header>
                    <TopNavbar onLogout={handleLogout} />
                  </Header>
                  <Content style={{ margin: "20px" }}>
                    <UserManagement />
                  </Content>
                </Layout>
              }
            />
            <Route
              path="/admindashboard"
              element={
                <Layout style={{ minHeight: "100vh" }}>
                  <Header>
                    <TopNavbar onLogout={handleLogout} />
                  </Header>
                  <Content style={{ margin: "20px" }}>
                    <AdminDashboard />
                  </Content>
                </Layout>
              }
            />
            <Route
              path="/export"
              element={
                <Layout style={{ minHeight: "100vh" }}>
                  <Header>
                    <TopNavbar onLogout={handleLogout} />
                  </Header>
                  <Content style={{ margin: "20px" }}>
                    <ExportPage />
                  </Content>
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;