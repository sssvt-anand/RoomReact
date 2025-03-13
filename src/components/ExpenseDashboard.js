import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layout, Table, Card, Typography, Space, message,
  Button, Form, Input, Select, DatePicker, Modal
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

// Axios request interceptor
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ExpenseDashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberExpenses, setMemberExpenses] = useState([]);
  const [isExpenseModalVisible, setExpenseModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [userRole, setUserRole] = useState('USER');
  const [currentMemberId, setCurrentMemberId] = useState(null);

  // Role extraction function
  const getRoleFromToken = (decoded) => {
    try {
      const roles = decoded.roles || decoded.role || [];
      const roleValue = Array.isArray(roles) ? roles[0] : roles;
      const roleString = typeof roleValue === 'object' 
        ? roleValue.authority 
        : roleValue;
      return roleString?.replace(/^ROLE_/i, '')?.toUpperCase() || 'USER';
    } catch (error) {
      console.error('Role extraction error:', error);
      return 'USER';
    }
  };

  // Error handler
  const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      const { data } = error.response;
      message.error(data?.message || defaultMessage);
    } else {
      message.error(defaultMessage);
    }
  };

  // Authentication and data initialization
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      const role = getRoleFromToken(decoded);
      setUserRole(role || 'USER');
      setCurrentMemberId(decoded.memberId || decoded.sub);

      const fetchData = async () => {
        try {
          await Promise.all([
            fetchExpenses(),
            fetchMembers(),
            fetchMemberExpenses()
          ]);
        } catch (error) {
          message.error('Failed to initialize data');
        }
      };
      fetchData();

    } catch (error) {
      console.error('Authentication error:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  // Data fetching functions
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/expenses`);
      setExpenses(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch expenses');
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/members`);
      setMembers(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch members');
    }
  }, []);

  const fetchMemberExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/expenses/summary`);
      const formattedData = Object.entries(response.data).map(([name, amounts]) => ({
        name,
        total: amounts.total,
        cleared: amounts.cleared,
        remaining: amounts.remaining
      }));
      setMemberExpenses(formattedData);
    } catch (error) {
      handleApiError(error, 'Failed to fetch member expenses');
    }
  }, []);

  // Add Expense handler
  const handleAddExpense = async (values) => {
    try {
      await axios.post(`${apiBaseUrl}/api/expenses`, values);
      message.success('Expense added successfully!');
      setExpenseModalVisible(false);
      form.resetFields();
      await Promise.all([fetchExpenses(), fetchMemberExpenses()]);
    } catch (error) {
      handleApiError(error, 'Failed to add expense');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Member',
      dataIndex: ['member', 'name'],
      key: 'member',
      sorter: (a, b) => a.member.name.localeCompare(b.member.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: value => `₹${value.toFixed(2)}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        // Safely handle undefined values
        const total = record.amount || 0;
        const cleared = record.clearedAmount || 0;
        const lastCleared = record.lastClearedAmount || 0;
        const remaining = total - cleared;
    
        return (
          <Space direction="vertical">
            {record.cleared ? (
              <Text type="success">
                Fully Cleared: ₹{cleared.toFixed(2)}
                <br/>
                By {record.clearedBy?.name || 'unknown'} 
                ({record.clearedAt ? moment(record.clearedAt).format('MMM Do') : 'N/A'})
              </Text>
            ) : cleared > 0 ? (
              <>
                <Text type="warning">
                  Partially Cleared: ₹{cleared.toFixed(2)}/₹{total.toFixed(2)}
                </Text>
                <Text>
                  Last Payment: ₹{lastCleared.toFixed(2)} 
                  by {record.lastClearedBy?.name || 'unknown'} 
                  ({record.lastClearedAt ? moment(record.lastClearedAt).format('MMM Do') : 'N/A'})
                </Text>
                <Text type="danger">
                  Remaining: ₹{remaining.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text type="secondary">Pending Clearance</Text>
            )}
          </Space>
          );
       }
    },
  ];

  return (
    <Layout style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        right: 24, 
        color: userRole === 'ADMIN' ? '#52c41a' : '#1890ff',
        fontWeight: 'bold'
      }}>
        {userRole === 'ADMIN' ? '⚡ Admin User' : '👤 Regular User'}
      </div>
      
      <Content>
        <Card title="Member Balances" style={{ marginBottom: 24 }}>
          {memberExpenses.map(member => (
            <div key={member.name} style={{ 
              padding: 12,
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Text strong>{member.name}</Text>
              <Space size="large">
                <Text>Total: ₹{member.total.toFixed(2)}</Text>
                <Text type="success">Cleared: ₹{member.cleared.toFixed(2)}</Text>
                <Text type="danger">Remaining: ₹{member.remaining.toFixed(2)}</Text>
              </Space>
            </div>
          ))}
        </Card>

        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setExpenseModalVisible(true);
            form.resetFields();
          }}
          style={{ marginBottom: 16 }}
        >
          Add Expense
        </Button>

        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="id"
          bordered
          pagination={{ pageSize: 8 }}
        />

        {/* Add Expense Modal */}
        <Modal
          title="Add Expense"
          open={isExpenseModalVisible}
          onCancel={() => setExpenseModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleAddExpense} layout="vertical">
            <Form.Item name="memberId" label="Member" rules={[{ required: true }]}>
              <Select placeholder="Select member">
                {members.map(member => (
                  <Option key={member.id} value={member.id}>
                    {member.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input placeholder="Enter expense description" />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <Input type="number" placeholder="Enter amount" />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Expense
            </Button>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ExpenseDashboard;