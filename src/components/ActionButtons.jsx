import React from 'react';
import { Button, Space } from 'antd';

const ActionButtons = ({ 
    record, 
    userRole,
    isMobile,
    handleEditExpense,
    handleDeleteExpense,
    // Add these required props
    setCurrentClearExpenseId,
    setClearModalVisible 
  }) => {
  const remaining = record.amount - (record.clearedAmount || 0);
  const isFullyCleared = remaining <= 0;

  return (
    <Space size={isMobile ? 'small' : 'middle'}>
      {userRole === 'ADMIN' && (
        <>
          {!isFullyCleared && (
            <Button 
              size={isMobile ? 'small' : 'middle'}
              onClick={() => handleEditExpense(record)}
            >
              Edit
            </Button>
          )}
          <Button 
            danger 
            size={isMobile ? 'small' : 'middle'}
            onClick={() => handleDeleteExpense(record.id)}
          >
            Delete
          </Button>
        </>
      )}
      {!isFullyCleared && (
        <Button 
          type="primary" 
          ghost 
          size={isMobile ? 'small' : 'middle'}
          onClick={() => {
            setCurrentClearExpenseId(record.id);
            setClearModalVisible(true);
          }}
        >
          {record.clearedAmount > 0 ? 'Add Payment' : 'Clear'}
        </Button>
      )}
    </Space>
  );
};

export default ActionButtons;