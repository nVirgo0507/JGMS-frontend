import { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Empty,
  Grid,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  Button,
} from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  CrownOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";
import { BaseService } from "../../config/basic.service";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const memberColumns = [
  {
    title: "Member",
    dataIndex: "fullName",
    key: "fullName",
    render: (_, member) => (
      <Space size={12}>
        <Avatar
          size={40}
          style={{ backgroundColor: member.isLeader ? "#f59e0b" : "#0f766e" }}
        >
          {(member.fullName || "?").charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <div className="font-semibold text-slate-900">
            {member.fullName || "-"}
          </div>
        </div>
      </Space>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    responsive: ["md"],
    render: (email) => <Text>{email || "-"}</Text>,
  },
  {
    title: "Role",
    dataIndex: "isLeader",
    key: "isLeader",
    width: 120,
    responsive: ["sm"],
    render: (isLeader) => (
      <Tag color={isLeader ? "gold" : "default"}>
        {isLeader ? "Leader" : "Member"}
      </Tag>
    ),
  },
  {
    title: "Joined At",
    dataIndex: "joinedAt",
    key: "joinedAt",
    width: 180,
    responsive: ["lg"],
    render: (joinedAt) => (
      <Text type="secondary">{formatDateTime(joinedAt)}</Text>
    ),
  },
];

export default function MyGroup() {
  const screens = useBreakpoint();
  const [group, setGroup] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAssigned, setNotAssigned] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, profileRes] = await Promise.all([
          StudentService.getMyGroup(),
          StudentService.getProfile({ isLoading: false })
        ]);
        setGroup(groupRes?.data ?? null);
        setProfile(profileRes?.data ?? null);
        setLoadError(false);
      } catch (error) {
        if (error?.response?.status === 404) {
          setNotAssigned(true);
        } else {
          console.error("Failed to load data", error);
          setLoadError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading group information..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Unable to load group information"
            subTitle="The system could not fetch your current group details. Please try again later."
          />
        </Card>
      </div>
    );
  }

  if (notAssigned || !group) {
    return (
      <div className="p-4 md:p-2 xl:p-4">
        <Card className="rounded-3xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  You are not assigned to a group yet
                </Title>
                <Text type="secondary">
                  Your lecturer or administrator has not assigned you to a
                  project group. Once assigned, your team details will appear
                  here.
                </Text>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  const isLeader = group?.members?.find((m) => m.userId === profile?.userId)?.isLeader;

  const handleConnectJira = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "https://swp391-jgms-api.onrender.com";
    window.location.href = `${baseUrl}/api/jira/auth/login?state=${group.groupCode}`;
  };

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <Row gutter={[16, 0]} style={{ rowGap: 16 }} className="mb-8">
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Group Code"
              value={group.groupCode || "-"}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Project"
              value={group.projectName || "-"}
              prefix={<BookOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Lecturer"
              value={group.lecturerName || "-"}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Joined At"
              value={formatDateTime(group.joinedAt)}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
      </Row>

      {isLeader && !group?.jiraStatus?.isConfigured && (
        <Row gutter={[16, 0]} className="mb-8">
          <Col xs={24}>
            <Card className="rounded-3xl shadow-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
              <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="bg-white/20 p-4 rounded-full">
                    <CloudServerOutlined style={{ fontSize: 32 }} />
                  </div>
                  <div>
                    <Title level={4} className="!text-white !mb-1">Connect with Jira</Title>
                    <Text className="text-blue-100">Synchronize your project tasks, requirements, and progress automatically with Atlassian Jira.</Text>
                  </div>
                </div>
                <Button 
                  size="large" 
                  type="default" 
                  className="font-semibold px-8 rounded-xl h-12 hover:!text-blue-700 hover:!border-white hover:scale-105 transition-transform shadow-lg"
                  onClick={handleConnectJira}
                >
                  Configure Integration
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {group?.jiraStatus?.isConfigured && (
        <Row gutter={[16, 0]} className="mb-8">
          <Col xs={24}>
            <Card className="rounded-3xl shadow-sm border border-blue-100 bg-blue-50/50">
              <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                    <CloudServerOutlined style={{ fontSize: 32 }} />
                  </div>
                  <div>
                    <Title level={4} className="!text-blue-900 !mb-1">Jira Integration Active</Title>
                    <div className="flex items-center gap-2 mt-1">
                        <Text className="text-slate-600">Status:</Text>
                        <Tag color={group.jiraStatus.syncStatus?.toLowerCase() === 'success' ? 'green' : 'red'}>
                            {group.jiraStatus.syncStatus?.toUpperCase() || 'UNKNOWN'}
                        </Tag>
                        <Text className="text-slate-600 ml-2">Last Sync: {formatDateTime(group.jiraStatus.lastSync)}</Text>
                    </div>
                  </div>
                </div>
                {isLeader && (
                  <Button 
                    size="large" 
                    type="primary" 
                    className="font-semibold px-8 rounded-xl h-12 shadow-md bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                        const toastId = toast.loading("Syncing with Jira...");
                        try {
                            await StudentService.syncGroupIssues(group.groupCode);
                            toast.update(toastId, { render: "Sync completed successfully!", type: "success", isLoading: false, autoClose: 3000 });
                            setTimeout(() => window.location.reload(), 1000);
                        } catch (err) {
                            toast.update(toastId, { render: "Sync failed: " + (err.response?.data?.message || err.message), type: "error", isLoading: false, autoClose: 5000 });
                        }
                    }}
                  >
                    Sync Now
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 0]} style={{ rowGap: 16 }}>
        <Col xs={24}>
          <Card
            title="Team Members"
            extra={<Tag color="blue">{group.members?.length ?? 0} members</Tag>}
            className="rounded-3xl shadow-sm"
            styles={{
              header: {
                paddingInline: screens.md ? 24 : 16,
                paddingBlock: screens.md ? 16 : 12,
              },
              body: {
                padding: screens.md ? 24 : 12,
              },
            }}
          >
            <Table
              columns={memberColumns}
              dataSource={group.members ?? []}
              rowKey="userId"
              pagination={false}
              size={screens.md ? "middle" : "small"}
              scroll={{ x: screens.md ? 720 : 420 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
