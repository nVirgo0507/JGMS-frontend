import { useState, useEffect } from "react";
import { Card, Descriptions, Typography, Avatar, Divider, message } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { LecturerService } from "../../services/lecturer.service";

const { Title, Text } = Typography;

export default function LecturerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await LecturerService.getProfile();
      if (response?.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch lecturer profile:", error);
      message.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Text type="secondary">Loading profile information...</Text>
      </div>
    );
  }

  // Fallback to auth context if fetch fails or hasn't completed
  const displayData = profile || user;

  if (!displayData) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Text type="secondary">Profile not found.</Text>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <div className="mb-6">
        <Title level={3}>My Profile</Title>
        <Text type="secondary">Manage your account details and preferences.</Text>
      </div>

      <div className="max-w-4xl">
        <Card className="rounded-3xl shadow-sm border-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar 
              size={84} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#0f766e' }}
            >
              {displayData.fullName ? displayData.fullName.charAt(0).toUpperCase() : displayData.email?.charAt(0).toUpperCase()}
            </Avatar>
            
            <div>
              <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
                {displayData.fullName || "Lecturer"}
              </Title>
              <Text className="text-gray-500 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-emerald-500" />
                {displayData.role || "LECTURER"}
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {displayData.status ? displayData.status.toUpperCase() : "ACTIVE"}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}