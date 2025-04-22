import { useParams } from "react-router-dom";

import { Button, Card, Col, Divider, Flex, Row, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { pruneSurveys } from "../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

import { useState } from "react";
import ShipAutomation from "../../features/automation/ShipAutomation";
import PageTitle from "../../features/PageTitle";
import ShipCargoInfo from "../../features/Shipinfo/ShipCargoInfo";
import ShipControlCenter from "../../features/Shipinfo/ShipControlCenter";
import ShipEngineInfo from "../../features/Shipinfo/ShipEngineInfo";
import ShipFrameInfo from "../../features/Shipinfo/ShipFrameInfo";
import ShipGeneralInfo from "../../features/Shipinfo/ShipGeneralInfo";
import ShipModuleInfo from "../../features/Shipinfo/ShipModuleInfo";
import ShipMountInfo from "../../features/Shipinfo/ShipMountInfo";
import ShipNavInfo from "../../features/Shipinfo/ShipNavInfo";
import ShipReactorInfo from "../../features/Shipinfo/ShipReactorInfo";
import { ShipRequirements } from "../../features/Shipinfo/ShipRequirements";
import { selectShip, setShip } from "../../spaceTraderAPI/redux/fleetSlice";
import { selectSelectedShipSymbol } from "../../spaceTraderAPI/redux/mapSlice";

function ShipInfo() {
  const { shipID } = useParams();
  const dispatch = useAppDispatch();
  const selectedShip = useAppSelector(selectSelectedShipSymbol);
  const id = shipID === "selected" ? selectedShip : shipID;
  const ship = useAppSelector((state) => selectShip(state, id));
  const [automation, setAutomation] = useState(false);

  if (!ship) return <Spin spinning={true}></Spin>;

  return (
    <div>
      <PageTitle title={`${ship.symbol} Info`} />
      <Card
        style={{ width: "fit-content" }}
        title={`Ship ${ship.symbol}`}
        extra={
          <Button
            onClick={() => {
              if (!shipID) return;
              spaceTraderClient.FleetClient.getMyShip(shipID).then(
                (response) => {
                  dispatch(setShip(response.data.data));

                  dispatch(pruneSurveys(Date.now()));
                },
              );
            }}
          >
            Reload
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ width: "100%" }}>
          <Col span={24}>
            <ShipGeneralInfo ship={ship} />
          </Col>
          {/* <Col span={24}>
            <Flex wrap gap={8}>

            </Flex>
          </Col> */}
          <Col span={24} sm={24} md={11}>
            <ShipControlCenter ship={ship} />
          </Col>
          <Col span={24} sm={24} md={13}>
            <Card
              title="Automation"
              extra={
                <Button onClick={() => setAutomation(!automation)}>
                  Automation
                </Button>
              }
            >
              {automation && <ShipAutomation ship={ship} />}
            </Card>
          </Col>
          <Col span={12} sm={24} md={8}>
            <ShipNavInfo ship={ship} />
          </Col>
          <Col span={12} sm={24} md={16}>
            <ShipCargoInfo ship={ship} />
          </Col>
          <Divider></Divider>
          <Col span={12} sm={24} md={12}>
            <ShipFrameInfo ship={ship} />
          </Col>
          <Col span={12} sm={24} md={12}>
            <ShipEngineInfo ship={ship} />
          </Col>
          <Col span={12} sm={24} md={12}>
            <ShipFrameInfo ship={ship} />
          </Col>
          <Col span={12} sm={24} md={12}>
            <ShipReactorInfo ship={ship} />
          </Col>
          <Col span={12} sm={24} md={12}>
            <Flex wrap>
              {ship.mounts.map((value) => (
                <ShipMountInfo key={value.symbol} value={value} ship={ship} />
              ))}
            </Flex>
          </Col>
          <Col span={12} sm={24} md={12}>
            <Flex wrap>
              {ship.modules.map((value, index) => (
                <ShipModuleInfo key={index} value={value} ship={ship} />
              ))}
            </Flex>
          </Col>
          <Col span={12} sm={24} md={24}>
            <ShipRequirements ship={ship} />
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ShipInfo;
