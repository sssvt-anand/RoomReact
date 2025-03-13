import React, { useEffect, useState } from 'react';
import { Table, Select, Button, message, Card, Spin } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const { Option } = Select;
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

// ✅ Configure Axios with authentication
const authedAxios = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

authedAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Resolve user role from JWT token
const resolveUserRole = (decoded) => {
  if (!decoded) return 'USER';

  const roleSources = [
    decoded.roles,
    decoded.authorities,
    decoded?.authorities?.[0]?.authority,
    decoded.role,
    decoded.scope
  ];

  const validRole = roleSources.find(source => {
    if (!source) return false;
    const value = Array.isArray(source) ? source[0] : source;
    return typeof value === 'string' ? value.toUpperCase() : false;
  });

  return validRole ? validRole.toString().toUpperCase() : 'USER';
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('USER');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuthorization = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userRole = resolveUserRole(decoded);
        setCurrentUserRole(userRole);

        await fetchUsers();  
      } catch (error) {
        handleAuthError();
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    verifyAuthorization();
  }, [navigate]);

  // ✅ Fetch Users API
  const fetchUsers = async () => {
    try {
      const response = await authedAxios.get('/auth/users');
      setUsers(response.data.map(user => ({
        ...user,
        key: user.id,
        role: user.role?.replace('ROLE_', '') // Normalize role display
      })));
    } catch (error) {
      handleApiError(error, 'Failed to fetch users');
    }
  };

  // ✅ Handle Role Change
  const handleRoleChange = async (userId, newRole) => {
    if (currentUserRole !== 'ROLE_ADMIN' && currentUserRole !== 'ADMIN') {
      message.error('You do not have permission to change roles');
      return;
    }

    try {
      const backendRole = newRole.startsWith('ROLE_') ? newRole : `ROLE_${newRole}`;
      await authedAxios.put(`/auth/update/${userId}/role?newRole=${backendRole}`);

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      message.success('Role updated successfully');
    } catch (error) {
      handleApiError(error, 'Failed to update role');
    }
  };

  // ✅ Handle Authentication Error
  const handleAuthError = () => {
    message.error('Authentication failure');
    localStorage.clear();
    navigate('/login');
  };

  // ✅ Handle API Errors Gracefully
  const handleApiError = (error, defaultMessage) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    const errorMap = {
      401: 'Session expired - please login again',
      403: 'Administrator privileges required',
      404: 'Resource not found',
      500: 'Server error - please try later'
    };

    message.error(serverMessage || errorMap[status] || defaultMessage);

    if (status === 401) {
      handleAuthError();
    }
  };

  // ✅ Define Table Columns
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={value => handleRoleChange(record.id, value)}
          style={{ width: 120 }}
          disabled={currentUserRole !== 'ROLE_ADMIN' && currentUserRole !== 'ADMIN'} 
          loading={loading}
        >
          <Option value="USER">User</Option>
          <Option value="ADMIN">Admin</Option>
        </Select>
      ),
    },
  ];

  // ✅ Show Loader Until Auth is Verified
  if (!authChecked) {
    return (
      <div className="auth-check-spinner">
        <Spin tip="Verifying Security Credentials..." size="large" />
      </div>
    );
  }

  
  return (
    <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>User List</span>
        <Button 
          type="primary" 
          onClick={() => navigate('/dashboard')}
          style={{ marginLeft: 'auto' }}
        >
          Return to Dashboard
        </Button>
      </div>
      }
      className="user-management-card"
    >
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 8, 
          showSizeChanger: false 
        }}
        bordered
        locale={{
          emptyText: 'No user accounts found',
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default UserManagement;
