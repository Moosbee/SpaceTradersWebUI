import { Menu } from "antd";
import { Link } from "react-router-dom";

const items = [
  { label: <Link to="/">Spacetraders API</Link>, key: "home" },
  { label: <Link to="/agents">Agents Overview</Link>, key: "agents" },
  { label: <Link to="/fleet">Fleet Overview</Link>, key: "fleet" },
  {
    label: "Systems",
    key: "systems",
    children: [
      {
        label: <Link to="/systems">Systems Overview</Link>,
        key: "systemsOverview",
      },
    ],
  },
  { label: <Link to="/factions">Factions Overview</Link>, key: "factions" },
  { label: <Link to="/contracts">Contracts overview</Link>, key: "contracts" },
  { label: <Link to="/newAgent">New Agent</Link>, key: "newAgent" },
];

function MySider() {
  return (
    <Menu
      mode="inline"
      items={items}
      style={{
        width: 250,
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
      }}
    ></Menu>
  );
}

export default MySider;
