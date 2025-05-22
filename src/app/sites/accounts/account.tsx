import { Descriptions, Input } from "antd";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import PageTitle from "../../features/PageTitle";
import type { GetMyAccount200ResponseDataAccount } from "../../spaceTraderAPI/api";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

export default function Account() {
  const [accountToken, setAccountToken] = useState<string>("");
  const [myAccount, setMyAccount] =
    useState<GetMyAccount200ResponseDataAccount>();
  useEffect(() => {
    try {
      if (accountToken !== "") {
        const decoded = jwtDecode(accountToken);

        console.log("decoded", decoded);
      }
      spaceTraderClient.AccountsClient.getMyAccount({
        transformRequest: (data, headers) => {
          if (accountToken === "") {
            return data;
          }
          headers["Authorization"] = `Bearer ${accountToken}`;
          return data;
        },
      }).then((response) => {
        console.log("response", response);
        setMyAccount(response.data.data.account);
        // response.data.data.account;
      });
    } catch (error) {
      console.log("error", error);
    }
  }, [accountToken]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Account`} />
      <h1>Account</h1>
      <Input.Password
        value={accountToken}
        onChange={(e) => setAccountToken(e.target.value)}
        placeholder="Account Token"
      />
      <Descriptions
        title="Account Info"
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        bordered
        items={[
          {
            key: "ID",
            label: "ID",
            children: <span>{myAccount?.id}</span>,
          },
          {
            key: "email",
            label: "Email",
            children: <span>{myAccount?.email}</span>,
          },
          {
            key: "createdAt",
            label: "Created At",
            children: (
              <span>
                {new Date(myAccount?.createdAt || 0).toLocaleString()}
              </span>
            ),
          },
          {
            key: "token",
            label: "Token",
            children: <span>{myAccount?.token}</span>,
          },
        ]}
        layout="vertical"
      />
    </div>
  );
}
