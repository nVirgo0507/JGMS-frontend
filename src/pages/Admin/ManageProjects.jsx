import { useEffect, useState, useCallback } from "react";
import {
  Button, Card, Form, Input, Modal, Select,
  Table, Tag, Tooltip, Typography,
} from "antd";
import {
  EditOutlined, FolderOpenOutlined, GithubOutlined, PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { AdminGroupService } from "../../services/admin/adminGroup.service";
import { AdminProjectService } from "../../services/admin/adminProject.service";

const { Title, Text } = Typography;

const STATUS_OPTS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "inactive", label: "Inactive" },
];

const PROJECT_STATUS_COLOR = { active: "green", completed: "blue", inactive: "default" };

export default function ManageProjects() {
  const [rows, setRows]           = useState([]);     // { ...group, project }
  const [loading, setLoading]     = useState(false);

  // Project modal
  const [projectModal, setProjectModal]   = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEdit, setIsEdit]               = useState(false);
  const [saving, setSaving]               = useState(false);
  const [projectForm] = Form.useForm();

  // GitHub modal
  const [githubModal, setGithubModal] = useState(false);
  const [githubForm]  = Form.useForm();
  const [linkingSaving, setLinkingSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const groupRes = await AdminGroupService.getAllGroups();
      const groups = groupRes.data || [];

      const withProjects = await Promise.all(
        groups.map(async g => {
          try {
            const res = await AdminProjectService.getProjectForGroup(g.groupCode);
            return { ...g, project: res.data || null };
          } catch {
            return { ...g, project: null };
          }
        })
      );
      setRows(withProjects.map(r => ({ ...r, key: r.groupCode })));
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = (group) => {
    setSelectedGroup(group);
    setIsEdit(false);
    projectForm.resetFields();
    setProjectModal(true);
  };

  const openEdit = (group) => {
    setSelectedGroup(group);
    setIsEdit(true);
    const p = group.project;
    projectForm.setFieldsValue({
      projectName: p?.projectName || "",
      description: p?.description || "",
      startDate:   p?.startDate ? p.startDate.slice(0, 10) : "",
      endDate:     p?.endDate   ? p.endDate.slice(0, 10)   : "",
      status:      p?.status    || "active",
    });
    setProjectModal(true);
  };

  const openGithub = (group) => {
    setSelectedGroup(group);
    githubForm.resetFields();
    setGithubModal(true);
  };

  const handleProjectSave = async () => {
    const values = await projectForm.validateFields();
    try {
      setSaving(true);
      const payload = {
        groupCode:   selectedGroup.groupCode,
        projectName: values.projectName,
        description: values.description || null,
        startDate:   values.startDate || null,
        endDate:     values.endDate   || null,
        ...(isEdit ? { status: values.status || "active" } : {}),
      };
      if (isEdit) {
        await AdminProjectService.updateProject(selectedGroup.groupCode, payload);
        toast.success("Project updated!");
      } else {
        await AdminProjectService.createProject(selectedGroup.groupCode, payload);
        toast.success("Project created!");
      }
      setProjectModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleGithubSave = async () => {
    const values = await githubForm.validateFields();
    try {
      setLinkingSaving(true);
      await AdminProjectService.linkGithub(selectedGroup.groupCode, {
        repoOwner: values.repoOwner,
        repoName:  values.repoName,
        repoUrl:   values.repoUrl || null,
      });
      toast.success("GitHub linked!");
      setGithubModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "GitHub link failed");
    } finally {
      setLinkingSaving(false);
    }
  };

  const columns = [
    { title: "Group Code",    dataIndex: "groupCode",    key: "groupCode",    width: 110 },
    { title: "Group Name",    dataIndex: "groupName",    key: "groupName" },
    { title: "Lecturer",      dataIndex: "lecturerName", key: "lecturerName", render: v => v || "—" },
    {
      title: "Project Name",
      key: "projectName",
      render: (_, row) => row.project ? <Text strong>{row.project.projectName}</Text> : <Text type="secondary">No project</Text>,
    },
    {
      title: "Project Status",
      key: "projectStatus",
      width: 130,
      render: (_, row) => row.project
        ? <Tag color={PROJECT_STATUS_COLOR[row.project.status] || "default"}>{row.project.status}</Tag>
        : <Tag color="orange">Unassigned</Tag>,
    },
    {
      title: "Actions", key: "actions", width: 200,
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          {row.project ? (
            <>
              <Tooltip title="Edit project">
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>Edit</Button>
              </Tooltip>
              <Tooltip title="Link GitHub repo">
                <Button size="small" icon={<GithubOutlined />} onClick={() => openGithub(row)}>GitHub</Button>
              </Tooltip>
            </>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openCreate(row)}
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            >
              Assign Project
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 p-4 md:p-6 xl:p-8">
        <div>
          <Title level={2} className="!mb-1">Manage Projects</Title>
          <Text type="secondary">Assign and manage projects for student groups</Text>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <Table
            columns={columns}
            dataSource={rows}
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 700 }}
          />
        </Card>
      </div>

      {/* Project Create/Edit Modal */}
      <Modal
        open={projectModal}
        title={isEdit ? `Edit Project — ${selectedGroup?.groupCode}` : `Assign Project — ${selectedGroup?.groupCode}`}
        onCancel={() => setProjectModal(false)}
        onOk={handleProjectSave}
        okText={isEdit ? "Update" : "Create"}
        confirmLoading={saving}
        destroyOnClose
        width={540}
        okButtonProps={{ style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
      >
        <Form form={projectForm} layout="vertical" className="mt-4">
          <Form.Item label="Project Name" name="projectName" rules={[{ required: true }]}>
            <Input placeholder="My Project" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Brief description…" />
          </Form.Item>
          <Form.Item label="Start Date" name="startDate">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="End Date" name="endDate">
            <Input type="date" />
          </Form.Item>
          {isEdit && (
            <Form.Item label="Status" name="status">
              <Select options={STATUS_OPTS} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* GitHub Link Modal */}
      <Modal
        open={githubModal}
        title={`Link GitHub — ${selectedGroup?.groupCode}`}
        onCancel={() => setGithubModal(false)}
        onOk={handleGithubSave}
        okText="Link"
        confirmLoading={linkingSaving}
        destroyOnClose
        width={480}
        okButtonProps={{ style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
      >
        <Form form={githubForm} layout="vertical" className="mt-4">
          <Form.Item label="Repository Owner" name="repoOwner" rules={[{ required: true }]}>
            <Input placeholder="organization-or-username" />
          </Form.Item>
          <Form.Item label="Repository Name" name="repoName" rules={[{ required: true }]}>
            <Input placeholder="my-repo" />
          </Form.Item>
          <Form.Item label="Repository URL (optional)" name="repoUrl">
            <Input placeholder="https://github.com/owner/repo" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
