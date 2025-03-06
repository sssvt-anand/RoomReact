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

const ExportPage = () => {
  const [loading, setLoading] = useState({
    monthly: false,
    yearly: false,
    "by-member": false,
    "without-member": false
  });
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [recentExports, setRecentExports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersRes = await axios.get("http://localhost:8080/api/members");
        setMembers(membersRes.data);
        
        const exportsRes = await axios.get("http://localhost:8080/api/exports/history");
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
      
      let url = `http://localhost:8080/api/exports/member/${selectedMember}`;
      if (type === "by-member") {
        if (!selectedMember) {
          message.warning("Please select a member first");
          return;
        }
        url += `/${selectedMember}`;
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
      
      // Update recent exports
      setRecentExports(prev => [{
        id: Date.now(),
        type: type.replace("-", " ").toUpperCase(),
        date: new Date().toISOString(),
        size: `${(blob.size / 1024).toFixed(1)} KB`
      }, ...prev]);

      message.success(`${type.replace("-", " ").toUpperCase()} report downloaded successfully`);
    } catch (error) {
      message.error(`Failed to download ${type} report: ${error.message}`);
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

  const exportOptions = [
    {
      key: "monthly",
      title: "Monthly Report",
      icon: <CalendarOutlined />,
      description: "Export expenses grouped by month",
      color: "#1890ff",
      stats: "12 months available"
    },
    {
      key: "yearly",
      title: "Yearly Summary",
      icon: <CalendarOutlined />,
      description: "Annual expense breakdown",
      color: "#52c41a",
      stats: "3 years available"
    },
    {
      key: "by-member",
      title: "Member Expenses",
      icon: <TeamOutlined />,
      description: "Detailed expenses per member",
      color: "#722ed1",
      stats: `${members.length} members available`,
      customAction: (
        <Popover 
          title="Member Export" 
          content={memberExportContent}
          trigger="click"
          placement="bottomRight"
        >
          <Button
            style={{ 
              backgroundColor: "#722ed1",
              borderColor: "#722ed1",
              marginTop: 16
            }}
            block
          >
            Select Member
          </Button>
        </Popover>
      )
    },
    {
      key: "without-member",
      title: "General Expenses",
      icon: <FileExcelOutlined />,
      description: "Expenses without member association",
      color: "#f5222d",
      stats: "23 entries available"
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", padding: "24px" }}>
      <Content>
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DownloadOutlined /> Expense Reports
          </Title>
          <Text type="secondary">Download detailed expense reports in CSV format</Text>
        </div>

        <Row gutter={[24, 24]}>
          {exportOptions.map((option) => (
            <Col xs={24} sm={12} lg={6} key={option.key}>
              <Card 
                hoverable
                style={{ 
                  borderLeft: `4px solid ${option.color}`,
                  borderRadius: 8,
                  height: "100%"
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: "100%" }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {option.icon} {option.title}
                    </Text>
                    <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                      {option.description}
                    </Text>
                  </div>
                  
                  <Divider style={{ margin: '16px 0' }} />
                  
                  <div style={{ marginTop: 'auto' }}>
                    <Statistic
                      title="Available Data"
                      value={option.stats}
                      valueStyle={{ fontSize: 14 }}
                    />
                    {option.customAction || (
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(option.key)}
                        loading={loading[option.key]}
                        style={{ 
                          marginTop: 16,
                          backgroundColor: option.color,
                          borderColor: option.color
                        }}
                        block
                      >
                        Download CSV
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: '24px 0' }} />

        <Card
          title={
            <span>
              <HistoryOutlined /> Recent Exports
            </span>
          }
        >
          <Table
            columns={[
              { 
                title: 'Report Type', 
                dataIndex: 'type',
                render: (text) => <Text strong>{text}</Text>
              },
              { 
                title: 'Date', 
                dataIndex: 'date',
                render: (date) => moment(date).format("YYYY-MM-DD HH:mm")
              },
              { 
                title: 'File Size', 
                dataIndex: 'size',
                align: 'right'
              }
            ]}
            dataSource={recentExports}
            rowKey="id"
            locale={{ emptyText: 'No recent exports' }}
            pagination={false}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default ExportPage;