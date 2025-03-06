import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layout, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Card, 
  DatePicker, 
  Space, 
  Typography 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;

const ExpenseDashboard = () => {
  // State management
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [isExpenseModalVisible, setExpenseModalVisible] = useState(false);
  const [isMemberModalVisible, setMemberModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [memberExpenses, setMemberExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);

  // Data fetching
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      message.error('Failed to fetch expenses');
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/members');
      setMembers(response.data);
    } catch (error) {
      message.error('Failed to fetch members');
    }
  }, []);

  const fetchMemberExpenses = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/expenses/summary');
      const formattedData = Object.entries(response.data).map(([name, amounts]) => ({
        name,
        total: amounts.total,
        cleared: amounts.cleared,
        remaining: amounts.remaining
      }));
      setMemberExpenses(formattedData);
    } catch (error) {
      message.error('Failed to fetch member expenses');
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchMembers();
    fetchMemberExpenses();
  }, [fetchExpenses, fetchMembers, fetchMemberExpenses]);

  // Handlers
  const handleAddExpense = async (values) => {
    try {
      await axios.post('http://localhost:8080/api/expenses', values);
      message.success('Expense added!');
      setExpenseModalVisible(false);
      form.resetFields();
      setIsEditing(false);
      setCurrentExpenseId(null);
      await fetchExpenses();
      await fetchMemberExpenses();
    } catch (error) {
      message.error('Failed to add expense');
    }
  };

  const handleUpdateExpense = async (values) => {
    try {
      await axios.put(`http://localhost:8080/api/expenses/${currentExpenseId}`, values);
      message.success('Expense updated!');
      setExpenseModalVisible(false);
      form.resetFields();
      setIsEditing(false);
      setCurrentExpenseId(null);
      await fetchExpenses();
      await fetchMemberExpenses();
    } catch (error) {
      message.error('Failed to update expense');
    }
  };

  const handleAddMember = async (values) => {
    try {
      await axios.post('http://localhost:8080/api/members', values);
      message.success('Member added!');
      setMemberModalVisible(false);
      memberForm.resetFields();
      await fetchMembers();
    } catch (error) {
      message.error('Failed to add member');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/expenses/${id}`);
      message.success('Expense deleted!');
      await fetchExpenses();
      await fetchMemberExpenses();
    } catch (error) {
      message.error('Failed to delete expense');
    }
  };

  // Table configuration
  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => setFilteredInfo({});

  const columns = [
    {
      title: 'Member',
      dataIndex: ['member', 'name'],
      key: 'member',
      sorter: (a, b) => a.member.name.localeCompare(b.member.name),
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch
            placeholder="Search member"
            style={{ width: 200 }}
            onChange={value => setSelectedKeys(value ? [value] : [])}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {members.map(member => (
              <Option key={member.id} value={member.name}>{member.name}</Option>
            ))}
          </Select>
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" onClick={confirm} size="small">Filter</Button>
            <Button onClick={clearFilters} size="small">Reset</Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: value => `₹${value.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('YYYY-MM-DD'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            format="YYYY-MM-DD"
            onChange={(date, dateString) => setSelectedKeys([dateString])}
          />
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" onClick={confirm} size="small">Filter</Button>
            <Button onClick={clearFilters} size="small">Reset</Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => {
            setExpenseModalVisible(true);
            setIsEditing(true);
            setCurrentExpenseId(record.id);
            form.setFieldsValue({
              memberId: record.member.id,
              description: record.description,
              amount: record.amount,
              date: moment(record.date)
            });
          }}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteExpense(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', padding: 24 }}>
      <Content>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <Card title="Member Expenses">
            {memberExpenses.map((member) => (
              <div key={member.name} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: 8,
                padding: 8,
                backgroundColor: '#fafafa'
              }}>
                <div style={{ flex: 1 }}>
                  <Text strong>{member.name}</Text>
                </div>
                <div style={{ flex: 2, textAlign: 'right' }}>
                  <Space size="large">
                    <div>
                      <Text type="secondary">Total</Text>
                      <br />
                      <Text strong>₹{member.total.toFixed(2)}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Cleared</Text>
                      <br />
                      <Text style={{ color: '#52c41a' }}>₹{member.cleared.toFixed(2)}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Remaining</Text>
                      <br />
                      <Text style={{ color: '#ff4d4f' }}>₹{member.remaining.toFixed(2)}</Text>
                    </div>
                  </Space>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Control Bar */}
        <Space style={{ margin: '24px 0' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setExpenseModalVisible(true);
              setIsEditing(false);
              form.resetFields();
            }}
          >
            Add Expense
          </Button>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </Space>

        {/* Main Table */}
        <Table
          columns={columns}
          dataSource={expenses}
          onChange={handleTableChange}
          rowKey="id"
          bordered
          scroll={{ x: true }}
        />

        {/* Members Table */}
        <Card title="Members" style={{ marginTop: 24 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setMemberModalVisible(true)}
            style={{ marginBottom: 16 }}
          >
            Add Member
          </Button>
          <Table
            dataSource={members}
            columns={[{ title: 'Name', dataIndex: 'name', key: 'name' }]}
            rowKey="id"
            pagination={false}
          />
        </Card>

        {/* Modals */}
        <Modal
          title={isEditing ? "Edit Expense" : "Add Expense"}
          visible={isExpenseModalVisible}
          onCancel={() => {
            setExpenseModalVisible(false);
            setIsEditing(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form 
            form={form} 
            onFinish={isEditing ? handleUpdateExpense : handleAddExpense} 
            layout="vertical"
          >
            <Form.Item name="memberId" label="Member" rules={[{ required: true }]}>
              <Select placeholder="Select member">
                {members.map(member => (
                  <Option key={member.id} value={member.id}>{member.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditing ? "Update" : "Submit"}
            </Button>
          </Form>
        </Modal>

        <Modal
          title="Add Member"
          visible={isMemberModalVisible}
          onCancel={() => setMemberModalVisible(false)}
          footer={null}
        >
          <Form form={memberForm} onFinish={handleAddMember} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ExpenseDashboard;