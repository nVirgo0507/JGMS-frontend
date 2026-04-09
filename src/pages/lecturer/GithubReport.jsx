import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Alert,
  Select,
  Statistic,
  Table,
  Tag,
  Space
} from "antd";
import { GithubOutlined, CheckCircleOutlined, BranchesOutlined } from "@ant-design/icons";
import { LecturerService } from "../../services/lecturer.service";

const { Title, Text } = Typography;
const { Option } = Select;

export default function LecturerGithubReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialGroup = queryParams.get("group");

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup || null);
  const [stats, setStats] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      navigate(`?group=${selectedGroup}`, { replace: true });
      fetchGithubStats(selectedGroup);
    } else {
      setStats(null);
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

  const fetchGithubStats = async (groupCode) => {
    try {
      setLoadingStats(true);
      setError(null);
      const res = await LecturerService.getCommitStatistics(groupCode);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load github stats:", err);
      setError("Failed to load GitHub statistics for this group. Make sure they have a Jira/Github integration set up.");
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const memberStatsColumns = [
    {
      title: "Student",
      dataIndex: "userName",
      key: "userName",
      render: (text, record) => (
        <Space>
          <span className="font-semibold">{text}</span>
          <Text type="secondary text-xs">#{record.userId}</Text>
        </Space>
      ),
    },
    {
      title: "Total Commits",
      dataIndex: "totalCommits",
      key: "totalCommits",
      sorter: (a, b) => a.totalCommits - b.totalCommits,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Additions",
      dataIndex: "totalAdditions",
      key: "totalAdditions",
      sorter: (a, b) => a.totalAdditions - b.totalAdditions,
      render: (val) => <Text type="success">+{val}</Text>,
    },
    {
      title: "Deletions",
      dataIndex: "totalDeletions",
      key: "totalDeletions",
      sorter: (a, b) => a.totalDeletions - b.totalDeletions,
      render: (val) => <Text type="danger">-{val}</Text>,
    },
    {
      title: "Files Changed",
      dataIndex: "totalChangedFiles",
      key: "totalChangedFiles",
      sorter: (a, b) => (a.totalChangedFiles || 0) - (b.totalChangedFiles || 0),
    },
    {
      title: "Avg Commit Size",
      dataIndex: "avgCommitSize",
      key: "avgCommitSize",
      sorter: (a, b) => (a.avgCommitSize || 0) - (b.avgCommitSize || 0),
      render: (val) => val ? `${val} lines` : '-',
    },
    {
      title: "Commit Freq",
      dataIndex: "commitFrequency",
      key: "commitFrequency",
      sorter: (a, b) => (a.commitFrequency || 0) - (b.commitFrequency || 0),
      render: (val) => val ? `${val.toFixed(2)}/day` : '-',
    },
    {
      title: "Last Commit",
      dataIndex: "lastCommitDate",
      key: "lastCommitDate",
      render: (val) => val ? new Date(val).toLocaleDateString() : 'Never',
    },
  ];

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={3}>GitHub Statistics</Title>
          <Text type="secondary">Monitor commit activity and contributions across your groups.</Text>
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
          <Text type="secondary">You don't have any active groups to view statistics for.</Text>
        </Card>
      )}

      {selectedGroup && (
        <Spin spinning={loadingStats} tip="Loading GitHub Statistics...">
          {stats ? (
            <div className="space-y-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card className="rounded-2xl shadow-sm">
                    <Statistic
                      title="Total Project Commits"
                      value={stats.totalCommits || 0}
                      prefix={<GithubOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="rounded-2xl shadow-sm">
                    <Statistic
                      title="Total Additions"
                      value={stats.totalAdditions || 0}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="rounded-2xl shadow-sm">
                    <Statistic
                      title="Total Deletions"
                      value={stats.totalDeletions || 0}
                      prefix={<BranchesOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card 
                title="Member Contributions" 
                className="rounded-3xl shadow-sm"
                styles={{ header: { padding: '16px 24px' }, body: { padding: 0 } }}
              >
                <Table
                  dataSource={stats.members || []}
                  columns={memberStatsColumns}
                  rowKey="userId"
                  pagination={false}
                  scroll={{ x: true }}
                />
              </Card>
            </div>
          ) : (
            !loadingStats && !error && (
              <Card className="rounded-3xl shadow-sm text-center py-12">
                <Text type="secondary">No statistics available for this group.</Text>
              </Card>
            )
          )}
        </Spin>
      )}
    </div>
  );
}