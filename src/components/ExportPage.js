import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Divider, 
  Table,
  message,
  Select,
  Popover 
} from "antd";
import moment from "moment";
import { 
  DownloadOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileExcelOutlined, 
  HistoryOutlined,
  UserOutlined 
} from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const buttonStyle = {
  height: 120,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  whiteSpace: 'normal'
};

const ExportPage = () => {
  const [loading, setLoading] = useState({
    monthly: false,
    yearly: false,
    "by-member": false,
    general: false
  });
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [recentExports, setRecentExports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, exportsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/members`),
          axios.get(`${API_BASE_URL}/api/exports/history`)
        ]);
        
        setMembers(membersRes.data);
        setRecentExports(exportsRes.data);
      } catch (error) {
        message.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      
      let url = `${API_BASE_URL}/api/exports/${type}`;
      if (type === "by-member") {
        if (!selectedMember) {
          message.warning("Please select a member first");
          return;
        }
        url = `${API_BASE_URL}/api/exports/member/${selectedMember}`;
      }

      const response = await axios.get(url, { responseType: "blob" });
      
      const filename = response.headers["content-disposition"]
        ?.split("filename=")[1]
        ?.replace(/"/g, "") 
        || `${type}_expenses_${new Date().toISOString().split('T')[0]}.csv`;

      const blob = new Blob([response.data], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
      setRecentExports(prev => [{
        id: Date.now(),
        type: type.replace("-", " ").toUpperCase(),
        date: new Date().toISOString(),
        size: `${(blob.size / 1024).toFixed(1)} KB`
      }, ...prev]);

      message.success(`${type.replace("-", " ").toUpperCase()} report downloaded successfully`);
    } catch (error) {
      message.error(`Failed to download ${type} report: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const memberExportContent = (
    <div style={{ padding: 16, minWidth: 300 }}>
      <Select
        placeholder="Select member"
        style={{ width: "100%", marginBottom: 16 }}
        onChange={setSelectedMember}
        value={selectedMember}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        suffixIcon={<UserOutlined />}
      >
        {members.map(member => (
          <Option key={member.id} value={member.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserOutlined />
              <span>{member.name}</span>
            </div>
          </Option>
        ))}
      </Select>
      <Button
        type="primary"
        block
        onClick={() => handleDownload("by-member")}
        disabled={!selectedMember}
        loading={loading["by-member"]}
        icon={<DownloadOutlined />}
      >
        {selectedMember ? `Download ${members.find(m => m.id === selectedMember)?.name}'s Report` : "Select Member"}
      </Button>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh", padding: "24px" }}>
      <Content>
        <Title level={3}>
          <FileExcelOutlined /> Expense Reports
        </Title>
        <Text type="secondary">Export expense data in CSV format for analysis</Text>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Button 
              style={buttonStyle}
              type="primary"
              onClick={() => handleDownload("monthly")} 
              loading={loading.monthly}
            >
              <CalendarOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
              Monthly Report
              <Text type="secondary" style={{ fontSize: 12 }}>Last 30 days</Text>
            </Button>
          </Col>

          <Col span={6}>
            <Button 
              style={buttonStyle}
              type="primary"
              onClick={() => handleDownload("yearly")} 
              loading={loading.yearly}
            >
              <HistoryOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
              Yearly Report
              <Text type="secondary" style={{ fontSize: 12 }}>Year-to-date</Text>
            </Button>
          </Col>

          <Col span={6}>
            <Popover 
              title="Member Export" 
              content={memberExportContent} 
              trigger="click"
              placement="bottom"
            >
              <Button 
                style={buttonStyle}
                type="primary"
              >
                <UserOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                Member Report
                <Text type="secondary" style={{ fontSize: 12 }}>Individual expenses</Text>
              </Button>
            </Popover>
          </Col>

          <Col span={6}>
            <Button 
              style={buttonStyle}
              type="primary"
              onClick={() => handleDownload("general")} 
              loading={loading.general}
            >
              <TeamOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
              General Report
              <Text type="secondary" style={{ fontSize: 12 }}>All expenses</Text>
            </Button>
          </Col>
        </Row>

        <Divider />

        <Card 
          title={<><HistoryOutlined /> Recent Exports</>}
          style={{ marginTop: 24 }}
        >
          <Table
            columns={[
              { 
                title: "Type", 
                dataIndex: "type", 
                key: "type",
                render: (text) => <Text strong>{text}</Text>
              },
              { 
                title: "Date", 
                dataIndex: "date", 
                key: "date", 
                render: (text) => moment(text).format("YYYY-MM-DD HH:mm"),
                sorter: (a, b) => new Date(a.date) - new Date(b.date)
              },
              { 
                title: "Size", 
                dataIndex: "size", 
                key: "size",
                sorter: (a, b) => parseFloat(a.size) - parseFloat(b.size)
              }
            ]}
            dataSource={recentExports}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default ExportPage;