import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Result,
  Button,
  Tabs,
  Table,
  Tag,
  Space,
  Avatar,
  Statistic,
  Grid
} from "antd";
import {
  ArrowLeftOutlined,
  TeamOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { LecturerService } from "../../services/lecturer.service";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function GroupDetails() {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [group, setGroup] = useState(null);
  
  // Tab data states
  const [members, setMembers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (groupCode) {
      fetchGroupData();
    }
  }, [groupCode]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      setError(false);

      // Fetch all group-related data in parallel
      const [detailsRes, membersRes, reqsRes, tasksRes] = await Promise.all([
        LecturerService.getGroupDetails(groupCode).catch(() => null),
        LecturerService.getGroupMembers(groupCode).catch(() => ({ data: [] })),
        LecturerService.getGroupRequirements(groupCode).catch(() => ({ data: [] })),
        LecturerService.getGroupTasks(groupCode).catch(() => ({ data: [] }))
      ]);

      if (!detailsRes || !detailsRes.data) {
        throw new Error("Group not found");
      }

      setGroup(detailsRes.data);
      setMembers(membersRes.data || []);
      setRequirements(reqsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      console.error("Failed to fetch group details:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading group context..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Group Not Found"
            subTitle={`Could not load details for group "${groupCode}". It may not exist or you don't have permission.`}
            extra={[
              <Button type="primary" onClick={() => navigate("/lecturer")}>
                Back to Dashboard
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  const memberColumns = [
    {
      title: "Member",
      key: "member",
      render: (_, record) => (
        <Space size={12}>
          <Avatar size={40} style={{ backgroundColor: record.isLeader ? '#f59e0b' : '#0f766e' }}>
            {record.userName ? record.userName.charAt(0).toUpperCase() : "?"}
          </Avatar>
          <div>
            <div className="font-semibold text-slate-900">{record.userName || "-"}</div>
            <div className="text-xs text-gray-500">ID: {record.userId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
    },
    {
      title: "Role",
      dataIndex: "isLeader",
      key: "role",
      render: (isLeader) => (
        <Tag color={isLeader ? "gold" : "default"}>
          {isLeader ? "Leader" : "Member"}
        </Tag>
      ),
    }
  ];

  const taskColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-medium text-slate-800">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "TODO") color = "processing";
        if (status === "IN_PROGRESS") color = "cyan";
        if (status === "DONE") color = "success";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Assignee",
      dataIndex: "assignedToName",
      key: "assignedToName",
      render: (text) => text || <Text type="secondary">Unassigned</Text>,
    }
  ];

  const reqColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-medium text-slate-800">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "jiraStatus",
      key: "jiraStatus",
      render: (status) => <Tag color="blue">{status || "UNKNOWN"}</Tag>,
    }
  ];

  const tabItems = [
    {
      key: "1",
      label: <span className="flex items-center gap-2"><TeamOutlined /> Members</span>,
      children: (
        <Table
          dataSource={members}
          columns={memberColumns}
          rowKey="memberId"
          pagination={false}
          scroll={{ x: true }}
          className="mt-4"
        />
      ),
    },
    {
      key: "2",
      label: <span className="flex items-center gap-2"><CheckSquareOutlined /> Tasks</span>,
      children: (
        <Table
          dataSource={tasks}
          columns={taskColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
          className="mt-4"
        />
      ),
    },
    {
      key: "3",
      label: <span className="flex items-center gap-2"><FileTextOutlined /> Requirements</span>,
      children: (
        <Table
          dataSource={requirements}
          columns={reqColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
          className="mt-4"
        />
      ),
    }
  ];

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/lecturer")}
            className="text-gray-500 hover:text-gray-900"
          />
          <div>
            <Title level={3} className="m-0">Group Details: {groupCode}</Title>
            <Text type="secondary">{group.projectName || "No Project Assigned"}</Text>
          </div>
        </div>
        <Tag color={group.status === "ACTIVE" ? "green" : "default"} className="text-sm px-3 py-1">
          {group.status || "ACTIVE"}
        </Tag>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic title="Members" value={members.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic title="Total Tasks" value={tasks.length} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic title="Requirements" value={requirements.length} prefix={<ProjectOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card className="rounded-3xl shadow-sm" styles={{ body: { padding: screens.md ? "24px 32px" : "16px" } }}>
        <Tabs defaultActiveKey="1" items={tabItems} size="large" />
      </Card>
    </div>
  );
}
