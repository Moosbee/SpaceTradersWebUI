import { useParams } from "react-router-dom";

import { Button, Card, Col, Flex, Row, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { pruneSurveys } from "../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

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
import { selectShip, setShip } from "../../spaceTraderAPI/redux/fleetSlice";
import { selectSelectedShipSymbol } from "../../spaceTraderAPI/redux/mapSlice";

function ShipInfo() {
  const { shipID } = useParams();
  const dispatch = useAppDispatch();
  const selectedShip = useAppSelector(selectSelectedShipSymbol);
  const id = shipID === "selected" ? selectedShip : shipID;
  const ship = useAppSelector((state) => selectShip(state, id));

  console.log("ship", ship, shipID, selectedShip, id);

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
          <Col span={24}>
            <Flex wrap gap={8}>
              <Button>Ship Refine</Button>
              <Button>Scan Systems</Button>
              <Button>Scan Waypoints</Button>
              <Button>Scan Ships</Button>
              <Button>Install Mount</Button>
              <Button>Remove Mount</Button>
              <Button>Scrap Ship</Button>
              <Button>Repair Ship</Button>
            </Flex>
          </Col>
          <Col span={24}>
            <ShipControlCenter ship={ship} />
          </Col>
          <Col span={12} sm={24} md={12}>
            <ShipNavInfo ship={ship} />
          </Col>
          <Col span={12} sm={24} md={12}>
            <ShipCargoInfo ship={ship} />
          </Col>
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
        </Row>
      </Card>
    </div>
  );
}

export default ShipInfo;
