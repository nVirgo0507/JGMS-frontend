import { useEffect, useState } from "react";
import { Col, Form, Input, Modal, Row, Select, Switch, Button, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";

const COMMIT_TYPES = [
  { value: "feat", label: "feat (A new feature)" },
  { value: "fix", label: "fix (A bug fix)" },
  { value: "docs", label: "docs (Documentation only changes)" },
  { value: "style", label: "style (Changes that do not affect the meaning of the code)" },
  { value: "refactor", label: "refactor (A code change that neither fixes a bug nor adds a feature)" },
  { value: "perf", label: "perf (A code change that improves performance)" },
  { value: "test", label: "test (Adding missing tests or correcting existing tests)" },
  { value: "chore", label: "chore (Other changes that don't modify src or test files)" },
];

export default function TaskCommitModal({ open, task, onCancel }) {
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [generatedLine, setGeneratedLine] = useState("");

  useEffect(() => {
    if (open) {
      form.resetFields();
      setGeneratedLine("");
      form.setFieldsValue({
        type: "feat",
        scope: "",
        includeIssueKey: true,
      });
    }
  }, [open, task, form]);

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setGenerating(true);
      
      const response = await StudentService.generateCommitLine({
        taskId: task.taskId,
        jiraIssueKey: task.jiraIssueKey && task.jiraIssueKey !== "-" ? task.jiraIssueKey : null,
        type: values.type,
        scope: values.scope || null,
        includeIssueKey: values.includeIssueKey,
      });

      const data = response?.data;
      const line = typeof data === "string" 
        ? data 
        : data?.commitLine || data?.message || data?.data || JSON.stringify(data || "");

      if (!line || line === '""') {
        toast.error("Received empty response from server");
        return;
      }

      setGeneratedLine(line.trim());
      
      navigator.clipboard.writeText(line.trim());
      toast.success("Commit line generated and copied to clipboard!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate commit line");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedLine) {
      navigator.clipboard.writeText(generatedLine);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <Modal
      title="Generate Git Commit Line"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Close</Button>,
        <Button key="generate" type="primary" loading={generating} onClick={handleGenerate} className="bg-emerald-500 hover:bg-emerald-600 border-none">
          Generate
        </Button>
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="type" label="Commit Type" rules={[{ required: true }]}>
              <Select options={COMMIT_TYPES} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="scope" label="Scope (Optional)" extra="e.g. auth, ui, authService">
              <Input placeholder="Enter scope..." />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="includeIssueKey" label="Include Jira Issue Key" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {generatedLine && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <Typography.Paragraph className="mb-2 text-sm text-slate-500 font-medium">Result:</Typography.Paragraph>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white border border-slate-200 rounded text-slate-800 break-all">{generatedLine}</code>
            <Button icon={<CopyOutlined />} onClick={handleCopy} title="Copy manually" />
          </div>
        </div>
      )}
    </Modal>
  );
}
