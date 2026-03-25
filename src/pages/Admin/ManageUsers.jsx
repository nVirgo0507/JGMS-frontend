import { useEffect, useState, useCallback } from "react";
import {
  Badge, Button, Card, Form, Input, Modal, Popconfirm, Select,
  Switch, Table, Tag, Tooltip, Typography,
} from "antd";
import {
  DeleteOutlined, EditOutlined, GithubOutlined, PlusOutlined, SearchOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { AdminUserService } from "../../services/admin/adminUser.service";

const { Title, Text } = Typography;

const ROLES = ["admin", "lecturer", "student"];
const STATUS_OPTS = [
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const ROLE_COLOR = { admin: "red", lecturer: "blue", student: "green" };

function statusTag(s) {
  return s === "active"
    ? <Badge status="success" text="Active" />
    : <Badge status="default" text="Inactive" />;
}

const COLUMNS = (onEdit, onDelete, onToggle) => [
  { title: "ID",       dataIndex: "userId",   key: "userId",   width: 60 },
  { title: "Name",     dataIndex: "fullName", key: "fullName" },
  { title: "Email",    dataIndex: "email",    key: "email" },
  {
    title: "Role", dataIndex: "role", key: "role", width: 110,
    render: r => <Tag color={ROLE_COLOR[r?.toLowerCase()] || "default"}>{r}</Tag>,
  },
  {
    title: "Status", dataIndex: "status", key: "status", width: 110,
    render: (s, row) => (
      <Tooltip title="Toggle status">
        <span
          className="cursor-pointer"
          onClick={() => onToggle(row)}
        >
          {statusTag(s)}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "GitHub", dataIndex: "githubUsername", key: "github", width: 120,
    render: v => v ? <Tag color="default" icon={<GithubOutlined />}>{v}</Tag> : <Text type="secondary">—</Text>,
  },
  {
    title: "Jira", dataIndex: "jiraAccountId", key: "jira", width: 110,
    render: v => v ? <Tag color="blue">{v.slice(0, 10)}…</Tag> : <Text type="secondary">—</Text>,
  },
  {
    title: "Actions", key: "actions", width: 120,
    render: (_, row) => (
      <div className="flex gap-2">
        <Tooltip title="Edit">
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(row)} />
        </Tooltip>
        <Popconfirm
          title="Delete this user?"
          onConfirm={() => onDelete(row)}
          okText="Yes" cancelText="No" okButtonProps={{ danger: true }}
        >
          <Tooltip title="Delete">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  },
];

const EMPTY_FORM = { email: "", fullName: "", phone: "", role: "student", password: "", studentCode: "", githubUsername: "", jiraAccountId: "", status: "active" };

export default function ManageUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (search || roleFilter) {
        res = await AdminUserService.searchUsers(search, roleFilter);
      } else {
        res = await AdminUserService.getAllUsers();
      }
      setUsers((res.data || []).map(u => ({ ...u, key: u.userId })));
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    form.resetFields();
    form.setFieldsValue({
      email:          user.email || "",
      fullName:       user.fullName || "",
      phone:          user.phone || "",
      role:           user.role?.toLowerCase() || "student",
      studentCode:    user.studentCode || "",
      githubUsername: user.githubUsername || "",
      jiraAccountId:  user.jiraAccountId || "",
      status:         user.status || "active",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      setSaving(true);
      if (editingUser) {
        await AdminUserService.updateUser(editingUser.userId, {
          email:          values.email,
          fullName:       values.fullName,
          phone:          values.phone,
          role:           values.role,
          studentCode:    values.studentCode || null,
          githubUsername: values.githubUsername || null,
          jiraAccountId:  values.jiraAccountId || null,
          status:         values.status,
        });
        toast.success("User updated!");
      } else {
        await AdminUserService.createUser({
          email:    values.email,
          fullName: values.fullName,
          phone:    values.phone,
          role:     values.role,
          password: values.password,
          studentCode: values.studentCode || null,
        });
        toast.success("User created!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      await AdminUserService.deleteUser(user.userId);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleToggle = async (user) => {
    const next = user.status === "active" ? "inactive" : "active";
    try {
      await AdminUserService.setStatus(user.userId, next);
      toast.success(`User ${next}`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status update failed");
    }
  };

  const isStudent = Form.useWatch("role", form) === "student";
  const isCreate  = !editingUser;

  return (
    <>
      <div className="space-y-4 p-4 md:p-6 xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={2} className="!mb-1">Manage Users</Title>
            <Text type="secondary">Create, edit and manage all system users</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            className="text-white hover:!bg-emerald-600 hover:!border-emerald-600"
          >
            Create User
          </Button>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <div className="mb-4 flex flex-wrap gap-3">
            <Input
              placeholder="Search by name or email…"
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              className="w-64"
            />
            <Select
              placeholder="Filter by role"
              allowClear
              value={roleFilter || undefined}
              onChange={v => setRoleFilter(v || "")}
              className="w-40"
              options={ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
            />
          </div>

          <Table
            columns={COLUMNS(openEdit, handleDelete, handleToggle)}
            dataSource={users}
            loading={loading}
            pagination={{ pageSize: 15 }}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Card>
      </div>

      <Modal
        open={modalOpen}
        title={editingUser ? "Edit User" : "Create User"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editingUser ? "Update" : "Create"}
        confirmLoading={saving}
        destroyOnClose
        width={640}
        okButtonProps={{ style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
              <Input placeholder="Nguyen Van A" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="user@example.com" />
            </Form.Item>
            <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
              <Input placeholder="0901234567" />
            </Form.Item>
            <Form.Item label="Role" name="role" rules={[{ required: true }]}>
              <Select options={ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))} />
            </Form.Item>
            {isCreate && (
              <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]} className="col-span-2">
                <Input.Password placeholder="Min 8 characters" />
              </Form.Item>
            )}
            {isStudent && (
              <Form.Item label="Student Code" name="studentCode" rules={[{ pattern: /^SE\d{6}$/, message: "Format: SE000000" }]}>
                <Input placeholder="SE000000" />
              </Form.Item>
            )}
            {editingUser && (
              <>
                <Form.Item label="GitHub Username" name="githubUsername">
                  <Input placeholder="github-handle" />
                </Form.Item>
                <Form.Item label="Jira Account ID" name="jiraAccountId">
                  <Input placeholder="jira-account-id" />
                </Form.Item>
                <Form.Item label="Status" name="status">
                  <Select options={STATUS_OPTS} />
                </Form.Item>
              </>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
}
