import { useEffect, useState, useCallback } from "react";
import {
  Alert, Badge, Button, Card, Form, Input, Modal, Popconfirm,
  Table, Tag, Tooltip, Typography,
} from "antd";
import {
  ApiOutlined, CheckCircleOutlined, CloseCircleOutlined,
  GithubOutlined, LinkOutlined, DisconnectOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { AdminIntegrationService } from "../../services/admin/adminIntegration.service";
import { AdminUserService } from "../../services/admin/adminUser.service";

const { Title, Text } = Typography;

function linkedTag(val) {
  return val
    ? <Tag color="green" icon={<CheckCircleOutlined />}>{val.length > 16 ? val.slice(0, 14) + "…" : val}</Tag>
    : <Tag color="default" icon={<CloseCircleOutlined />}>Not linked</Tag>;
}

export default function Integrations() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting]       = useState(false);
  const [testType, setTestType]     = useState("");

  // GitHub link modal
  const [githubModal, setGithubModal]   = useState(false);
  const [githubTarget, setGithubTarget] = useState(null);
  const [githubForm] = Form.useForm();
  const [githubSaving, setGithubSaving] = useState(false);

  // Jira link modal
  const [jiraModal, setJiraModal]   = useState(false);
  const [jiraTarget, setJiraTarget] = useState(null);
  const [jiraForm] = Form.useForm();
  const [jiraSaving, setJiraSaving] = useState(false);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminIntegrationService.getIntegrations();
      setUsers((res.data || []).map(u => ({ ...u, key: u.userId })));
    } catch {
      toast.error("Failed to load integration status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIntegrations(); }, [fetchIntegrations]);

  /* ── GitHub ── */
  const openLinkGithub = (user) => {
    setGithubTarget(user);
    githubForm.resetFields();
    githubForm.setFieldsValue({ githubUsername: user.githubUsername || "" });
    setGithubModal(true);
  };

  const handleLinkGithub = async () => {
    const { githubUsername } = await githubForm.validateFields();
    try {
      setGithubSaving(true);
      await AdminUserService.setGithub(githubTarget.userId, githubUsername);
      toast.success("GitHub linked!");
      setGithubModal(false);
      fetchIntegrations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "GitHub link failed");
    } finally {
      setGithubSaving(false);
    }
  };

  const handleUnlinkGithub = async (user) => {
    try {
      await AdminUserService.removeGithub(user.userId);
      toast.success("GitHub unlinked");
      fetchIntegrations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unlink failed");
    }
  };

  /* ── Jira ── */
  const openLinkJira = (user) => {
    setJiraTarget(user);
    jiraForm.resetFields();
    jiraForm.setFieldsValue({ jiraAccountId: user.jiraAccountId || "" });
    setJiraModal(true);
  };

  const handleLinkJira = async () => {
    const { jiraAccountId } = await jiraForm.validateFields();
    try {
      setJiraSaving(true);
      await AdminUserService.setJira(jiraTarget.userId, jiraAccountId);
      toast.success("Jira linked!");
      setJiraModal(false);
      fetchIntegrations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Jira link failed");
    } finally {
      setJiraSaving(false);
    }
  };

  const handleUnlinkJira = async (user) => {
    try {
      await AdminUserService.removeJira(user.userId);
      toast.success("Jira unlinked");
      fetchIntegrations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unlink failed");
    }
  };

  /* ── Connectivity test ── */
  const runTest = async (type) => {
    try {
      setTesting(true);
      setTestType(type);
      setTestResult(null);
      const res = await AdminIntegrationService.testIntegration(type);
      setTestResult({ type, data: res.data, ok: true });
    } catch (err) {
      setTestResult({ type, data: err?.response?.data, ok: false });
    } finally {
      setTesting(false);
    }
  };

  const linkedGithub = users.filter(u => u.githubUsername).length;
  const linkedJira   = users.filter(u => u.jiraAccountId).length;

  const columns = [
    { title: "ID",    dataIndex: "userId",   key: "userId",   width: 60 },
    { title: "Name",  dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email",    key: "email" },
    {
      title: "Role", dataIndex: "role", key: "role", width: 100,
      render: r => <Tag>{r}</Tag>,
    },
    {
      title: "GitHub", key: "github", width: 220,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {linkedTag(row.githubUsername)}
          {row.githubUsername ? (
            <Popconfirm title="Unlink GitHub?" onConfirm={() => handleUnlinkGithub(row)} okButtonProps={{ danger: true }}>
              <Tooltip title="Unlink GitHub">
                <Button size="small" icon={<DisconnectOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Link GitHub">
              <Button size="small" icon={<LinkOutlined />} onClick={() => openLinkGithub(row)} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Jira", key: "jira", width: 220,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {linkedTag(row.jiraAccountId)}
          {row.jiraAccountId ? (
            <Popconfirm title="Unlink Jira?" onConfirm={() => handleUnlinkJira(row)} okButtonProps={{ danger: true }}>
              <Tooltip title="Unlink Jira">
                <Button size="small" icon={<DisconnectOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Link Jira">
              <Button size="small" icon={<LinkOutlined />} onClick={() => openLinkJira(row)} />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 p-4 md:p-6 xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={2} className="!mb-1">Integrations</Title>
            <Text type="secondary">Manage GitHub and Jira connections per user</Text>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              icon={<GithubOutlined />}
              loading={testing && testType === "GitHub"}
              onClick={() => runTest("GitHub")}
            >
              Test GitHub
            </Button>
            <Button
              icon={<ApiOutlined />}
              loading={testing && testType === "Jira"}
              onClick={() => runTest("Jira")}
            >
              Test Jira
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[200px] rounded-2xl shadow-sm">
            <Text type="secondary">GitHub Linked</Text>
            <div className="text-2xl font-bold text-green-600">{linkedGithub} / {users.length}</div>
          </Card>
          <Card className="flex-1 min-w-[200px] rounded-2xl shadow-sm">
            <Text type="secondary">Jira Linked</Text>
            <div className="text-2xl font-bold text-blue-600">{linkedJira} / {users.length}</div>
          </Card>
        </div>

        {/* Test result alert */}
        {testResult && (
          <Alert
            type={testResult.ok ? "success" : "error"}
            message={`${testResult.type} Connection Test`}
            description={
              testResult.ok
                ? `Connected. ${testResult.data?.message || ""}`
                : `Failed: ${testResult.data?.message || "Connection error"}`
            }
            closable
            onClose={() => setTestResult(null)}
            showIcon
          />
        )}

        <Card className="rounded-3xl shadow-sm">
          <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={{ pageSize: 15 }}
            size="middle"
            scroll={{ x: 800 }}
          />
        </Card>
      </div>

      {/* GitHub Link Modal */}
      <Modal
        open={githubModal}
        title={`Link GitHub — ${githubTarget?.fullName}`}
        onCancel={() => setGithubModal(false)}
        onOk={handleLinkGithub}
        okText="Link"
        confirmLoading={githubSaving}
        destroyOnClose
        width={420}
        okButtonProps={{ icon: <GithubOutlined />, style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
      >
        <Form form={githubForm} layout="vertical" className="mt-4">
          <Form.Item
            label="GitHub Username"
            name="githubUsername"
            rules={[
              { required: true, message: "Enter a GitHub username" },
              { pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9]|[a-zA-Z0-9])?$/, message: "Invalid GitHub username" },
            ]}
          >
            <Input prefix={<GithubOutlined />} placeholder="github-username" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Jira Link Modal */}
      <Modal
        open={jiraModal}
        title={`Link Jira — ${jiraTarget?.fullName}`}
        onCancel={() => setJiraModal(false)}
        onOk={handleLinkJira}
        okText="Link"
        confirmLoading={jiraSaving}
        destroyOnClose
        width={420}
        okButtonProps={{ icon: <ApiOutlined />, style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
      >
        <Form form={jiraForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Jira Account ID"
            name="jiraAccountId"
            rules={[{ required: true, message: "Enter the Jira Account ID" }]}
            help="Found in Jira Profile → Account settings → Account ID"
          >
            <Input prefix={<ApiOutlined />} placeholder="5b109f2e9729b51b54dc274f" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
