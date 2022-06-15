import { ShareAltOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ColumnProps } from "antd/lib/table";
import React, { useCallback, useMemo, useState } from "react";
import { KeyedMutator } from "swr";
import {
  ResourceBrief,
  ShareBrief,
  useShare,
  useShareAction,
} from "../libs/hooks";
import { ShareContext } from "../libs/models";

const Action = (props: {
  s: ShareBrief;
  m: KeyedMutator<ShareBrief[] | undefined>;
}) => {
  const { s: share, m: mutate } = props;
  const { download, remove } = useShareAction();

  return (
    <div>
      <Button
        type="link"
        onClick={() => {
          download(
            share.uuid,
            `for_${share.context.to}_${share.resource.meta.filename}`
          );
        }}
      >
        下载
      </Button>
      <Button type="link"> 复制链接</Button>
      <Button
        type="link"
        danger
        onClick={() => remove(share.uuid).then((e) => mutate())}
      >
        删除
      </Button>
    </div>
  );
};
const NewShareForm = (props: {
  onSubmit: (e: ShareContext) => Promise<void>;
}) => {
  const [form] = useForm<ShareContext>();
  const [loading, setLoading] = useState(false);
  const onClickSubmit = async () => {
    const value: ShareContext = await form
      .validateFields()
      .catch((e) => message.error("请检查表单"));
    value.created_at = new Date();
    setLoading(true);
    await props.onSubmit(value);
    setLoading(false);
    form.resetFields();
  };

  return (
    <Form form={form}>
      <Form.Item label="分享给" name="to" colon rules={[{ required: true }]}>
        <Input disabled={loading} />
      </Form.Item>

      <Form.Item
        label="水印文字"
        name="watermark_text"
        colon
        rules={[{ required: true }]}
      >
        <Input disabled={loading} />
      </Form.Item>

      <Form.Item>
        <Button
          onClick={onClickSubmit}
          type={"primary"}
          block
          loading={loading}
        >
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
const Share = (props: { resource?: ResourceBrief }) => {
  const { data, mutate } = useShare(props.resource);
  const { create } = useShareAction();
  const [open, setOpen] = useState(false);
  const resource = props.resource;
  const onCreate = useCallback(
    async (ctx: ShareContext) => {
      if (resource) await create(ctx, resource).then(() => mutate());
    },
    [resource, create, mutate]
  );
  const columns = useMemo(
    () =>
      [
        { title: "to", dataIndex: ["context", "to"], key: "to" },
        {
          title: "水印文字",
          dataIndex: ["context", "watermark_text"],
          key: "watermark_text",
        },
        {
          title: "操作",
          render: (_, k) => <Action s={k} m={mutate} />,
        },
      ] as ColumnProps<ShareBrief>[],
    [mutate]
  );

  if (!props.resource) return null;
  if (!data || data.length <= 0)
    return (
      <div>
        <Modal onCancel={() => setOpen(false)} visible={open} footer={null}>
          <NewShareForm
            onSubmit={(e) => onCreate(e).then(() => setOpen(false))}
          />
        </Modal>
        <div>
          <Button
            onClick={() => setOpen(true)}
            type={"primary"}
            icon={<ShareAltOutlined />}
            block
          >
            新建分享
          </Button>
        </div>
      </div>
    );
  return (
    <div>
      <Modal onCancel={() => setOpen(false)} visible={open} footer={null}>
        <NewShareForm
          onSubmit={(e) => onCreate(e).then(() => setOpen(false))}
        />
      </Modal>
      <div className="flex flex-col gap-2">
        <div>
          <Button
            onClick={() => setOpen(true)}
            type={"primary"}
            icon={<ShareAltOutlined />}
          >
            新建分享
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(e) => e.uuid}
        ></Table>
      </div>
    </div>
  );
};

export default Share;
