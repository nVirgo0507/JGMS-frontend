import "./Table.css";
import { useEffect, useState, useCallback } from "react";
import {
  Button, Card, Form, Input, Modal, Popconfirm, Table, Tag, Tooltip, Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { AdminUserService } from "../../services/admin/adminUser.service";

const { Title, Text } = Typography;

const COLUMNS = (onEdit, onDelete) => [
  { title: "ID",    dataIndex: "userId",   key: "userId",   width: 70 },
  { title: "Name",  dataIndex: "fullName", key: "fullName" },
  { title: "Email", dataIndex: "email",    key: "email" },
  { title: "Phone", dataIndex: "phone",    key: "phone",    render: v => v || "—" },
  {
    title: "Status", dataIndex: "status", key: "status", width: 100,
    render: s => <Tag color={s === "active" ? "green" : "default"}>{s}</Tag>,
  },
  {
    title: "Actions", key: "actions", width: 110,
    render: (_, row) => (
      <div className="flex gap-2">
        <Tooltip title="Edit">
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(row)} />
        </Tooltip>
        <Popconfirm
          title="Delete this lecturer?"
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

const EMPTY = { fullName: "", email: "", phone: "", password: "" };

export default function ManageLecturers() {
  const [lecturers, setLecturers]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  const fetchLecturers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminUserService.getUsersByRole("lecturer");
      setLecturers((res.data || []).map(l => ({ ...l, key: l.userId })));
    } catch {
      toast.error("Failed to load lecturers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLecturers(); }, [fetchLecturers]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (lec) => {
    setEditing(lec);
    form.resetFields();
    form.setFieldsValue({ fullName: lec.fullName, email: lec.email, phone: lec.phone || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      setSaving(true);
      if (editing) {
        await AdminUserService.updateUser(editing.userId, {
          fullName: values.fullName,
          email:    values.email,
          phone:    values.phone,
          role:     "lecturer",
        });
        toast.success("Lecturer updated!");
      } else {
        await AdminUserService.createUser({
          fullName: values.fullName,
          email:    values.email,
          phone:    values.phone,
          password: values.password,
          role:     "lecturer",
        });
        toast.success("Lecturer added!");
      }
      setModalOpen(false);
      fetchLecturers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lec) => {
    try {
      await AdminUserService.deleteUser(lec.userId);
      toast.success("Lecturer deleted");
      fetchLecturers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="space-y-4 p-4 md:p-6 xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={2} className="!mb-1">Manage Lecturers</Title>
            <Text type="secondary">Add and manage all lecturer accounts</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            className="text-white hover:!bg-emerald-600 hover:!border-emerald-600"
          >
            Add Lecturer
          </Button>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <Table
            columns={COLUMNS(openEdit, handleDelete)}
            dataSource={lecturers}
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 600 }}
          />
        </Card>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Edit Lecturer" : "Add Lecturer"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editing ? "Update" : "Add"}
        confirmLoading={saving}
        destroyOnClose
        width={480}
        okButtonProps={{ style: { backgroundColor: "#10b981", borderColor: "#10b981" } }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
            <Input placeholder="Nguyen Van A" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="lecturer@example.com" />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
            <Input placeholder="0901234567" />
          </Form.Item>
          {!editing && (
            <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
              <Input.Password placeholder="Min 8 characters" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
