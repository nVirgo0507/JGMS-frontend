import { useEffect, useState, useCallback } from "react";
import { Card, Descriptions, Typography, Avatar, Divider, Tag, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { AdminUserService } from "../../services/admin/adminUser.service";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const subId = user.sub || JSON.parse(atob(user.accessToken.split('.')[1])).sub;
      const res = await AdminUserService.getUser(subId);
      setProfile(res.data);
    } catch (err) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!user || loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Spin size="large" tip="Loading profile information..." />
      </div>
    );
  }

  const displayData = profile || user;

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <div className="mb-6">
        <Title level={3}>My Profile</Title>
        <Text type="secondary">Manage your administrator account details.</Text>
      </div>

      <div className="max-w-4xl">
        <Card className="rounded-3xl shadow-sm border-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar 
              size={84} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#10b981' }} // Emerald 500
            >
              {displayData.fullName ? displayData.fullName.charAt(0).toUpperCase() : displayData.email?.charAt(0).toUpperCase()}
            </Avatar>
            
            <div>
              <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
                {displayData.fullName || "Administrator"}
              </Title>
              <Text className="text-gray-500 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-emerald-500" />
                ADMINISTRATOR
              </Text>
            </div>
          </div>

          <Divider />

          <Descriptions 
            title={<span className="text-lg font-medium">Contact Information</span>}
            column={{ xs: 1, sm: 1, md: 2 }}
            layout="vertical"
            size="large"
          >
            <Descriptions.Item label={<span className="flex items-center gap-2"><MailOutlined /> Email Address</span>}>
              <Text className="font-medium text-gray-900">{displayData.email || "Not Provided"}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label={<span className="flex items-center gap-2"><PhoneOutlined /> Phone Number</span>}>
              <Text className="font-medium text-gray-900">{displayData.phone || "Not Provided"}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label={<span className="flex items-center gap-2"><UserOutlined /> Status</span>}>
              {displayData.status === "inactive" ? (
                <Tag color="default">Inactive</Tag>
              ) : (
                <Tag color="green">Active</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}
