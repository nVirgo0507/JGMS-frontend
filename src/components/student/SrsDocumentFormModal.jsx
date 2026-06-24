import { useEffect, useState, useMemo } from "react";
import { Button, Col, Form, Grid, Input, Modal, Row, Select, Switch, Table, Space, Tag } from "antd";
import { RobotOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

function MetadataFields({ includeStatus = false }) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          label="Document Title"
          name="documentTitle"
          rules={[{ required: true, message: "Document title is required" }]}
        >
          <Input placeholder="Software Requirements Specification" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Version"
          name="version"
          rules={[{ required: true, message: "Version is required" }]}
        >
          <Input placeholder="1.0" />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item label="Introduction" name="introduction">
          <TextArea rows={3} placeholder="Document overview" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Scope" name="scope">
          <TextArea rows={3} placeholder="Project scope" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Product Perspective" name="productPerspective">
          <TextArea rows={3} placeholder="System context and perspective" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="User Classes" name="userClasses">
          <TextArea rows={3} placeholder="Target user groups" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Operating Environment" name="operatingEnvironment">
          <TextArea rows={3} placeholder="Platforms, browsers, OS..." />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label="Assumptions and Dependencies"
          name="assumptionsDependencies"
        >
          <TextArea rows={3} placeholder="Known dependencies and assumptions" />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item label="Glossary" name="glossary">
          <TextArea rows={3} placeholder="Terms, acronyms, and abbreviations" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="User Interfaces" name="userInterfaces">
          <TextArea rows={3} placeholder="User interface requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Hardware Interfaces" name="hardwareInterfaces">
          <TextArea rows={3} placeholder="Hardware interface requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Software Interfaces" name="softwareInterfaces">
          <TextArea rows={3} placeholder="Software interface requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Communications Interfaces" name="communicationsInterfaces">
          <TextArea rows={3} placeholder="Communications interface requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Performance Requirements" name="performanceRequirements">
          <TextArea rows={3} placeholder="System performance requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Security Requirements" name="securityRequirements">
          <TextArea rows={3} placeholder="System security requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Safety Requirements" name="safetyRequirements">
          <TextArea rows={3} placeholder="System safety requirements" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Software System Attributes" name="softwareSystemAttributes">
          <TextArea rows={3} placeholder="Software quality attributes (reliability, availability, maintainability, portability, etc.)" />
        </Form.Item>
      </Col>

      {includeStatus ? (
        <Col xs={24} md={12}>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </Form.Item>
        </Col>
      ) : null}
    </Row>
  );
}

function RequirementTableSelector({ value = [], onChange, options = [] }) {
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const dataSource = useMemo(() => {
    return options.map((opt) => {
      const parts = opt.label.split(" - ");
      let section = "-";
      let code = "";
      let title = "";
      if (parts.length === 3) {
        section = parts[0];
        code = parts[1];
        title = parts[2];
      } else if (parts.length === 2) {
        code = parts[0];
        title = parts[1];
      } else {
        code = `REQ-${opt.value}`;
        title = opt.label;
      }
      return {
        key: opt.value,
        section,
        code,
        title,
        requirementType: opt.requirementType || "-",
      };
    });
  }, [options]);

  const uniqueTypes = useMemo(() => {
    const types = new Set();
    options.forEach((opt) => {
      if (opt.requirementType) {
        types.add(opt.requirementType);
      }
    });
    return ["All", ...Array.from(types)];
  }, [options]);

  const filteredData = useMemo(() => {
    let data = dataSource;
    if (selectedType !== "All") {
      data = data.filter((item) => item.requirementType === selectedType);
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(
        (item) =>
          item.code.toLowerCase().includes(lower) ||
          item.title.toLowerCase().includes(lower) ||
          item.section.toLowerCase().includes(lower)
      );
    }
    return data;
  }, [dataSource, searchText, selectedType]);

  const columns = [
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      width: 100,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (text) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "requirementType",
      key: "requirementType",
      width: 130,
      render: (text) => {
        const isNonFunc = text?.toLowerCase()?.includes("non");
        return <Tag color={isNonFunc ? "orange" : "blue"}>{text}</Tag>;
      },
    },
  ];

  const handleSelectAll = () => {
    const allKeys = filteredData.map((item) => item.key);
    if (onChange) onChange(allKeys);
  };

  const handleClearSelection = () => {
    if (onChange) onChange([]);
  };

  const rowSelection = {
    selectedRowKeys: value,
    onChange: (selectedKeys) => {
      if (onChange) onChange(selectedKeys);
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Space size="middle" className="flex-wrap">
          <Input
            placeholder="Search requirements by code or title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ width: 160 }}
            options={uniqueTypes.map((t) => ({ label: t, value: t }))}
            placeholder="Filter by Type"
          />
          <span className="text-sm font-medium text-slate-500">
            Selected: <strong className="text-purple-600">{value.length}</strong> / {dataSource.length}
          </span>
        </Space>
        <Space>
          <Button size="small" onClick={handleSelectAll}>
            Add All Filtered
          </Button>
          <Button size="small" danger onClick={handleClearSelection}>
            Remove All
          </Button>
        </Space>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        size="small"
        bordered
        locale={{ emptyText: "No requirements found" }}
      />
    </div>
  );
}

export default function SrsDocumentFormModal({
  open,
  title,
  okText,
  saving = false,
  generatingAi = false,
  initialValues,
  requirementOptions = [],
  includeRequirements = false,
  includeStatus = false,
  onCancel,
  onSubmit,
  onGenerateAi,
}) {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }
  }, [open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  const handleGenerateAiClick = async () => {
    if (!onGenerateAi) return;
    try {
      const requirementIds = form.getFieldValue("requirementIds") || [];
      const result = await onGenerateAi(requirementIds);
      if (result) {
        form.setFieldsValue({
          introduction: result.introduction || "",
          scope: result.scope || "",
          productPerspective: result.productPerspective || "",
          userClasses: result.userClasses || "",
          operatingEnvironment: result.operatingEnvironment || "",
          assumptionsDependencies: result.assumptionsDependencies || "",
          glossary: result.glossary || "",
          userInterfaces: result.userInterfaces || "",
          hardwareInterfaces: result.hardwareInterfaces || "",
          softwareInterfaces: result.softwareInterfaces || "",
          communicationsInterfaces: result.communicationsInterfaces || "",
          performanceRequirements: result.performanceRequirements || "",
          securityRequirements: result.securityRequirements || "",
          safetyRequirements: result.safetyRequirements || "",
          softwareSystemAttributes: result.softwareSystemAttributes || "",
        });
      }
    } catch (err) {
      // Handled in parent
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={okText}
      confirmLoading={saving}
      destroyOnClose
      centered
      width={screens.md ? 920 : "calc(100vw - 24px)"}
      styles={{
        body: {
          maxHeight: screens.md ? "72vh" : "76vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
      okButtonProps={{
        style: GREEN_BUTTON_STYLE,
        className: "text-white hover:!border-emerald-600 hover:!bg-emerald-600",
      }}
    >
      <Form form={form} layout="vertical">
        <MetadataFields includeStatus={includeStatus} />

        {includeRequirements ? (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">Requirements</span>
                  <Form.Item
                    name="importFromJira"
                    valuePropName="checked"
                    className="!mb-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Import From Jira</span>
                      <Switch size="small" />
                    </div>
                  </Form.Item>
                </div>
                <Form.Item
                  name="requirementIds"
                  rules={[
                    {
                      required: true,
                      type: "array",
                      min: 1,
                      message: "Select at least one requirement",
                    },
                  ]}
                >
                  <RequirementTableSelector options={requirementOptions} />
                </Form.Item>
              </Col>
            </Row>

            {onGenerateAi ? (
              <Row gutter={16} className="mb-4">
                <Col span={24}>
                  <Button
                    type="dashed"
                    icon={<RobotOutlined />}
                    loading={generatingAi}
                    onClick={handleGenerateAiClick}
                    className="w-full border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold flex items-center justify-center gap-2"
                  >
                    Generate Document Sections with AI (Uses Selected Requirements)
                  </Button>
                </Col>
              </Row>
            ) : null}
          </>
        ) : null}
      </Form>
    </Modal>
  );
}
