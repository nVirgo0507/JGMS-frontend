import { useCallback, useEffect, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Descriptions, Divider, Dropdown, Form,
  Input, Modal, Popconfirm, Row, Spin, Table, Tag, Tooltip, Typography,
} from "antd";
import {
  ApiOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DeleteOutlined, GithubOutlined, ReloadOutlined, SyncOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { AdminGroupService } from "../../services/admin/adminGroup.service";
import { AdminGroupIntegrationService } from "../../services/admin/adminGroupIntegration.service";
import { AdminProjectService } from "../../services/admin/adminProject.service";

const { Title, Text, Paragraph } = Typography;

/* ─── GitHub Config Modal ──────────────────────────────── */
function GithubModal({ open, groupCode, onClose, onDone }) {
  const [form]   = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) form.resetFields(); }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      setSaving(true);
      await AdminGroupIntegrationService.configureGithub(groupCode, {
        apiToken:  values.apiToken,
        repoOwner: values.repoOwner,
        repoName:  values.repoName,
        repoUrl:   values.repoUrl || null,
      });
      toast.success("GitHub integration configured!");
      onClose();
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.message || "GitHub config failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<span><GithubOutlined className="mr-2" />Configure GitHub — {groupCode}</span>}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={saving}
      destroyOnClose
      width={520}
      okButtonProps={{ style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
    >
      <Paragraph type="secondary" className="mb-4 text-sm">
        Connect this group's project to a GitHub repository. The API token must have at least <em>repo</em> scope.
      </Paragraph>
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Repository Owner" name="repoOwner" rules={[{ required: true }]}>
              <Input placeholder="org-name or username" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Repository Name" name="repoName" rules={[{ required: true }]}>
              <Input placeholder="my-repo" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="GitHub API Token" name="apiToken" rules={[{ required: true, min: 10 }]}>
          <Input.Password placeholder="ghp_xxxx…" />
        </Form.Item>
        <Form.Item label="Repository URL (optional)" name="repoUrl">
          <Input placeholder="https://github.com/owner/repo" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/* ─── Jira Config Modal ────────────────────────────────── */
function JiraModal({ open, groupCode, existing, onClose, onDone }) {
  const [form]   = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit   = !!existing;

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (existing) {
        form.setFieldsValue({
          jiraUrl:    existing.jiraUrl    || "",
          jiraEmail:  existing.jiraEmail  || "",
          projectKey: existing.projectKey || "",
        });
      }
    }
  }, [open, existing, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      jiraUrl:    values.jiraUrl,
      jiraEmail:  values.jiraEmail,
      apiToken:   values.apiToken,
      projectKey: values.projectKey,
    };
    try {
      setSaving(true);
      if (isEdit) {
        await AdminGroupIntegrationService.updateJira(groupCode, payload);
        toast.success("Jira integration updated!");
      } else {
        await AdminGroupIntegrationService.configureJira(groupCode, payload);
        toast.success("Jira integration configured!");
      }
      onClose();
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Jira config failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<span><ApiOutlined className="mr-2" />{isEdit ? "Update" : "Configure"} Jira — {groupCode}</span>}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? "Update" : "Save"}
      confirmLoading={saving}
      destroyOnClose
      width={540}
      okButtonProps={{ style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
    >
      <Paragraph type="secondary" className="mb-4 text-sm">
        Connect this group's project to a Jira project. Use the API token from your Atlassian account settings.
      </Paragraph>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Jira URL"
          name="jiraUrl"
          rules={[{ required: true, type: "url", message: "Enter a valid URL (https://...)" }]}
        >
          <Input placeholder="https://yourorg.atlassian.net" />
        </Form.Item>
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item label="Jira Email" name="jiraEmail" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="admin@fpt.edu.vn" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              label="Project Key"
              name="projectKey"
              rules={[{ required: true, pattern: /^[A-Z][A-Z0-9_]*$/, message: "Uppercase, e.g. SWP391" }]}
            >
              <Input placeholder="SWP391" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={isEdit ? "New API Token (leave blank to keep existing)" : "API Token"}
          name="apiToken"
          rules={isEdit ? [] : [{ required: true, min: 10 }]}
        >
          <Input.Password placeholder="ATATT3xFfGN0…" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/* ─── Per-row group integration panel ─────────────────── */
function GroupIntegrationRow({ group, onRefresh }) {
  const [jiraConfig, setJiraConfig]   = useState(null);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [githubConfig, setGithubConfig]   = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [testResult, setTestResult]   = useState(null);
  const [syncing, setSyncing]         = useState(false);
  const [githubModal, setGithubModal] = useState(false);
  const [jiraModal, setJiraModal]     = useState(false);
  const [syncingGithub, setSyncingGithub] = useState(false);

  const loadJira = useCallback(async () => {
    try {
      setJiraLoading(true);
      const res = await AdminGroupIntegrationService.getJiraIntegration(group.groupCode);
      setJiraConfig(res.data || null);
    } catch {
      setJiraConfig(null);
    } finally {
      setJiraLoading(false);
    }
  }, [group.groupCode]);

  const loadGithub = useCallback(async () => {
    const projectId = group.project?.id || group.project?.projectId || group.project?.projectCode;
    if (!projectId) {
      setGithubConfig(null);
      return;
    }
    try {
      setGithubLoading(true);
      const res = await AdminGroupIntegrationService.getGithubIntegration(projectId);
      setGithubConfig(res.data || null);
    } catch {
      setGithubConfig(null);
    } finally {
      setGithubLoading(false);
    }
  }, [group.project]);

  useEffect(() => { loadJira(); loadGithub(); }, [loadJira, loadGithub]);

  const syncGithub = async (forceFullResync) => {
    const projectId = group.project?.id || group.project?.projectId || group.project?.projectCode;
    if (!projectId) {
      toast.error("No project assigned");
      return;
    }
    try {
      setSyncingGithub(true);
      await AdminGroupIntegrationService.syncGithub(projectId, forceFullResync);
      toast.success(forceFullResync ? "Force full sync completed!" : "GitHub sync completed!");
      loadGithub();
    } catch (err) {
      toast.error(err?.response?.data?.message || "GitHub Sync failed");
    } finally {
      setSyncingGithub(false);
    }
  };

  const testJira = async () => {
    try {
      const res = await AdminGroupIntegrationService.testJira(group.groupCode);
      const d = res.data || {};
      setTestResult({ ok: d.isConnected, msg: d.message || "" });
    } catch (err) {
      setTestResult({ ok: false, msg: err?.response?.data?.message || "Connection failed" });
    }
  };

  const syncJira = async () => {
    try {
      setSyncing(true);
      const res = await AdminGroupIntegrationService.syncJira(group.groupCode);
      const d = res.data || {};
      toast.success(`Sync done — ${d.totalIssues ?? 0} issues (${d.newIssues ?? 0} new, ${d.updatedIssues ?? 0} updated)`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const deleteJira = async () => {
    try {
      await AdminGroupIntegrationService.deleteJira(group.groupCode);
      toast.success("Jira integration removed");
      setJiraConfig(null);
      setTestResult(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 py-2">
        {/* GitHub card */}
        <Card size="small" className="rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GithubOutlined className="text-lg" />
              <Text strong>GitHub Repository</Text>
              {githubConfig 
                ? <Badge status="success" text="Connected" />
                : <Badge status="default" text="Not configured" />}
            </div>
            <div className="flex gap-2">
              {githubConfig && (
                <Dropdown menu={{
                  items: [
                    { key: 'fast', label: 'Standard Sync' },
                    { key: 'full', label: 'Force Full Resync', danger: true },
                  ],
                  onClick: ({ key }) => syncGithub(key === 'full')
                }}>
                  <Tooltip title="Sync GitHub commits">
                    <Button size="small" icon={<SyncOutlined spin={syncingGithub} />} loading={syncingGithub} />
                  </Tooltip>
                </Dropdown>
              )}
              <Tooltip title="Configure GitHub integration">
                <Button size="small" icon={<GithubOutlined />} onClick={() => setGithubModal(true)}>
                  {githubConfig ? "Reconfigure" : "Configure"}
                </Button>
              </Tooltip>
            </div>
          </div>
          {githubLoading ? (
            <Spin size="small" />
          ) : githubConfig ? (
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Repository">{githubConfig.repoOwner}/{githubConfig.repoName}</Descriptions.Item>
              <Descriptions.Item label="URL">{githubConfig.repoUrl || '—'}</Descriptions.Item>
              <Descriptions.Item label="Sync Status">
                {githubConfig.syncStatus === 'success' ? <Text type="success">{githubConfig.syncStatus}</Text> : githubConfig.syncStatus}
              </Descriptions.Item>
              {githubConfig.lastSync && (
                <Descriptions.Item label="Last Sync">
                  {new Date(githubConfig.lastSync).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : group.project ? (
            <Text type="secondary" className="text-sm">Not configured. Click Configure to set up GitHub.</Text>
          ) : (
            <Text type="secondary" className="text-sm">No project assigned yet. Create a project in the Projects page first.</Text>
          )}
        </Card>

        {/* Jira card */}
        <Card size="small" className="rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ApiOutlined className="text-lg text-blue-500" />
              <Text strong>Jira Project</Text>
              {jiraConfig
                ? <Badge status="success" text="Connected" />
                : <Badge status="default" text="Not configured" />}
            </div>
            <div className="flex gap-2">
              {jiraConfig && (
                <>
                  <Tooltip title="Test connection">
                    <Button size="small" onClick={testJira} icon={<CheckCircleOutlined />} />
                  </Tooltip>
                  <Tooltip title="Sync Jira issues">
                    <Button size="small" icon={<SyncOutlined spin={syncing} />} loading={syncing} onClick={syncJira} />
                  </Tooltip>
                  <Popconfirm title="Remove Jira integration?" onConfirm={deleteJira} okButtonProps={{ danger: true }}>
                    <Tooltip title="Remove">
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                </>
              )}
              <Button size="small" icon={<ApiOutlined />} onClick={() => setJiraModal(true)}>
                {jiraConfig ? "Edit" : "Configure"}
              </Button>
            </div>
          </div>

          {jiraLoading ? (
            <Spin size="small" />
          ) : jiraConfig ? (
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="URL">{jiraConfig.jiraUrl}</Descriptions.Item>
              <Descriptions.Item label="Email">{jiraConfig.jiraEmail}</Descriptions.Item>
              <Descriptions.Item label="Project Key">{jiraConfig.projectKey}</Descriptions.Item>
              {jiraConfig.lastSync && (
                <Descriptions.Item label="Last Sync">
                  {new Date(jiraConfig.lastSync).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Text type="secondary" className="text-sm">Not configured. Click Configure to set up Jira.</Text>
          )}

          {testResult && (
            <Alert
              className="mt-2"
              type={testResult.ok ? "success" : "error"}
              message={testResult.ok ? "Connected" : "Failed"}
              description={testResult.msg}
              closable
              onClose={() => setTestResult(null)}
              showIcon
            />
          )}
        </Card>
      </div>

      <GithubModal
        open={githubModal}
        groupCode={group.groupCode}
        onClose={() => setGithubModal(false)}
        onDone={() => { onRefresh(); loadGithub(); }}
      />
      <JiraModal
        open={jiraModal}
        groupCode={group.groupCode}
        existing={jiraConfig}
        onClose={() => setJiraModal(false)}
        onDone={loadJira}
      />
    </>
  );
}

/* ─── Main page ────────────────────────────────────────── */
export default function GroupIntegrations() {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const groupRes = await AdminGroupService.getAllGroups();
      const groups = groupRes.data || [];
      // Load project info per group
      const { AdminProjectService } = await import("../../services/admin/adminProject.service");
      const withProjects = await Promise.all(
        groups.map(async g => {
          try {
            const res = await AdminProjectService.getProjectForGroup(g.groupCode);
            return { ...g, project: res.data || null };
          } catch { return { ...g, project: null }; }
        })
      );
      setGroups(withProjects);
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const columns = [
    {
      title: "Group",
      key: "group",
      width: 180,
      render: (_, row) => (
        <div>
          <Text strong>{row.groupCode}</Text>
          <br />
          <Text type="secondary" className="text-xs">{row.groupName}</Text>
        </div>
      ),
    },
    {
      title: "GitHub & Jira Integration",
      key: "integrations",
      render: (_, row) => (
        <GroupIntegrationRow group={row} onRefresh={fetchGroups} />
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4 md:p-6 xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={2} className="!mb-1">Group Integrations</Title>
          <Text type="secondary">
            Configure GitHub repository and Jira project per student group
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchGroups} loading={loading}>
          Refresh
        </Button>
      </div>

      <Card className="rounded-3xl shadow-sm">
        <Table
          columns={columns}
          dataSource={groups.map(g => ({ ...g, key: g.groupCode }))}
          loading={loading}
          pagination={{ pageSize: 8 }}
          size="middle"
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
