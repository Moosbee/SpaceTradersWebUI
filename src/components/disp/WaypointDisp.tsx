import { Card, Descriptions, DescriptionsProps, List, Tooltip } from "antd";
import { Waypoint } from "../../utils/api";
import { Link } from "react-router-dom";

function WaypointDisp({
  waypoint,
  moreInfo,
}: {
  waypoint: Waypoint;
  moreInfo?: boolean;
}) {
  const items: DescriptionsProps["items"] = [];

  items.push({
    key: "symbol",
    label: "Symbol",
    children: <p>{waypoint.symbol}</p>,
  });

  items.push({
    key: "System-Symbol",
    label: "systemSymbol",
    children: <p>{waypoint.systemSymbol}</p>,
  });

  if (waypoint.isUnderConstruction) {
    items.push({
      key: "isUnderConstruction",
      label: "Under Construction",
      children: <p>{waypoint.isUnderConstruction ? "Yes" : "No"}</p>,
    });
  }

  items.push({
    key: "type",
    label: "Type",
    children: <p>{waypoint.type}</p>,
  });

  items.push({
    key: "coordinates",
    label: "Coordinates",
    children: (
      <p>
        X: {waypoint.x} Y: {waypoint.y}
      </p>
    ),
  });
  if (waypoint.faction) {
    items.push({
      key: "faction",
      label: "Faction",
      children: <p>{waypoint.faction?.symbol}</p>,
    });
  }

  if (waypoint.chart) {
    items.push({
      key: "chart",
      label: "Chart",
      children: (
        <p>
          By: {waypoint.chart?.submittedBy} <br />
          On:{" "}
          {new Date(
            waypoint.chart?.submittedOn ? waypoint.chart?.submittedOn : 0
          ).toLocaleDateString()}
          <br /> {waypoint.chart?.waypointSymbol}
        </p>
      ),
    });
  }

  if (waypoint.orbits) {
    items.push({
      key: "orbits",
      label: "Orbits",
      children: (
        <Link to={`/system/${waypoint.systemSymbol}/${waypoint.orbits}`}>
          {waypoint.orbits}
        </Link>
      ),
    });
  }

  if (moreInfo) {
    items.push({
      key: "orbitals",
      label: "Orbitals",
      children: (
        <List
          size="small"
          dataSource={waypoint.orbitals.map((orbitals) => (
            <Link to={`/system/${waypoint.systemSymbol}/${orbitals.symbol}`}>
              {orbitals.symbol}
            </Link>
          ))}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        ></List>
      ),
    });
  } else {
    items.push({
      key: "orbitals",
      label: "Orbitals",
      children: <p>{waypoint.orbitals.length}</p>,
    });
  }

  if (waypoint.modifiers && waypoint.modifiers.length > 0) {
    items.push({
      key: "modifiers",
      label: "Modifiers",
      children: (
        <List
          size="small"
          dataSource={waypoint.modifiers?.map((modifier) => (
            <Tooltip
              key={modifier.symbol}
              title={`${modifier.symbol} - ${modifier.description}`}
            >
              <span>{modifier.name}</span>
            </Tooltip>
          ))}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        ></List>
      ),
    });
  }

  items.push({
    key: "traits",
    label: "Traits",
    children: (
      <List
        size="small"
        dataSource={waypoint.traits.map((trait) => (
          <Tooltip
            key={trait.symbol}
            title={`${trait.symbol} - ${trait.description}`}
          >
            <span>{trait.name}</span>
          </Tooltip>
        ))}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      ></List>
    ),
  });

  return (
    <Card
      style={{ width: "fit-content" }}
      title="Waypoint Info"
      extra={
        <Link to={`/system/${waypoint.systemSymbol}/${waypoint.symbol}`}>
          More
        </Link>
      }
    >
      <Descriptions
        bordered
        items={items}
        layout={moreInfo ? "horizontal" : "vertical"}
      />
    </Card>
  );
}

export default WaypointDisp;
