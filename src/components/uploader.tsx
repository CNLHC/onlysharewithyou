import { UploadOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import Upload, { UploadProps } from "antd/lib/upload";
import React, { useMemo } from "react";
import { useAuthedClient } from "../libs/hooks";

const Uploader = (props: { onSuccess: () => void }) => {
  const cli = useAuthedClient();
  const up: UploadProps = useMemo(
    () => ({
      name: "resource",
      multiple: false,
      accept: "application/pdf",
      action: "/api/resource",
      customRequest(e) {
        const f = e.file as File;
        let formData = new FormData();
        formData.append("resource", e.file);
        formData.append("filename", f.name);
        cli
          ?.post("/api/resource", formData, {
            headers: {
              "Content-Type": "multipart/form-data; charset=utf-8",
            },
          })
          ?.then((k) => e.onSuccess && e.onSuccess(k?.data));
      },

      onChange(info) {
        const { status } = info.file;
        if (status === "done") {
          props.onSuccess();
          message.success(`${info.file.name} 成功上传`);
        } else if (status === "error") {
          message.error(`${info.file.name} 上传失败`);
        }
      },
    }),
    [cli, props]
  );
  return (
    <Upload
      {...up}
      className="w-full"
      showUploadList={false}
      beforeUpload={(file) => {
        const isLt20M = file.size / 1024 / 1024 < 20;
        if (!isLt20M) {
          message.error("文件必须小于20MiB");
        }
        return isLt20M;
      }}
    >
      <Button className="w-full" icon={<UploadOutlined />} type={"primary"}>
        上传文件
      </Button>
    </Upload>
  );
};

export default Uploader;
