import React, { useEffect, useState } from 'react';
import { Layout, Card, Table, Statistic, Row, Col, Typography, Spin, Alert } from 'antd';
import { DollarOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [memberExpenses, setMemberExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch expenses
      const expensesRes = await axios.get('http://localhost:8080/api/expenses');
      setExpenses(expensesRes.data.slice(-5).reverse()); // Get last 5 expenses

      // Fetch members
      const membersRes = await axios.get('http://localhost:8080/api/members');
      setMembers(membersRes.data);

      // Fetch summary
      const totalAmount = expensesRes.data.reduce((sum, expense) => sum + expense.amount, 0);
      setSummary({
        total: totalAmount,
        count: expensesRes.data.length
      });

      // Fetch member expenses
      const memberExpensesRes = await axios.get('http://localhost:8080/api/expenses/summarytotal');
      setMemberExpenses(Object.entries(memberExpensesRes.data));
    } catch (error) {
      setError('Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const expenseColumns = [
    {
      title: 'Member',
      dataIndex: ['member', 'name'],
      key: 'member',
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
      render: value => `₹${value.toFixed(2)}`
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('YYYY-MM-DD')
    }
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '24px' }}>
        <Content style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '24px' }}>
        <Content style={{ textAlign: 'center' }}>
          <Alert message={error} type="error" showIcon />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <Content>
        <Title level={2} style={{ marginBottom: 24 }}>Dashboard Overview</Title>
        
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Expenses"
                value={summary.total}
                precision={2}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Transactions"
                value={summary.count}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card 
              title="Recent Expenses"
              extra={<Text strong>Last 5 transactions</Text>}
            >
              {expenses.length === 0 ? (
                <Text>No recent expenses to show.</Text>
              ) : (
                <Table
                  dataSource={expenses}
                  columns={expenseColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              )}
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="Member Expenses Summary">
              {memberExpenses.length === 0 ? (
                <Text>No expense summary available for members.</Text>
              ) : (
                memberExpenses.map(([name, amount]) => (
                  <div 
                    key={name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: '#fafafa',
                      borderRadius: 4
                    }}
                  >
                    <Text>{name}</Text>
                    <Text strong>₹{typeof amount === 'number' ? amount.toFixed(2) : '0.00'}</Text>
                  </div>
                ))
              )}
            </Card>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Card title="Active Members">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {members.length === 0 ? (
                  <Text>No active members to display.</Text>
                ) : (
                  members.map(member => (
                    <Card.Grid 
                      key={member.id} 
                      style={{ 
                        width: '200px',
                        textAlign: 'center',
                        borderRadius: 8
                      }}
                    >
                      <TeamOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      <Text strong>{member.name}</Text>
                    </Card.Grid>
                  ))
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;
