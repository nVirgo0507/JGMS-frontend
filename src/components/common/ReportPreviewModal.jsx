import React from "react";
import { Modal, Spin, Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

export default function ReportPreviewModal({ 
  visible, 
  onClose, 
  blobUrl, 
  loading, 
  onDownload, 
  onDownloadWord,
  title = "Report Preview" 
}) {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button 
          key="download-word" 
          icon={<DownloadOutlined />} 
          onClick={onDownloadWord}
          disabled={loading || !blobUrl}
        >
          Download Word
        </Button>,
        <Button 
          key="download-pdf" 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={onDownload}
          disabled={loading || !blobUrl}
        >
          Download PDF
        </Button>
      ]}
    >
      <Spin spinning={loading} tip="Preparing preview...">
        <div style={{ height: "75vh", width: "100%", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {blobUrl ? (
            <iframe 
              src={blobUrl} 
              width="100%" 
              height="100%" 
              style={{ border: "none" }}
              title="PDF Preview"
            />
          ) : (
            !loading && <span className="text-gray-500">No preview available</span>
          )}
        </div>
      </Spin>
    </Modal>
  );
}
