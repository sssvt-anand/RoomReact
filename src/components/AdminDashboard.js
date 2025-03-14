import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layout, Table, Button, Modal, Form, Input, Select, message, 
  Space, Typography, Grid, DatePicker 
} from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import StatusRenderer from './StatusRenderer';
import ActionButtons from './ActionButtons';
import MemberModal from './MemberModal';
import PaymentModal from './PaymentModal';

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const mobileAxios = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Mobile-Optimized': 'true'
  },
  transitional: {
    silentJSONParsing: false,
    forcedJSONParsing: true
  }
});

mobileAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [isExpenseModalVisible, setExpenseModalVisible] = useState(false);
  const [isMemberModalVisible, setMemberModalVisible] = useState(false);
  const [isClearModalVisible, setClearModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [currentClearExpenseId, setCurrentClearExpenseId] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [selectedClearMemberId, setSelectedClearMemberId] = useState(null);
  const [clearAmount, setClearAmount] = useState('');

  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  // Authentication and role handling
  const getRoleFromToken = useCallback((decoded) => {
    try {
      const roles = decoded.roles || decoded.role || [];
      const roleValue = Array.isArray(roles) ? roles[0] : roles;
      const roleString = typeof roleValue === 'object' 
        ? roleValue.authority 
        : roleValue;
      return roleString?.replace(/^ROLE_/i, '')?.toUpperCase() || 'USER';
    } catch (error) {
      return 'USER';
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserRole(getRoleFromToken(decoded));
      initializeData();
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, getRoleFromToken]);

  // Data handling
  const initializeData = useCallback(async () => {
    try {
      await Promise.all([fetchExpenses(), fetchMembers()]);
    } catch (error) {
      handleApiError(error, 'Failed to load data');
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await mobileAxios.get(`${apiBaseUrl}/api/expenses`);
      setExpenses(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch expenses');
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await mobileAxios.get(`${apiBaseUrl}/api/members`);
      setMembers(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch members');
    }
  }, []);

  // Error handling
  const handleApiError = useCallback((error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || defaultMessage;
    message.error(isMobile ? errorMessage : `${errorMessage} - ${error.config.url}`);
  }, [isMobile]);

  // Expense actions
  const handleAddExpense = useCallback(async (values) => {
    try {
      await mobileAxios.post(`${apiBaseUrl}/api/expenses`, values);
      message.success('Expense added!');
      setExpenseModalVisible(false);
      form.resetFields();
      await fetchExpenses();
    } catch (error) {
      handleApiError(error, 'Failed to add expense');
    }
  }, [fetchExpenses, form, handleApiError]);

  const handleEditExpense = useCallback((record) => {
    setExpenseModalVisible(true);
    setIsEditing(true);
    setCurrentExpenseId(record.id);
    form.setFieldsValue({
      memberId: record.member.id,
      description: record.description,
      amount: record.amount,
      date: moment(record.date)
    });
  }, [form]);

  const handleUpdateExpense = useCallback(async (values) => {
    try {
      await mobileAxios.put(`${apiBaseUrl}/api/expenses/${currentExpenseId}`, values);
      message.success('Expense updated!');
      setExpenseModalVisible(false);
      setIsEditing(false);
      await fetchExpenses();
    } catch (error) {
      handleApiError(error, 'Failed to update expense');
    }
  }, [currentExpenseId, fetchExpenses, handleApiError]);

  const handleDeleteExpense = useCallback(async (id) => {
    try {
      await mobileAxios.delete(`${apiBaseUrl}/api/expenses/${id}`);
      message.success('Expense deleted!');
      await fetchExpenses();
    } catch (error) {
      handleApiError(error, 'Failed to delete expense');
    }
  }, [fetchExpenses, handleApiError]);

  // Payment handling
  const handleClearExpense = useCallback(async () => {
    try {
      if (!selectedClearMemberId || !clearAmount) {
        message.error('Please fill all fields');
        return;
      }
      
      await mobileAxios.put(
        `${apiBaseUrl}/api/expenses/clear/${currentClearExpenseId}`,
        null,
        { params: { memberId: selectedClearMemberId, amount: clearAmount } }
      );
      
      message.success('Payment recorded!');
      setClearModalVisible(false);
      setSelectedClearMemberId(null);
      setClearAmount('');
      await fetchExpenses();
    } catch (error) {
      handleApiError(error, 'Failed to clear expense');
    }
  }, [currentClearExpenseId, selectedClearMemberId, clearAmount, fetchExpenses, handleApiError]);

  // Member handling
  const handleAddMember = useCallback(async (values) => {
    try {
      await mobileAxios.post(`${apiBaseUrl}/api/members`, values);
      message.success('Member added!');
      setMemberModalVisible(false);
      memberForm.resetFields();
      await fetchMembers();
    } catch (error) {
      handleApiError(error, 'Failed to add member');
    }
  }, [fetchMembers, handleApiError, memberForm]);

  // Responsive table columns
  const columns = [
    {
      title: 'Member',
      dataIndex: ['member', 'name'],
      key: 'member',
      responsive: ['md'],
      sorter: (a, b) => a.member.name.localeCompare(b.member.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'],
      ellipsis: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: value => `₹${value.toFixed(2)}`,
      responsive: ['sm'],
      className: 'mobile-amount-column'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format(isMobile ? 'MMM D' : 'YYYY-MM-DD'),
      responsive: ['sm'],
      className: 'mobile-date-column'
    },
    {
      title: 'Status',
      key: 'status',
      responsive: ['md'],
      render: (_, record) => <StatusRenderer record={record} isMobile={isMobile} />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <ActionButtons 
          record={record}
          userRole={userRole}
          isMobile={isMobile}
          handleEditExpense={handleEditExpense}
          handleDeleteExpense={handleDeleteExpense}
          setCurrentClearExpenseId={setCurrentClearExpenseId}
          setClearModalVisible={setClearModalVisible}
        />
      )
    },
  ];

  return (
    <div 
      className="admin-container"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="header-container">
        <h2>Expense Management</h2>
        <Button 
          className="dashboard-button" 
          onClick={() => navigate('/')}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          {isMobile ? 'Dashboard' : 'Back to Dashboard'}
        </Button>
      </div>

      <Layout style={{ 
        padding: isMobile ? 8 : 24, 
        minHeight: '100vh',
        touchAction: 'manipulation'
      }}>
        <Text className="role-badge">
          {userRole === 'ADMIN' ? '⚡ Admin' : '👤 User'}
        </Text>
        
        <Content>
          <Space className="button-group">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size={isMobile ? 'small' : 'middle'}
              onClick={() => {
                setExpenseModalVisible(true);
                form.resetFields();
              }}
              style={{ 
                minWidth: '48px',
                minHeight: '48px',
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              {isMobile ? 'Add' : 'Add Expense'}
            </Button>
            
            {userRole === 'ADMIN' && (
              <Button 
                type="dashed" 
                icon={<UserOutlined />}
                size={isMobile ? 'small' : 'middle'}
                onClick={() => setMemberModalVisible(true)}
                style={{ 
                  minWidth: '48px',
                  minHeight: '48px',
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                {isMobile ? 'Member' : 'Add Member'}
              </Button>
            )}
          </Space>

          <div className="mobile-scroll-container" style={{ 
            WebkitOverflowScrolling: 'touch',
            overflowX: 'auto'
          }}>
            <Table
              columns={columns}
              dataSource={expenses}
              rowKey="id"
              bordered
              pagination={{ pageSize: isMobile ? 5 : 8 }}
              scroll={{ x: true }}
              size={isMobile ? 'small' : 'middle'}
              className="mobile-optimized-table"
            />
          </div>

          <Modal
            title={isEditing ? "Edit Expense" : "Add Expense"}
            open={isExpenseModalVisible}
            onCancel={() => setExpenseModalVisible(false)}
            footer={null}
            className="admin-modal"
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Form form={form} onFinish={isEditing ? handleUpdateExpense : handleAddExpense} layout="vertical">
              <Form.Item name="memberId" label="Member" rules={[{ required: true }]}>
                <Select
                  placeholder="Select member"
                  showSearch
                  virtual={!isMobile}
                  listHeight={200}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{
                    maxWidth: '80vw',
                    minWidth: '200px'
                  }}
                >
                  {members.map(member => (
                    <Option key={member.id} value={member.id}>{member.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <Input 
                  placeholder="Enter description" 
                  maxLength={50}
                  style={{ fontSize: '16px' }}
                />
              </Form.Item>
              <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                <Input 
                  type="number"
                  placeholder="Enter amount"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  style={{ 
                    height: '48px',
                    fontSize: '16px'
                  }}
                  onFocus={(e) => {
                    if(isMobile) {
                      setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth' }), 300);
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker 
                  style={{ width: '100%' }}
                  inputReadOnly={isMobile}
                  allowClear={false}
                />
              </Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size={isMobile ? 'large' : 'middle'}
                style={{ minHeight: '48px' }}
              >
                {isEditing ? "Update" : "Add Expense"}
              </Button>
            </Form>
          </Modal>

          <MemberModal
            visible={isMemberModalVisible}
            onCancel={() => setMemberModalVisible(false)}
            form={memberForm}
            handleSubmit={handleAddMember}
            isMobile={isMobile}
          />

          <PaymentModal
            visible={isClearModalVisible}
            onCancel={() => {
              setClearModalVisible(false);
              setSelectedClearMemberId(null);
              setClearAmount('');
            }}
            onOk={handleClearExpense}
            members={members}
            clearAmount={clearAmount}
            setClearAmount={setClearAmount}
            setSelectedClearMemberId={setSelectedClearMemberId}
            isMobile={isMobile}
          />
        </Content>
      </Layout>
    </div>
  );
};

export default AdminDashboard;