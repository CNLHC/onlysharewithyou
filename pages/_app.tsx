import type { AppProps } from "next/app";
import "antd/dist/antd.css";
import "./global.css";
import React from "react";
import { useUserKey } from "../src/libs/hooks";
import { LoadingContext, useLoadingValue } from "../src/libs/loading";

type UserKeyContext = {
  logout: () => void;
  isValid: boolean;
  setKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  key: string | undefined;
};
export const AuthContext = React.createContext<UserKeyContext>(
  {} as UserKeyContext
);

export default function MyApp({ Component, pageProps }: AppProps) {
  const { logout, isValid, setKey, key } = useUserKey();

  const loading_value = useLoadingValue();

  return (
    <LoadingContext.Provider value={loading_value}>
      <AuthContext.Provider
        value={{
          key,
          logout,
          isValid,
          setKey,
        }}
      >
        <Component {...pageProps} />
      </AuthContext.Provider>
    </LoadingContext.Provider>
  );
}
