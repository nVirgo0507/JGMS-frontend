import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { AuthService } from "../../services/auth.service";

export default function ChangePasswordModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const response = await AuthService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (response?.data) {
        toast.success("Password changed successfully");
        form.resetFields();
        onClose();
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMsg = error?.response?.data?.message || "Failed to change password. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: "Please input your current password!" }]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 8, message: "Password must be at least 8 characters!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
              message: "Password must contain uppercase, lowercase, and a number",
            }
          ]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: "Please confirm your new password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The two passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item className="mb-0 mt-6 flex justify-end">
          <Button onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="bg-teal-500 hover:bg-teal-600 border-teal-500">
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
