import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Result, Spin, Button, Form, Input, Typography, Steps } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloudServerOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { BaseService } from "../../config/basic.service";
import { ROUTER_URL } from "../../consts/router.const";
import { LOCAL_STORAGE } from "../../consts/const";
import { decodeJWT, getDashboardPathByRole } from "../../utils/auth";

const { Title, Text } = Typography;

const JiraCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("exchanging"); // exchanging, project, success, error
  const [tokens, setTokens] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [form] = Form.useForm();

  const code = searchParams.get("code");
  const groupCode = searchParams.get("state"); // We passed groupCode in the state!
  const isSso = groupCode === "sso";

  useEffect(() => {
    if (!code || !groupCode) {
      setStatus("error");
      setErrorMsg("Missing OAuth code or state parameter.");
      return;
    }

    // 1. Exchange code for tokens
    const exchangeTokens = async () => {
      try {
        if (isSso) {
          // --- SSO Flow ---
          const response = await BaseService.post({
            url: "/api/auth/sso/jira/callback",
            payload: { code }
          });
          
          if (response?.data?.isNewUser) {
            localStorage.setItem("JIRA_SSO_PROFILE", JSON.stringify(response.data.profile));
            navigate("/register/complete-profile");
          } else if (response?.data?.accessToken) {
            const accessToken = response.data.accessToken;
            const decodedToken = decodeJWT(accessToken);
            const userRole = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken?.role;
            const userData = { accessToken, role: userRole, email: decodedToken?.email || decodedToken?.sub };
            localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(userData));
            toast.success("Login successful!");
            window.location.href = getDashboardPathByRole(userRole);
          } else {
            throw new Error("Invalid SSO response from server.");
          }
        } else {
          // --- Project Linking Flow ---
          // C# backend expects exactly a JSON string primitive for [FromBody] string code
          const response = await BaseService.post({
            url: "/api/jira/auth/callback",
            payload: `"${code}"`, 
            headers: { "Content-Type": "application/json" }
          });
          
          if (response?.data) {
            setTokens(response.data);
            setStatus("project");
          } else {
            throw new Error("Failed to retrieve tokens from backend.");
          }
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.response?.data?.message || err.message || "Failed to exchange Atlassian tokens.");
      }
    };

    exchangeTokens();
  }, [code, groupCode, isSso, navigate]);

  const onFinish = async (values) => {
    try {
      setStatus("saving");
      const payload = {
        jiraUrl: tokens.cloudId, // Backend maps cloudId to JiraUrl for OAuth
        jiraEmail: "oauth@placeholder.com", // Ignored for OAuth
        apiToken: tokens.accessToken, // Backend maps accessToken to ApiToken for OAuth
        projectKey: values.projectKey
      };

      await BaseService.post({
        url: `/api/jira/groups/${groupCode}/integration`,
        payload
      });

      setStatus("success");
      toast.success("Jira successfully linked!");
      
      setTimeout(() => {
        navigate(ROUTER_URL.STUDENT.MY_GROUP);
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save Jira configuration.");
      toast.error("Failed to connect Jira.");
    }
  };

  const getStep = () => {
    switch(status) {
      case "exchanging": return 0;
      case "project": return 1;
      case "saving": return 2;
      case "success": return 3;
      default: return 0;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <CloudServerOutlined className="text-4xl text-white mb-2" />
          <Title level={3} className="!text-white !mb-0">Atlassian Integration</Title>
        </div>

        <div className="p-8">
          {status !== "error" && (
            <Steps 
              current={getStep()} 
              items={[
                { title: 'Authorize' },
                { title: 'Select Project' },
                { title: 'Complete' },
              ]}
              className="mb-8"
            />
          )}

          {status === "exchanging" && (
            <div className="text-center py-8">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <p className="mt-4 text-gray-500 font-medium">Securely exchanging tokens with Atlassian...</p>
            </div>
          )}

          {status === "saving" && (
            <div className="text-center py-8">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <p className="mt-4 text-gray-500 font-medium">Saving configuration to your group...</p>
            </div>
          )}

          {status === "project" && (
            <div className="animate-fade-in">
              <Result
                icon={<CheckCircleOutlined className="text-green-500" />}
                title="Successfully Authenticated!"
                subTitle={
                  <div className="mt-2">
                    <Text className="block text-gray-500">Connected Atlassian Account ID:</Text>
                    <Text strong className="bg-gray-100 px-2 py-1 rounded">{tokens?.jiraAccountId}</Text>
                  </div>
                }
              />
              
              <Form form={form} onFinish={onFinish} layout="vertical" className="mt-6">
                <Form.Item 
                  label={<span className="font-semibold text-gray-700">Jira Project Key</span>}
                  name="projectKey" 
                  rules={[{ required: true, message: 'Please enter your Jira Project Key (e.g. SWP391)' }]}
                  extra="This is the prefix used on all your Jira issues (e.g., SWP391)."
                >
                  <Input size="large" placeholder="e.g. SWP391" className="rounded-lg" />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium rounded-lg">
                  Finalize Integration
                </Button>
              </Form>
            </div>
          )}

          {status === "success" && (
            <Result
              status="success"
              title="Integration Complete!"
              subTitle="Your group is now fully connected to Jira. Redirecting you back to your dashboard..."
            />
          )}

          {status === "error" && (
            <Result
              status="error"
              title="Integration Failed"
              subTitle={errorMsg}
              extra={[
                <Button type="primary" key="dashboard" onClick={() => navigate(ROUTER_URL.STUDENT.MY_GROUP)}>
                  Return to Dashboard
                </Button>
              ]}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default JiraCallback;
