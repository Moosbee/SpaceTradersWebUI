import { Button, Col, Row, Space, Table } from "antd";
import { Link } from "react-router-dom";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { TradeSymbol } from "../../spaceTraderAPI/api";
import {
  selectSupplyChain,
  setSupplyChain,
} from "../../spaceTraderAPI/redux/dataSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

export default function SupplyChain() {
  const supplyChain = useAppSelector(selectSupplyChain);
  const dispatch = useAppDispatch();

  const exports = Object.values(TradeSymbol).map((symbol) => {
    let imports = Object.keys(supplyChain).filter((key) =>
      supplyChain[key].includes(symbol),
    );

    return {
      symbol,
      usedBy: imports,
    };
  });

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Supply Chain`} />
      <Space>
        <h1>Supply Chain ({Object.keys(supplyChain).length})</h1>
        <Button
          onClick={() => {
            spaceTraderClient.DataClient.getSupplyChain().then((response) => {
              // setSupplyChain(response.data.data.exportToImportMap);
              dispatch(setSupplyChain(response.data.data.exportToImportMap));
            });
          }}
        >
          Reload
        </Button>
      </Space>
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <h2>Exports to Imports</h2>
          <Table
            columns={[
              {
                title: "Import",
                dataIndex: "import",
                key: "import",
                render: (value: string[]) => (
                  <ul>
                    {value.map((v) => (
                      <li>
                        <Link to={`/supplyChain/${v}`}>{v}</Link>
                      </li>
                    ))}
                  </ul>
                ),
                sorter: (a, b) => a.import.length - b.import.length,
                filters: Object.values(TradeSymbol).map((symbol) => ({
                  text: symbol,
                  value: symbol,
                })),
                onFilter(value, record) {
                  return record.import.includes(value as TradeSymbol);
                },
              },
              {
                title: "Export",
                dataIndex: "export",
                key: "export",
                sorter: (a, b) => a.export.localeCompare(b.export),
                filters: Object.values(TradeSymbol).map((value) => ({
                  text: value,
                  value,
                })),
                onFilter(value, record) {
                  return record.export === value;
                },
                render: (value) => (
                  <Link to={`/supplyChain/${value}`}>{value}</Link>
                ),
              },
            ]}
            dataSource={Object.keys(supplyChain).map((key) => ({
              export: key,
              import: supplyChain[key],
            }))}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100", "200", "500", "1000"],
              defaultPageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
            }}
          />
        </Col>
        <Col span={12}>
          <h2>Imports to Exports</h2>

          <Table
            columns={[
              {
                title: "Symbol",
                dataIndex: "symbol",
                key: "symbol",
                sorter: (a, b) => a.symbol.localeCompare(b.symbol),
                filters: Object.values(TradeSymbol).map((value) => ({
                  text: value,
                  value,
                })),
                onFilter(value, record) {
                  return record.symbol === value;
                },
                render: (value) => (
                  <Link to={`/supplyChain/${value}`}>{value}</Link>
                ),
              },
              {
                title: "Used By",
                dataIndex: "usedBy",
                key: "usedBy",
                render: (value: string[]) => (
                  <ul>
                    {value.map((v) => (
                      <li>
                        <Link to={`/supplyChain/${v}`}>{v}</Link>
                      </li>
                    ))}
                  </ul>
                ),
                sorter: (a, b) => a.usedBy.length - b.usedBy.length,
                filters: Object.values(TradeSymbol).map((symbol) => ({
                  text: symbol,
                  value: symbol,
                })),
                onFilter(value, record) {
                  return record.usedBy.includes(value as TradeSymbol);
                },
              },
            ]}
            dataSource={exports}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100", "200", "500", "1000"],
              defaultPageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
            }}
          />
        </Col>
      </Row>
    </div>
  );
}
