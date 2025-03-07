import React from "react";
import { Layout, Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { 
  PieChartOutlined, 
  DownloadOutlined, 
  LogoutOutlined 
} from "@ant-design/icons";

const { Sider } = Layout;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Necessary for cookies/session
      });

      if (response.ok) {
        // Clear any user-related data from storage
        localStorage.removeItem("user");
        // Redirect to login page
        navigate("/login");
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sider collapsible>
      <Menu theme="dark" mode="inline">
        <Menu.Item key="dashboard" icon={<PieChartOutlined />}>
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="expenses" icon={<PieChartOutlined />}>
          <Link to="/expenses">Expenses</Link>
        </Menu.Item>
        <Menu.Item key="export" icon={<DownloadOutlined />}>
          <Link to="/export">Export Expenses</Link>
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
          Log Out
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
