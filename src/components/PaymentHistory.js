// PaymentHistory.js
import React from 'react';
import { Table, Spin, Alert } from 'antd';
import axios from 'axios';
import moment from 'moment';

const PaymentHistory = ({ expenseId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/expenses/${expenseId}/payments`);
        setPayments(response.data);
      } catch (err) {
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    
    if (expenseId) fetchPayments();
  }, [expenseId]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'date',
      render: text => moment(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: value => `₹${value.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Cleared By',
      dataIndex: ['clearedBy', 'name'],
      key: 'clearedBy',
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <Table
      columns={columns}
      dataSource={payments}
      rowKey="id"
      pagination={{ pageSize: 5 }}
      bordered
      size="small"
    />
  );
};

export default PaymentHistory;