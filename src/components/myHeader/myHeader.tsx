import { Menu } from "antd";
import { Link } from "react-router-dom";

const items = [
  { label: <Link to="/">Spacetraders API</Link>, key: "home" },
  { label: <Link to="/agents">Agents Overview</Link>, key: "agents" },
  { label: <Link to="/fleet">Fleet Overview</Link>, key: "fleet" },
  { label: <Link to="/systems">Systems Overview</Link>, key: "systems" },
  { label: <Link to="/factions">Factions Overview</Link>, key: "factions" },
  { label: <Link to="/contracts">Contracts overview</Link>, key: "contracts" },
  { label: <Link to="/newAgent">New Agent</Link>, key: "newAgent" },
];

function MyHeader() {
  return <Menu theme="dark" mode="horizontal" items={items}></Menu>;
}

export default MyHeader;
