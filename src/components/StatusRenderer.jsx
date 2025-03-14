import React from 'react';
import { Space, Typography } from 'antd';
import moment from 'moment';

const { Text } = Typography;
const StatusRenderer = ({ record, isMobile })=> {
  const total = record.amount || 0;
  const cleared = record.clearedAmount || 0;
  const lastCleared = record.lastClearedAmount || 0;
  const remaining = total - cleared;

  return isMobile ? (
    <Text type={remaining > 0 ? 'danger' : 'success'}>
      ₹{remaining.toFixed(2)} {remaining > 0 ? 'Due' : 'Paid'}
    </Text>
  ) : (
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
};

export default StatusRenderer;