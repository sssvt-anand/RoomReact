import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Table,
  message,
  Select,
  Popover,
  DatePicker
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
  const [dateRanges, setDateRanges] = useState({
    monthly: { start: null, end: null },
    yearly: { start: null, end: null }
  });

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

  const handleDateChange = (type, field, value) => {
    setDateRanges(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const createDatePopover = (type) => (
    <div style={{ padding: 16, width: 300 }}>
      <DatePicker
        placeholder="Start Date"
        value={dateRanges[type].start}
        onChange={date => handleDateChange(type, 'start', date)}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <DatePicker
        placeholder="End Date"
        value={dateRanges[type].end}
        onChange={date => handleDateChange(type, 'end', date)}
        style={{ width: '100%', marginBottom: 16 }}
      />
      <Button
        type="primary"
        block
        onClick={() => handleDownload({
          type,
          start: dateRanges[type].start,
          end: dateRanges[type].end
        })}
        loading={loading[type]}
        icon={<DownloadOutlined />}
      >
        Download
      </Button>
    </div>
  );

  const handleDownload = async (params) => {
    const { type, start, end } = params;
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      
      let url = `${API_BASE_URL}/api/exports/${type}`;
      const queryParams = [];

      if (type === "monthly" || type === "yearly") {
        if (start) queryParams.push(`start=${start.format('YYYY-MM-DD')}`);
        if (end) queryParams.push(`end=${end.format('YYYY-MM-DD')}`);
      }

      if (type === "by-member") {
        if (!selectedMember) {
          message.warning("Please select a member first");
          return;
        }
        url = `${API_BASE_URL}/api/exports/member/${selectedMember}`;
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
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
      
      let displayType = type.replace("-", " ").toUpperCase();
      if (start && end) {
        displayType += ` (${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')})`;
      }

      setRecentExports(prev => [{
        id: Date.now(),
        type: displayType,
        date: new Date().toISOString(),
        size: `${(blob.size / 1024).toFixed(1)} KB`
      }, ...prev]);

      message.success(`${displayType} report downloaded successfully`);
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
        onClick={() => handleDownload({ type: "by-member" })}
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
            <Popover 
              title="Select Date Range"
              content={createDatePopover('monthly')}
              trigger="click"
              placement="bottom"
            >
              <Button 
                style={buttonStyle}
                type="primary"
              >
                <CalendarOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                Monthly Report
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dateRanges.monthly.start && dateRanges.monthly.end ?
                    `${dateRanges.monthly.start.format('MMM DD')} - ${dateRanges.monthly.end.format('MMM DD')}` :
                    "Last 30 days"}
                </Text>
              </Button>
            </Popover>
          </Col>

          <Col span={6}>
            <Popover 
              title="Select Date Range"
              content={createDatePopover('yearly')}
              trigger="click"
              placement="bottom"
            >
              <Button 
                style={buttonStyle}
                type="primary"
              >
                <HistoryOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                Yearly Report
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dateRanges.yearly.start && dateRanges.yearly.end ?
                    `${dateRanges.yearly.start.format('YYYY')} - ${dateRanges.yearly.end.format('YYYY')}` :
                    "Year-to-date"}
                </Text>
              </Button>
            </Popover>
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
              onClick={() => handleDownload({ type: "general" })} 
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