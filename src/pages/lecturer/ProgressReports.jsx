import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Alert,
  Select,
  Table,
  Tag,
  Button,
  message,
  Space
} from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { LecturerService } from "../../services/lecturer.service";
import ReportPreviewModal from "../../components/common/ReportPreviewModal";

const { Title, Text } = Typography;
const { Option } = Select;

export default function LecturerProgressReports() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialGroup = queryParams.get("group");

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup || null);
  const [reports, setReports] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState(null);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      navigate(`?group=${selectedGroup}`, { replace: true });
      fetchReports(selectedGroup);
    } else {
      setReports([]);
    }
  }, [selectedGroup, navigate]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await LecturerService.getGroups({ isLoading: false });
      const activeGroups = res.data || [];
      setGroups(activeGroups);
      if (activeGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(activeGroups[0].groupCode);
      }
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError("Failed to load your groups. Please try again later.");
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchReports = async (groupCode) => {
    try {
      setLoadingReports(true);
      setError(null);
      const res = await LecturerService.getGroupProgressReports(groupCode);
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Failed to load progress reports for this group.");
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const handlePreview = async (reportId) => {
    setCurrentReportId(reportId);
    setPreviewVisible(true);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const res = await LecturerService.exportProgressReport(selectedGroup, reportId, "pdf");
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      setPreviewUrl(url);
    } catch (err) {
      console.error("Failed to load report preview", err);
      message.error("Failed to load report preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCurrentReportId(null);
  };

  const handleDownloadPdf = async () => {
    try {
      // If we already have the URL, we can just trigger download
      if (previewUrl) {
        const link = document.createElement("a");
        link.href = previewUrl;
        link.setAttribute("download", `Progress_Report_${selectedGroup}_${currentReportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        message.success("Report downloaded successfully!");
        return;
      }
      
      const res = await LecturerService.exportProgressReport(selectedGroup, currentReportId, "pdf");
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Progress_Report_${selectedGroup}_${currentReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Report downloaded successfully!");
    } catch (err) {
      console.error("Failed to download report", err);
      message.error("Failed to download report.");
    }
  };
  
  const handleDownloadWord = async () => {
    try {
      const res = await LecturerService.exportProgressReport(selectedGroup, currentReportId, "word");
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/msword" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Progress_Report_${selectedGroup}_${currentReportId}.doc`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Word report downloaded successfully!");
    } catch (err) {
      console.error("Failed to download Word report", err);
      message.error("Failed to download Word report.");
    }
  };

  const columns = [
    {
      title: "Report Type",
      dataIndex: "reportType",
      key: "reportType",
      render: (text) => (
        <Space>
          <span className="font-semibold">{text}</span>
        </Space>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val, record) => (val ? new Date(val).toLocaleString() : new Date(record.generatedAt).toLocaleString() || "-"),
    },
    {
      title: "Generated By",
      dataIndex: "generatedByName",
      key: "generatedByName",
      render: (text) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            className="border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600"
            icon={<EyeOutlined />} 
            onClick={() => handlePreview(record.reportId)}
            size="small"
          >
            Preview
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={3}>Progress Reports</Title>
          <Text type="secondary">Review and export progress reports submitted by your groups.</Text>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select
            className="w-full sm:w-64"
            placeholder="Select a Group"
            loading={loadingGroups}
            value={selectedGroup}
            onChange={(value) => setSelectedGroup(value)}
            disabled={groups.length === 0}
            size="large"
          >
            {groups.map((g) => (
              <Option key={g.groupCode} value={g.groupCode}>
                {g.groupCode} - {g.projectName || "Project"}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon className="mb-6 rounded-xl" />
      )}

      {!selectedGroup && !loadingGroups && groups.length === 0 && (
        <Card className="rounded-3xl shadow-sm text-center py-12">
          <Text type="secondary">You don't have any active groups to view reports for.</Text>
        </Card>
      )}

      {selectedGroup && (
        <Card className="rounded-3xl shadow-sm" styles={{ header: { padding: '16px 24px' }, body: { padding: 0 } }}>
          <Spin spinning={loadingReports} tip="Loading Reports...">
            <Table
              dataSource={reports}
              columns={columns}
              rowKey="reportId"
              pagination={false}
              scroll={{ x: true }}
              locale={{
                emptyText: "No progress reports found for this group.",
              }}
            />
          </Spin>
        </Card>
      )}

      <ReportPreviewModal
        visible={previewVisible}
        onClose={handleClosePreview}
        blobUrl={previewUrl}
        loading={previewLoading}
        onDownload={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
      />
    </div>
  );
}