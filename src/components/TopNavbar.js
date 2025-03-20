// components/TopNavbar.js
import React from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { 
  PieChartOutlined, 
  UserOutlined, 
  DownloadOutlined, 
  LogoutOutlined 
} from "@ant-design/icons";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TopNavbar = ({ onLogout }) => {
  const location = useLocation(); // Get the current route location

  return (
    <Menu
      theme="light"
      mode="horizontal"
      selectedKeys={[location.pathname]} // Highlight the current route
      style={{ lineHeight: "64px" }} // Adjust height to match the header
    >
      <Menu.Item key="/" icon={<PieChartOutlined />}>
        <Link to="/">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="/expenses" icon={<PieChartOutlined />}>
        <Link to="/expenses">Expenses</Link>
      </Menu.Item>
      <Menu.Item key="/users" icon={<UserOutlined />}>
        <Link to="/users">User Management</Link>
      </Menu.Item>
      <Menu.Item key="/admindashboard" icon={<UserOutlined />}>
        <Link to="/admindashboard">Admin Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="/export" icon={<DownloadOutlined />}>
        <Link to="/export">Export Data</Link>
      </Menu.Item>
      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />} 
        onClick={onLogout}
        style={{ float: "right" }} // Align logout to the right
      >
        Log Out
      </Menu.Item>
    </Menu>
  );
};

export default TopNavbar;