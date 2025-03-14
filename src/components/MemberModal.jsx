import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';

const MemberModal = ({ visible, onCancel, form, handleSubmit, isMobile }) => (
  <Modal
    title="Add New Member"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={isMobile ? '90%' : '500px'}
  >
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item 
        name="name" 
        label="Member Name"
        rules={[{ required: true }]}
      >
        <Input prefix={<UserOutlined />} maxLength={30} />
      </Form.Item>
      <Button 
        type="primary" 
        htmlType="submit" 
        block 
        icon={<PlusOutlined />}
        size={isMobile ? 'large' : 'middle'}
      >
        Create Member
      </Button>
    </Form>
  </Modal>
);

export default MemberModal;