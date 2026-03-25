import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import {
  ApiOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AdminGroupService } from "../../services/admin/adminGroup.service";
import { AdminUserService } from "../../services/admin/adminUser.service";
import { AdminProjectService } from "../../services/admin/adminProject.service";

const { Title, Text } = Typography;

const STAT_CARDS = [
  { key: "groups",   label: "Total Groups",   icon: <TeamOutlined />,       color: "#6366f1" },
  { key: "users",    label: "Total Users",    icon: <UserOutlined />,       color: "#10b981" },
  { key: "lecturers",label: "Lecturers",      icon: <UserOutlined />,       color: "#f59e0b" },
  { key: "projects", label: "Total Projects", icon: <FolderOpenOutlined />, color: "#3b82f6" },
];

const GROUP_COLUMNS = [
  { title: "Code",     dataIndex: "groupCode",    key: "groupCode", width: 100 },
  { title: "Name",     dataIndex: "groupName",    key: "groupName" },
  { title: "Leader",   dataIndex: "leaderName",   key: "leaderName",   render: v => v || "—" },
  { title: "Lecturer", dataIndex: "lecturerName", key: "lecturerName", render: v => v || "—" },
  {
    title: "Status", dataIndex: "status", key: "status",
    render: s => <Tag color={s === "active" ? "green" : "default"}>{s}</Tag>,
  },
  { title: "Members", dataIndex: "memberCount", key: "memberCount", align: "center", width: 90 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ groups: 0, users: 0, lecturers: 0, projects: 0 });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, userRes, projectRes] = await Promise.allSettled([
          AdminGroupService.getAllGroups(),
          AdminUserService.getAllUsers(),
          AdminProjectService.getAllProjects(),
        ]);

        const groupData  = groupRes.status  === "fulfilled" ? (groupRes.value?.data  || []) : [];
        const userData   = userRes.status   === "fulfilled" ? (userRes.value?.data   || []) : [];
        const projectData = projectRes.status === "fulfilled" ? (projectRes.value?.data || []) : [];

        const lecturerCount = userData.filter(u => u.role?.toLowerCase() === "lecturer").length;

        setGroups(groupData.map(g => ({ ...g, key: g.groupCode })));
        setStats({
          groups:    groupData.length,
          users:     userData.length,
          lecturers: lecturerCount,
          projects:  projectData.length,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <Title level={2} className="!mb-1">Admin Dashboard</Title>
        <Text type="secondary">System overview and quick statistics</Text>
      </div>

      <Row gutter={[16, 16]}>
        {STAT_CARDS.map(card => (
          <Col xs={24} sm={12} xl={6} key={card.key}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title={card.label}
                value={stats[card.key]}
                prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                valueStyle={{ color: card.color, fontSize: 28, fontWeight: 700 }}
                loading={loading}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<span className="font-semibold"><TeamOutlined className="mr-2" />All Groups</span>}
        className="rounded-2xl shadow-sm"
        extra={<Tag color="blue">{groups.length} groups</Tag>}
      >
        <Table
          columns={GROUP_COLUMNS}
          dataSource={groups}
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 600 }}
        />
      </Card>

      <Card
        title={<span className="font-semibold"><ApiOutlined className="mr-2" />Integration Status</span>}
        className="rounded-2xl shadow-sm"
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Text type="secondary">
          Go to the{" "}
          <a href="/admin/integrations" className="text-indigo-600 hover:underline">
            Integrations page
          </a>{" "}
          to manage GitHub and Jira connections.
        </Text>
      </Card>
    </div>
  );
}