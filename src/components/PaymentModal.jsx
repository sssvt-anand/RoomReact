import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
    const { Option } = Select;

const PaymentModal = ({ 
  visible, 
  onCancel, 
  onOk, 
  members, 
  clearAmount, 
  setClearAmount, 
  setSelectedClearMemberId,
  isMobile 
}) => (
  <Modal
    title="Record Payment"
    open={visible}
    onCancel={onCancel}
    onOk={onOk}
    okText="Record Payment"
    width={isMobile ? '90%' : '500px'}
  >
    <Form layout="vertical">
      <Form.Item label="Select Member" required>
        <Select
          placeholder="Select member"
          onChange={setSelectedClearMemberId}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {members.map(member => (
            <Option key={member.id} value={member.id}>
              {member.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Payment Amount" required>
        <Input
          type="number"
          placeholder="Enter amount"
          value={clearAmount}
          onChange={(e) => setClearAmount(e.target.value)}
          inputMode="decimal"
          pattern="[0-9]*"
        />
      </Form.Item>
    </Form>
  </Modal>
);

export default PaymentModal;