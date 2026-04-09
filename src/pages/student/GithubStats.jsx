import { useEffect, useState } from "react";
import {
  GithubOutlined,
  CheckCircleOutlined,
  BranchesOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { StudentService } from "../../services/student.service";

const { Title, Text, Link } = Typography;
const { RangePicker } = DatePicker;

const memberColumns = [
  {
    title: "Member",
    dataIndex: "userName",
    key: "userName",
    render: (text, record) => (
      <Space>
        <span className="font-semibold">{text}</span>
        <Text type="secondary" className="text-xs">
          #{record.userId}
        </Text>
      </Space>
    ),
  },
  {
    title: "Commits",
    dataIndex: "totalCommits",
    key: "totalCommits",
    sorter: (a, b) => a.totalCommits - b.totalCommits,
    defaultSortOrder: "descend",
    render: (val) => <Tag color="blue">{val ?? 0}</Tag>,
  },
  {
    title: "Additions",
    dataIndex: "totalAdditions",
    key: "totalAdditions",
    sorter: (a, b) => (a.totalAdditions ?? 0) - (b.totalAdditions ?? 0),
    render: (val) => <Text type="success">+{val ?? 0}</Text>,
  },
  {
    title: "Deletions",
    dataIndex: "totalDeletions",
    key: "totalDeletions",
    sorter: (a, b) => (a.totalDeletions ?? 0) - (b.totalDeletions ?? 0),
    render: (val) => <Text type="danger">-{val ?? 0}</Text>,
  },
  {
    title: "Files Changed",
    dataIndex: "totalChangedFiles",
    key: "totalChangedFiles",
    sorter: (a, b) => (a.totalChangedFiles ?? 0) - (b.totalChangedFiles ?? 0),
  },
  {
    title: "Avg Commit Size",
    dataIndex: "avgCommitSize",
    key: "avgCommitSize",
    sorter: (a, b) => (a.avgCommitSize ?? 0) - (b.avgCommitSize ?? 0),
    render: (val) => (val ? `${val} lines` : "-"),
  },
  {
    title: "Commit Freq",
    dataIndex: "commitFrequency",
    key: "commitFrequency",
    sorter: (a, b) => (a.commitFrequency ?? 0) - (b.commitFrequency ?? 0),
    render: (val) => (val ? `${Number(val).toFixed(2)}/day` : "-"),
  },
  {
    title: "Last Commit",
    dataIndex: "lastCommitDate",
    key: "lastCommitDate",
    sorter: (a, b) =>
      new Date(a.lastCommitDate || 0) - new Date(b.lastCommitDate || 0),
    render: (val) =>
      val ? new Date(val).toLocaleDateString("en-GB") : "Never",
  },
];

export default function StudentGithubStats() {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [stats, setStats] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupError, setGroupError] = useState(false);
  const [dateRange, setDateRange] = useState([]);

  // Load group first
  useEffect(() => {
    async function fetchGroup() {
      try {
        setGroupLoading(true);
        const res = await StudentService.getMyGroup();
        setGroup(res?.data ?? null);
      } catch (err) {
        if (err?.response?.status !== 404) setGroupError(true);
        setGroup(null);
      } finally {
        setGroupLoading(false);
      }
    }
    fetchGroup();
  }, []);

  // Load stats once we have the group and know the user is the leader
  useEffect(() => {
    if (!group?.groupCode || !group?.isLeader) return;
    fetchStats(group.groupCode, dateRange);
  }, [group, dateRange]);

  const fetchStats = async (groupCode, range) => {
    try {
      setStatsLoading(true);
      setError(null);
      const params = {};
      if (range && range.length === 2 && range[0] && range[1]) {
        params.startDate = range[0].format("YYYY-MM-DD");
        params.endDate = range[1].format("YYYY-MM-DD");
      }
      const res = await StudentService.getGroupCommitStatistics(groupCode, params);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load commit stats:", err);
      if (err?.response?.status === 403) {
        setError("Only the group leader can view team commit statistics.");
      } else {
        setError(
          "Failed to load GitHub statistics for your group. Make sure your GitHub repository is integrated and synced in the Project Settings."
        );
      }
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (group?.groupCode) fetchStats(group.groupCode, dateRange);
  };

  const onDateChange = (dates) => {
    setDateRange(dates || []);
  };

  if (groupLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading group info..." />
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Unable to load group"
            subTitle="Please try again later."
          />
        </Card>
      </div>
    );
  }

  if (!group?.groupCode) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="You need to be assigned to a group to view commit statistics."
          />
        </Card>
      </div>
    );
  }

  if (!group.isLeader) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="403"
            title="Leader access only"
            subTitle="Only the group leader can view team commit statistics."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 xl:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title level={2} className="!mb-1">
            GitHub Statistics
          </Title>
          <Text type="secondary">
            Monitor commit activity and contributions for group{" "}
            <strong>{group.groupCode}</strong>.
          </Text>
        </div>
        <Space wrap>
          <RangePicker
            onChange={onDateChange}
            value={dateRange}
            className="rounded-lg"
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            loading={statsLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon className="rounded-xl" />
      )}

      <Spin spinning={statsLoading} tip="Loading GitHub statistics...">
        {stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={4}>
                <Card className="rounded-2xl shadow-sm border-2 border-blue-50">
                  <Statistic
                    title="Overall Commits"
                    value={stats.overallCommits ?? 0}
                    prefix={<GithubOutlined />}
                    valueStyle={{ color: "#0050b3" }}
                  />
                  <Text type="secondary" className="text-[10px]">Project Total</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={5}>
                <Card className="rounded-2xl shadow-sm">
                  <Statistic
                    title="Period Commits"
                    value={stats.totalCommits ?? 0}
                    prefix={<SyncOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={5}>
                <Card className="rounded-2xl shadow-sm">
                  <Statistic
                    title="Period Additions"
                    value={stats.totalAdditions ?? 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={5}>
                <Card className="rounded-2xl shadow-sm">
                  <Statistic
                    title="Period Deletions"
                    value={stats.totalDeletions ?? 0}
                    prefix={<BranchesOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={5}>
                <Card className="rounded-2xl shadow-sm">
                  <Statistic
                    title="Files Changed"
                    value={stats.totalChangedFiles ?? 0}
                    prefix={<FileOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Period info if available */}
            {(stats.periodStart || stats.periodEnd) && (
              <Alert
                icon={<ClockCircleOutlined />}
                type="info"
                showIcon
                className="rounded-xl"
                message={`Statistics period: ${stats.periodStart ?? "N/A"} → ${stats.periodEnd ?? "N/A"}`}
              />
            )}

            {/* Member contributions table */}
            <Card
              title="Member Contributions"
              className="rounded-3xl shadow-sm"
              styles={{
                header: { padding: "16px 24px" },
                body: { padding: 0 },
              }}
            >
              <Table
                dataSource={stats.members ?? []}
                columns={memberColumns}
                rowKey="userId"
                pagination={false}
                scroll={{ x: true }}
                locale={{ emptyText: "No commit data found for this group." }}
              />
            </Card>
          </div>
        ) : (
          !statsLoading &&
          !error && (
            <Card className="rounded-3xl shadow-sm">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No commit statistics available. Make sure GitHub is integrated and synced."
              />
            </Card>
          )
        )}
      </Spin>
    </div>
  );
}
