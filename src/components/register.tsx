import { Button, Popconfirm } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import * as bip39 from "bip39";
import { ReloadOutlined } from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import { useUserKey } from "../libs/hooks";

const gen_mnemonic = () => bip39.generateMnemonic(256);

const Register = (props: { onLogin: (k: Buffer) => void }) => {
  const [v, setV] = useState(gen_mnemonic());
  const { setKey } = useUserKey();
  const [isLogin, setLogin] = useState(false);
  const [isMnemonicValid, setMneonicValid] = useState(false);

  useEffect(() => {
    setMneonicValid(bip39.validateMnemonic(v));
  }, [v]);
  const onInput = useCallback(
    (e: string) => {
      if (isLogin) setV(e);
    },
    [isLogin]
  );
  const onLogin = async () => {
    const key = await bip39.mnemonicToSeed(v);
    props.onLogin(key);
  };

  return (
    <div
      className={["w-[100vw] h-[100vh] flex justify-center items-center"].join(
        " "
      )}
    >
      <div
        className={[
          "w-full flex flex-col justify-center gap-2 p-2",
          "lg:w-1/2",
        ].join(" ")}
      >
        {isLogin ? null : (
          <span>
            请保存下面这段助记词, 它是您访问时的<strong>身份标志</strong>
          </span>
        )}

        <div className="flex gap-2 items-center">
          <TextArea value={v} onChange={(e) => onInput(e.target.value)} />

          {isLogin ? null : (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setV(gen_mnemonic())}
            />
          )}
        </div>

        {isLogin ? (
          <Button
            type={"primary"}
            disabled={!isMnemonicValid}
            className={"w-full"}
            onClick={onLogin}
          >
            登录
          </Button>
        ) : (
          <Popconfirm
            title={"请再次确认, 您已妥善保管助记词"}
            onConfirm={onLogin}
            okText={"确定"}
            cancelText={"返回"}
            placement={"bottom"}
          >
            <Button
              type={"primary"}
              disabled={!isMnemonicValid}
              className={"w-full"}
            >
              下一步
            </Button>
          </Popconfirm>
        )}

        {isLogin ? (
          <Button
            type={"link"}
            className={"underline"}
            onClick={() => {
              setV(gen_mnemonic());
              setLogin(false);
            }}
          >
            新用户请点击此处
          </Button>
        ) : (
          <Button
            type={"link"}
            className={"underline"}
            onClick={() => {
              setV("");
              setLogin(true);
            }}
          >
            已有助记词？请点击此处
          </Button>
        )}
      </div>
    </div>
  );
};

export default Register;
