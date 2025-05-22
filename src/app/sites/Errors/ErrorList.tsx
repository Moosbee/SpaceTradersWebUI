import { Button, Space, Table } from "antd";
import { useEffect, useState } from "react";
import PageTitle from "../../features/PageTitle";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

export default function ErrorList() {
  const [errors, setErrors] = useState<
    {
      code: number;
      name: string;
    }[]
  >([]);

  useEffect(() => {
    spaceTraderClient.GlobalClient.getErrorCodes().then((response) => {
      setErrors(response.data.errorCodes);
    });
  }, []);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Surveys`} />
      <Space>
        <h1>Error List ({errors.length})</h1>
        <Button
          onClick={() => {
            spaceTraderClient.GlobalClient.getErrorCodes().then((response) => {
              setErrors(response.data.errorCodes);
            });
          }}
        >
          Reload
        </Button>
      </Space>
      <Table
        dataSource={errors}
        columns={[
          {
            title: "Code",
            dataIndex: "code",
            key: "code",
            sorter: (a, b) => a.code - b.code,
          },
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
        ]}
        pagination={false}
      />
    </div>
  );
}
