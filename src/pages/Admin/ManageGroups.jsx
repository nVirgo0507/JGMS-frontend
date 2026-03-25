import { useCallback, useEffect, useState } from "react";
import {
  Button, Card, Col, Form, Input, Popconfirm, Row, Select, Table,
  Tag, Tooltip, Typography,
} from "antd";
import {
  DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined, UserAddOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { AdminGroupService } from "../../services/admin/adminGroup.service";

const { Title, Text } = Typography;

const STATUS_COLOR = { active: "green", inactive: "default" };

/* ─── Expanded member sub-table ─── */
const MemberColumns = (groupCode, onRemoved) => [
  { title: "Name",      dataIndex: "fullName", key: "fullName", render: (_, r) => r.fullName || r.userName || "—" },
  { title: "Email",     dataIndex: "email",    key: "email" },
  {
    title: "Role", dataIndex: "isLeader", key: "role", width: 80,
    render: v => v ? <Tag color="gold">Leader</Tag> : <Tag>Member</Tag>,
  },
  { title: "Joined",    dataIndex: "joinedAt", key: "joinedAt", render: v => v ? new Date(v).toLocaleDateString() : "—" },
  {
    title: "", key: "remove", width: 80,
    render: (_, row) => !row.isLeader && (
      <Popconfirm
        title="Remove this member?"
        onConfirm={async () => {
          try {
            await AdminGroupService.removeMember(groupCode, row.userId);
            toast.success("Member removed");
            onRemoved(groupCode);
          } catch (err) {
            toast.error(err?.response?.data?.message || "Remove failed");
          }
        }}
        okButtonProps={{ danger: true }}
      >
        <Button size="small" danger>Remove</Button>
      </Popconfirm>
    ),
  },
];

export default function ManageGroups() {
  const [groups, setGroups]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [lecturers, setLecturers]         = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [expandedMembers, setExpandedMembers]     = useState({}); // groupCode → members[]
  const [membersLoading, setMembersLoading]       = useState({});

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  /* ─── Fetch helpers ─── */
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminGroupService.getAllGroups();
      setGroups((res.data || []).map(g => ({ ...g, key: g.groupCode })));
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLecturers = useCallback(async () => {
    try {
      const res = await AdminGroupService.getLecturers();
      setLecturers(res.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchAvailableStudents = useCallback(async () => {
    try {
      const res = await AdminGroupService.getStudents();
      setAvailableStudents(res.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchLecturers();
    fetchAvailableStudents();
  }, [fetchGroups, fetchLecturers, fetchAvailableStudents]);

  /* ─── Expand row: load members ─── */
  const loadMembers = async (groupCode) => {
    try {
      setMembersLoading(p => ({ ...p, [groupCode]: true }));
      const res = await AdminGroupService.getGroupDetail(groupCode);
      setExpandedMembers(p => ({ ...p, [groupCode]: res.data?.members || [] }));
    } catch {
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(p => ({ ...p, [groupCode]: false }));
    }
  };

  const handleExpand = (expanded, record) => {
    if (expanded && !expandedMembers[record.groupCode]) {
      loadMembers(record.groupCode);
    }
  };

  const handleMemberRemoved = (groupCode) => {
    loadMembers(groupCode);
    fetchAvailableStudents();
  };

  /* ─── Modal helpers ─── */
  const openCreate = () => {
    setEditingGroup(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = async (group) => {
    setEditingGroup(group);
    try {
      const res = await AdminGroupService.getGroupDetail(group.groupCode);
      setExpandedMembers(p => ({ ...p, [group.groupCode]: res.data?.members || [] }));
      form.resetFields();
      form.setFieldsValue({
        groupCode:  group.groupCode,
        groupName:  group.groupName,
        lecturerId: group.lecturerId ? String(group.lecturerId) : undefined,
        leaderId:   group.leaderId   ? String(group.leaderId)   : undefined,
        status:     group.status || "active",
        newMemberIds: [],
      });
    } catch {
      toast.error("Failed to load group detail");
      return;
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      setSaving(true);
      if (editingGroup) {
        await AdminGroupService.updateGroup(editingGroup.groupCode, {
          groupCode:  values.groupCode,
          groupName:  values.groupName,
          lecturerId: String(values.lecturerId),
          leaderId:   String(values.leaderId),
          status:     values.status,
        });
        if (values.newMemberIds?.length) {
          await AdminGroupService.addMembers(editingGroup.groupCode, {
            studentIdentifiers: values.newMemberIds.map(Number),
          });
        }
        toast.success("Group updated!");
      } else {
        const members = [...new Set([
          ...( values.memberIds || []).map(Number),
          Number(values.leaderId),
        ])];
        await AdminGroupService.createGroup({
          groupCode:  values.groupCode,
          groupName:  values.groupName,
          lecturerId: String(values.lecturerId),
          leaderId:   String(values.leaderId),
          memberIds:  members.map(String),
        });
        toast.success("Group created!");
      }
      setModalOpen(false);
      fetchGroups();
      fetchAvailableStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group) => {
    try {
      await AdminGroupService.deleteGroup(group.groupCode);
      toast.success("Group deleted");
      fetchGroups();
      fetchAvailableStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ─── Column definition ─── */
  const columns = [
    { title: "Code",     dataIndex: "groupCode",    key: "groupCode",    width: 110 },
    {
      title: "Name", dataIndex: "groupName", key: "groupName",
      render: (v, row) => (
        <div>
          <div className="font-semibold">{v}</div>
          <Text type="secondary" className="text-xs">{row.memberCount ?? 0} member(s)</Text>
        </div>
      ),
    },
    { title: "Leader",   dataIndex: "leaderName",   key: "leader",   render: v => v || <Text type="secondary">—</Text> },
    { title: "Lecturer", dataIndex: "lecturerName", key: "lecturer", render: v => v || <Text type="secondary">—</Text> },
    {
      title: "Status", dataIndex: "status", key: "status", width: 100,
      render: s => <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Actions", key: "actions", width: 130,
      render: (_, row) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); openEdit(row); }} />
          </Tooltip>
          <Popconfirm
            title="Delete this group?"
            onConfirm={() => handleDelete(row)}
            okButtonProps={{ danger: true }}
            okText="Delete"
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ─── Expanded row render ─── */
  const expandedRowRender = (record) => {
    const members = expandedMembers[record.groupCode] || [];
    return (
      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <Text strong><TeamOutlined className="mr-1" />Members</Text>
          <Select
            mode="multiple"
            placeholder="Add more students…"
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-64"
            options={availableStudents.map(s => ({ value: s.userId, label: `${s.fullName} (${s.email})` }))}
            onChange={async (ids) => {
              if (!ids.length) return;
              try {
                await AdminGroupService.addMembers(record.groupCode, { studentIdentifiers: ids.map(Number) });
                toast.success("Members added!");
                handleMemberRemoved(record.groupCode);
              } catch (err) {
                toast.error(err?.response?.data?.message || "Add failed");
              }
            }}
          />
        </div>
        <Table
          columns={MemberColumns(record.groupCode, handleMemberRemoved)}
          dataSource={(members || []).map(m => ({ ...m, key: m.userId }))}
          pagination={false}
          size="small"
          loading={membersLoading[record.groupCode]}
        />
      </div>
    );
  };

  const isEditing = !!editingGroup;
  const currentMembers = isEditing ? (expandedMembers[editingGroup?.groupCode] || []) : [];

  return (
    <>
      <div className="space-y-4 p-4 md:p-6 xl:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={2} className="!mb-1">Manage Groups</Title>
            <Text type="secondary">Create and manage student groups</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            className="text-white hover:!bg-emerald-600 hover:!border-emerald-600"
          >
            Create Group
          </Button>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <Table
            columns={columns}
            dataSource={groups}
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 700 }}
            expandable={{
              expandedRowRender,
              onExpand: handleExpand,
            }}
          />
        </Card>
      </div>

      {/* Create / Edit modal */}
      <Form.Provider>
        <Form
          form={form}
          layout="vertical"
        >
          <div style={{ display: "none" }} /> {/* prevents uncontrolled error before modal opens */}
        </Form>
      </Form.Provider>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 className="mb-4 text-lg font-semibold">
              {isEditing ? `Edit Group — ${editingGroup.groupCode}` : "Create New Group"}
            </h2>

            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Group Code" name="groupCode" rules={[{ required: true, pattern: /^SE\d+$/, message: "Format: SE0000" }]}>
                    <Input placeholder="SE1234" disabled={isEditing} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Group Name" name="groupName" rules={[{ required: true }]}>
                    <Input placeholder="Group Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Lecturer" name="lecturerId" rules={[{ required: true, message: "Select a lecturer" }]}>
                    <Select
                      placeholder="Select Lecturer"
                      showSearch
                      optionFilterProp="label"
                      options={lecturers.map(l => ({ value: String(l.userId), label: l.fullName }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Leader" name="leaderId" rules={[{ required: true, message: "Select a leader" }]}>
                    <Select
                      placeholder="Select Leader"
                      showSearch
                      optionFilterProp="label"
                      options={
                        isEditing
                          ? currentMembers.map(m => ({ value: String(m.userId), label: m.fullName || m.userName }))
                          : availableStudents.map(s => ({ value: String(s.userId), label: `${s.fullName} (${s.email})` }))
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              {!isEditing && (
                <Form.Item label="Initial Members" name="memberIds">
                  <Select
                    mode="multiple"
                    placeholder="Select members (leader auto-included)"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={availableStudents.map(s => ({ value: String(s.userId), label: `${s.fullName} (${s.email})` }))}
                  />
                </Form.Item>
              )}

              {isEditing && (
                <>
                  <Form.Item label="Add More Members" name="newMemberIds">
                    <Select
                      mode="multiple"
                      placeholder="Select students to add…"
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={availableStudents.map(s => ({ value: String(s.userId), label: `${s.fullName} (${s.email})` }))}
                    />
                  </Form.Item>
                  <Form.Item label="Status" name="status">
                    <Select options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
                  </Form.Item>
                </>
              )}
            </Form>

            <div className="mt-4 flex justify-end gap-3">
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handleSave}
                style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}