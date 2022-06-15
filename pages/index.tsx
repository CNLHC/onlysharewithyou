import { DeleteFilled, DownloadOutlined } from "@ant-design/icons";
import { Button, Select, Upload } from "antd";
import downloadjs from "downloadjs";
import React, { useContext, useEffect, useState } from "react";
import Register from "../src/components/register";
import Share from "../src/components/share";
import Uploader from "../src/components/uploader";
import {
  ResourceBrief,
  useAuthedClient,
  useResources,
} from "../src/libs/hooks";
import { AuthContext } from "./_app";

export default function Index() {
  const cli = useAuthedClient();
  const auth = useContext(AuthContext);

  const [cur_resource, setResource] = useState<ResourceBrief | undefined>();
  const { data: resources, mutate: muteta_resource } = useResources();
  useEffect(() => {
    if (!cur_resource && resources.length > 0) {
      return setResource(resources[0]);
    }
  }, [cur_resource, resources]);

  if (!auth.isValid || !cli)
    return <Register onLogin={(e) => auth.setKey(e.toString("base64"))} />;

  return (
    <div>
      {/* <Uploader /> */}

      <div
        className={[
          "w-full flex justify-center mt-[64px]",
          "overflow-hidden",
          "box-border",
          "px-3",
        ].join(" ")}
      >
        <div className={["w-full flex flex-col gap-2 lg:w-1/2  "].join(" ")}>
          <div className={["flex gap-2 flex-wrap"].join(" ")}>
            <div className="w-full lg:w-min">
              <Uploader onSuccess={() => muteta_resource()} />
            </div>
            <Select
              className="flex-1"
              value={cur_resource?.uuid}
              onChange={(uuid) =>
                setResource(resources.find((e) => e.uuid == uuid))
              }
            >
              {resources?.map((e, idx) => {
                return (
                  <Select.Option key={idx} value={e.uuid}>
                    {e.meta.filename}
                  </Select.Option>
                );
              })}
            </Select>

            <Button
              className="w-full lg:w-min"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() =>
                cli
                  .post(
                    "/api/download/resource",
                    { resource_uuid: cur_resource?.uuid },
                    { responseType: "blob" }
                  )
                  .then((e) => {
                    return downloadjs(e.data, cur_resource?.meta.filename);
                  })
              }
            >
              下载
            </Button>
          </div>
          <Share resource={cur_resource} />
        </div>
      </div>
      <div className="w-[100vw] flex justify-center m-2">
        <Button
          type="link"
          onClick={() => {
            auth.logout();
          }}
        >
          登出
        </Button>
      </div>
    </div>
  );
}
