import { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Spin, Empty, Result, Tag, Button, Grid } from "antd";
import { TeamOutlined, RightOutlined, FileTextOutlined, GithubOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { LecturerService } from "../../services/lecturer.service";
import { ROUTER_URL } from "../../consts/router.const";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function LecturerDashboard() {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await LecturerService.getGroups({ isLoading: false });
      setGroups(res.data || []);
      setError(false);
    } catch (err) {
      console.error("Failed to load lecturer groups:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading groups..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Failed to load groups"
            subTitle="We encountered an error while fetching your assigned groups."
            extra={[
              <Button type="primary" key="retry" onClick={fetchGroups}>
                Retry
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  No Groups Assigned
                </Title>
                <Text type="secondary">
                  You are not currently supervising any project groups.
                </Text>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <div className="mb-6">
        <Title level={3}>Supervised Groups</Title>
        <Text type="secondary">Overview of all project groups you are managing.</Text>
      </div>

      <Row gutter={[16, 16]}>
        {groups.map((group) => (
          <Col xs={24} md={12} xl={8} key={group.groupCode}>
            <Card
              className="h-full rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col"
              styles={{
                body: { display: "flex", flexDirection: "column", flex: 1, padding: screens.md ? 24 : 16 },
              }}
              onClick={() => navigate(`/lecturer/groups/${group.groupCode}`)}
              actions={[
                <Link 
                  to={`/lecturer/reports?group=${group.groupCode}`} 
                  key="reports" 
                  onClick={e => e.stopPropagation()}
                  className="px-2 flex justify-center items-center gap-1.5 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                  title="View Reports"
                >
                  <FileTextOutlined />
                  <span className="truncate max-w-[80px] sm:max-w-none">Reports</span>
                </Link>,
                <Link 
                  to={`/lecturer/github?group=${group.groupCode}`} 
                  key="github" 
                  onClick={e => e.stopPropagation()}
                  className="px-2 flex justify-center items-center gap-1.5 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                  title="View GitHub Stats"
                >
                  <GithubOutlined />
                  <span className="truncate max-w-[80px] sm:max-w-none">GitHub</span>
                </Link>
              ]}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Title level={4} className="mb-1" style={{ marginTop: 0 }}>
                    {group.groupCode}
                  </Title>
                  <Text className="text-gray-500 line-clamp-2" title={group.projectName}>
                    {group.projectName || "No Project Assigned"}
                  </Text>
                </div>
                {group.status && (
                  <Tag color={group.status === "ACTIVE" ? "green" : "default"}>
                    {group.status}
                  </Tag>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-gray-500">
                <TeamOutlined className="mr-2" />
                <Text type="secondary">{group.members?.length || 0} Members</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}