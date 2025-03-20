import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { Link } from "react-router-dom";
import { 
  PieChartOutlined, 
  UserOutlined, 
  DownloadOutlined, 
  LogoutOutlined,
  MenuOutlined 
} from "@ant-design/icons";

const { Sider } = Layout;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false); // State to control sidebar collapse

  const handleLogout = async () => {
    try {
      // Clear client storage first
      localStorage.clear();
      sessionStorage.clear();

      // Call logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      });

      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      // Redirect with full page reload
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Hamburger Menu Button for Mobile */}
      <Button
        type="primary"
        icon={<MenuOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1,
          display: "block", // Show only on mobile
        }}
        className="mobile-menu-button"
      />

      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null} // Hide the default collapse trigger
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          zIndex: 1,
        }}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="dashboard" icon={<PieChartOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="expenses" icon={<PieChartOutlined />}>
            <Link to="/expenses">Expenses</Link>
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>
            <Link to="/users">User Management</Link>
          </Menu.Item>
          <Menu.Item key="admins" icon={<UserOutlined />}>
            <Link to="/admindashboard">Admin Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="export" icon={<DownloadOutlined />}>
            <Link to="/export">Export Data</Link>
          </Menu.Item>
          <Menu.Item 
            key="logout" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ marginTop: "auto" }}
          >
            Log Out
          </Menu.Item>
        </Menu>
      </Sider>
    </>
  );
};

export default Sidebar;