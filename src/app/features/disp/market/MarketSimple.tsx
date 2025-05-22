import { Card, Col, List, Row, Tooltip } from "antd";
import { Link } from "react-router-dom";
import type { TradeGood } from "../../../spaceTraderAPI/api";

function MarketSimple({
  exchange,
  exports,
  imports,
}: {
  exports: Array<TradeGood>;
  imports: Array<TradeGood>;
  exchange: Array<TradeGood>;
}) {
  return (
    <Row justify="space-evenly" gutter={[8, 8]}>
      <Col span={8}>
        <Card title="Exchanges" size="small">
          <List
            size="small"
            bordered
            dataSource={exchange.map((ext) => (
              <Tooltip
                key={ext.symbol}
                title={`${ext.name} - ${ext.description}`}
              >
                <Link to={`/supplyChain/${ext.symbol}`}>{ext.symbol}</Link>
              </Tooltip>
            ))}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Exports" size="small">
          <List
            size="small"
            bordered
            dataSource={exports.map((expo) => (
              <Tooltip
                key={expo.symbol}
                title={`${expo.name} - ${expo.description}`}
              >
                <Link to={`/supplyChain/${expo.symbol}`}>{expo.symbol}</Link>
              </Tooltip>
            ))}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Imports" size="small">
          <List
            size="small"
            bordered
            dataSource={imports.map((imp) => (
              <Tooltip
                key={imp.symbol}
                title={`${imp.name} - ${imp.description}`}
              >
                <Link to={`/supplyChain/${imp.symbol}`}>{imp.symbol}</Link>
              </Tooltip>
            ))}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default MarketSimple;
