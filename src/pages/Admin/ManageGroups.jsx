import "./Table.css";
import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import Modal from "../../components/coreUI/Modal";
import { AdminGroupService } from "../../services/admin/adminGroup.service";
import { toast } from "react-toastify";

export default function ManageGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editingGroup, setEditingGroup] = useState(null);

  const [formData, setFormData] = useState({
    groupCode: "",
    groupName: "",
    lecturerId: "",
    leaderId: "",
    memberIds: []
});

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await AdminGroupService.getAllGroups();
      console.log("API RESPONSE:", res.data);
      setGroups(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      projectTitle: "",
      className: "",
      lecturerId: "",
    });
    setEditingGroup(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (group) => {
    setEditingGroup(group);

    setFormData({
      groupName: group.groupName || "",
      projectTitle: group.projectTitle || "",
      className: group.className || "",
      lecturerId: group.lecturerId || "",
    });

    setOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const regex = /^SE\d{4}$/;

    if (!regex.test(formData.groupCode)) {
      toast.error("Group code must be SE + 4 digits (ex: SE1234)");
      return;
    }

    try {

      const payload = {
        ...formData,
        lecturerId: Number(formData.lecturerId),
        leaderId: Number(formData.leaderId),
        memberIds: []
      };

      if (editingGroup) {
        await AdminGroupService.updateGroup(
          editingGroup.groupCode,
          payload
        );
        toast.success("Group updated successfully!");
      } else {
        await AdminGroupService.createGroup(payload);
        toast.success("Group created successfully!");
      }

      setOpen(false);
      resetForm();
      fetchGroups();

    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (groupCode) => {
    if (!window.confirm("Delete this group?")) return;

    try {
      await AdminGroupService.deleteGroup(groupCode);
      toast.success("Group deleted");
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Manage Student Groups</h1>

        <button
          className="btn-primary"
          onClick={handleOpenCreate}
        >
          + Create New Group
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>GROUP ID</th>
              <th>GROUP NAME</th>
              <th>LECTURER</th>
              <th>PROJECT</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {groups.map(group => (
              <tr key={group.groupId}>
                <td>{group.groupCode}</td>

                <td>
                  <strong>{group.groupName}</strong>
                  <p>{group.memberCount} Members</p>
                </td>

                <td>{group.lecturerName}</td>

                <td>
                  <span className="badge">
                    {group.status}
                  </span>
                </td>

                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        title={
          editingGroup
            ? "Edit Group"
            : "Create New Group"
        }
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="modal-form">

          <input
            name="groupCode"
            placeholder="Group Code (SE0000)"
            value={formData.groupCode}
            onChange={handleChange}
          />

          <input
            name="groupName"
            placeholder="Group Name"
            value={formData.groupName}
            onChange={handleChange}
          />

          <input
            name="lecturerId"
            placeholder="Lecturer ID"
            value={formData.lecturerId}
            onChange={handleChange}
          />

          <input
            name="leaderId"
            placeholder="Leader ID"
            value={formData.leaderId}
            onChange={handleChange}
          />
          <button
            className="btn-primary full"
            onClick={handleSubmit}
          >
            {editingGroup ? "Update Group" : "Create Group"}
          </button>
        </div>
      </Modal>

      <Pagination
        page={page}
        totalPages={5}
        onChange={setPage}
      />
    </>
  );
}

