import React, { useState } from 'react';
import {
  Card,
  Select,
  DatePicker,
  Button,
  Form,
  Table,
  message,
  Spin,
} from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportingTab = () => {
  const [reportType, setReportType] = useState('tradeBreak');
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let response;

      // Example API logic per report type
      if (reportType === 'tradeBreak') {
        response = await axios.post('/api/reports/tradeBreak', {
          dateRange: values.dateRange?.map((d) => d.format('YYYY-MM-DD')),
          breakCategory: values.breakCategory,
          sourceType: values.sourceType,
        });

        setColumns([
          {
            title: 'BREAK CATEGORY',
            dataIndex: 'category',
            key: 'category',
            render: (text) => <strong>{text}</strong>,
          },
          {
            title: 'SOURCE SYSTEM',
            dataIndex: 'source',
            key: 'source',
          },
          {
            title: 'AMOUNT (INR)',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (value) => `₹${value.toLocaleString()}`,
          },
        ]);
      } else if (reportType === 'zipReport') {
        response = await axios.post('/api/reports/zipReport', {
          tradeDate: values.tradeDate.format('YYYY-MM-DD'),
        });

        setColumns([
          {
            title: 'FILE NAME',
            dataIndex: 'fileName',
            key: 'fileName',
          },
          {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
          },
        ]);
      } else if (reportType === 'comparison') {
        response = await axios.post('/api/reports/comparison', {
          date1: values.date1.format('YYYY-MM-DD'),
          date2: values.date2.format('YYYY-MM-DD'),
        });

        setColumns([
          {
            title: 'INSTRUMENT',
            dataIndex: 'instrument',
            key: 'instrument',
          },
          {
            title: `POSITION (${values.date1.format('DD-MM-YYYY')})`,
            dataIndex: 'position1',
            key: 'position1',
            align: 'right',
          },
          {
            title: `POSITION (${values.date2.format('DD-MM-YYYY')})`,
            dataIndex: 'position2',
            key: 'position2',
            align: 'right',
          },
          {
            title: 'DIFFERENCE',
            dataIndex: 'difference',
            key: 'difference',
            align: 'right',
          },
        ]);
      }

      setPreviewData(response.data);
    } catch (err) {
      message.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type) => {
    const ws = XLSX.utils.json_to_sheet(previewData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `report.${type}`);
    message.success(`Downloaded as ${type.toUpperCase()}`);
  };

  const renderFilters = () => {
    switch (reportType) {
      case 'tradeBreak':
        return (
          <>
            <Form.Item name="dateRange" rules={[{ required: true }]}> <RangePicker /></Form.Item>
            <Form.Item name="breakCategory" rules={[{ required: true }]}> <Select placeholder="Break Category" style={{ width: 150 }}>
              <Option value="Mismatch">Mismatch</Option>
              <Option value="Delay">Delay</Option>
            </Select></Form.Item>
            <Form.Item name="sourceType" rules={[{ required: true }]}> <Select placeholder="Source Type" style={{ width: 150 }}>
              <Option value="System A">System A</Option>
              <Option value="System B">System B</Option>
            </Select></Form.Item>
          </>
        );
      case 'zipReport':
        return (
          <Form.Item name="tradeDate" rules={[{ required: true }]}> <DatePicker /></Form.Item>
        );
      case 'comparison':
        return (
          <>
            <Form.Item name="date1" rules={[{ required: true }]}> <DatePicker placeholder="Date 1" /></Form.Item>
            <Form.Item name="date2" rules={[{ required: true }]}> <DatePicker placeholder="Date 2" /></Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card title="Reporting Solution" style={{ margin: 20 }}>
      <Form layout="inline" form={form}>
        <Form.Item label="Report Type">
          <Select value={reportType} onChange={setReportType} style={{ width: 220 }}>
            <Option value="tradeBreak">Trade Break Report</Option>
            <Option value="zipReport">End-of-Day ZIP Report</Option>
            <Option value="comparison">Comparison Report</Option>
          </Select>
        </Form.Item>

        {renderFilters()}

        <Form.Item>
          <Button type="primary" onClick={handleGenerate} icon={<EyeOutlined />}>Generate & Preview</Button>
        </Form.Item>
      </Form>

      {loading ? (
        <Spin size="large" style={{ marginTop: 40 }} />
      ) : (
        previewData.length > 0 && (
          <Card
            title="Preview Results"
            style={{ marginTop: 20 }}
            extra={
              <>
                <Button onClick={() => handleDownload('csv')} icon={<DownloadOutlined />} style={{ marginRight: 10 }}>
                  Download CSV
                </Button>
                <Button onClick={() => handleDownload('xlsx')} icon={<DownloadOutlined />}>
                  Download Excel
                </Button>
              </>
            }
          >
            <Table
              columns={columns}
              dataSource={previewData}
              pagination={{ pageSize: 5 }}
              bordered
              rowKey={(row, i) => i}
            />
          </Card>
        )
      )}
    </Card>
  );
};

export default ReportingTab;
