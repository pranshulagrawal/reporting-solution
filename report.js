import React, { useState } from "react";
import {
  Tabs,
  Form,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Dropdown,
  Menu,
  Tooltip,
  Space,
  message,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const dummySummary = {
  totalBreaks: 1223,
  agedBreaks: 187,
  comments: 320,
  open: 820,
  closed: 403,
};

const ReportingDashboard = () => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState([]);

  const handleDownload = (type) => {
    message.success(`${type} downloaded.`);
  };

  const handleTradeReportGenerate = (values) => {
    const payload = {
      businessDate: values.date.format("YYYY-MM-DD"),
      filterOptions: {
        status: values.status || [],
        breakCategory: values.breakCategory || [],
        sourceNames: values.sourceNames || [],
      },
    };
    console.log("🚀 Generated Trade Report Payload:", payload);
    message.success("Trade Report filter payload generated.");
  };

  const handleZipGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      message.success(`EOD ZIP Report generated successfully!`);
      setLoading(false);
    }, 1000);
  };

  const handleComparisonGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      message.success(`Comparison Report generated successfully!`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 12 }}>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Title level={3}>Reporting Dashboard</Title>
        <Text type="secondary">
          Generate and download operational reports quickly.
        </Text>
      </Space>

      <Divider style={{ marginTop: 16, marginBottom: 24 }} />

      {/* Summary KPIs */}
      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Today's Breaks"
              value={dummySummary.totalBreaks}
              prefix={
                <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Aged Breaks (>5d)"
              value={dummySummary.agedBreaks}
              suffix={<Tag color="red">High</Tag>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Open Status (Not Closed)"
              value={dummySummary.open}
              suffix={<Tag color="orange">Pending</Tag>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Resolved"
              value={`${Math.round(
                (dummySummary.closed /
                  (dummySummary.open + dummySummary.closed)) *
                  100
              )}%`}
            />
            <Progress
              percent={Math.round(
                (dummySummary.closed /
                  (dummySummary.open + dummySummary.closed)) *
                  100
              )}
              size="small"
              strokeColor="#52c41a"
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ marginTop: 24, marginBottom: 16 }} />

      {/* Tabs */}
      <Tabs defaultActiveKey="1" type="card" destroyInactiveTabPane>
        {/* Trade Report */}
        <TabPane key="1" tab="🔎 Breaks Report">
          <Card hoverable>
            <Form
              form={form1}
              layout="vertical"
              onFinish={handleTradeReportGenerate}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Business Date"
                    name="date"
                    rules={[
                      { required: true, message: "Please select a date" },
                    ]}
                  >
                    <RangePicker
                      style={{ width: "100%" }}
                      value={range}
                      onChange={(dates) => setRange(dates || [])}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Status" name="status">
                    <Select
                      mode="multiple"
                      placeholder="Select status"
                      allowClear
                      options={[
                        { value: "open", label: "Open" },
                        { value: "closed", label: "Closed" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Break Category" name="breakCategory">
                    <Select
                      mode="multiple"
                      placeholder="Select category"
                      allowClear
                      options={[
                        { value: "settlement", label: "Settlement" },
                        { value: "valuation", label: "Valuation" },
                        { value: "missing", label: "Missing Trade" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Source Names" name="sourceNames">
                    <Select
                      mode="multiple"
                      placeholder="Select sources"
                      allowClear
                      options={[
                        { value: "oms", label: "OMS" },
                        { value: "custodian", label: "Custodian" },
                        { value: "internal", label: "Internal Ledger" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Row justify="end" style={{ marginTop: 16 }}>
                <Space>
                  <Dropdown
                    placement="bottomRight"
                    menu={{
                      items: [
                        {
                          key: "excel",
                          icon: <FileExcelOutlined />,
                          label: "Download Excel",
                          onClick: () => handleDownload("Excel File"),
                        },
                        {
                          key: "csv",
                          icon: <DownloadOutlined />,
                          label: "Download CSV",
                          onClick: () => handleDownload("CSV File"),
                        },
                      ],
                    }}
                  >
                    <Button icon={<DownloadOutlined />}>Download</Button>
                  </Dropdown>
                </Space>
              </Row>
            </Form>
          </Card>
        </TabPane>

        {/* ZIP Report */}
        <TabPane tab="📦 EOD ZIP Report" key="2">
          <Card hoverable>
            <Form form={form2} layout="inline" onFinish={handleZipGenerate}>
              <Form.Item
                label="COB Date"
                name="date"
                rules={[{ required: true, message: "Select a date" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FileZipOutlined />}
                  loading={loading}
                >
                  Download ZIP
                </Button>
              </Form.Item>
            </Form>
            <Divider />
            <Text type="secondary">
              ZIP will contain multiple files (summary, breaks, etc.) for the
              selected trade date.
            </Text>
          </Card>
        </TabPane>

        {/* Comparison Report */}
        <TabPane tab="🆚 Comparison Report" key="3">
          <Card hoverable>
            <Form
              form={form3}
              layout="inline"
              onFinish={handleComparisonGenerate}
            >
              <Form.Item
                label="Date 1"
                name="date1"
                rules={[{ required: true, message: "Select Date 1" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                label="Date 2"
                name="date2"
                rules={[{ required: true, message: "Select Date 2" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload("Comparison Excel")}
                  >
                    Download
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportingDashboard;
