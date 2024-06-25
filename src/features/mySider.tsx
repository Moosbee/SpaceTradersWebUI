import {
  AppstoreOutlined,
  ContactsOutlined,
  DeliveredProcedureOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeOutlined,
  PlusOutlined,
  RocketOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { AntSiderSider } from "../MyApp";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    label: <Link to="/">Spacetraders API</Link>,
    key: "home",
    icon: <HomeOutlined />,
  },
  {
    label: "Overview",
    key: "Overview",
    icon: <AppstoreOutlined />,
    children: [
      {
        label: <Link to="/agents">Agents Overview</Link>,
        key: "agents",
        icon: <ContactsOutlined />,
      },
      {
        label: <Link to="/fleet">Fleet Overview</Link>,
        key: "fleet",
        icon: <RocketOutlined />,
      },
      {
        label: <Link to="/systems">Systems Overview</Link>,
        key: "systems",
        icon: <GlobalOutlined />,
      },
      {
        label: <Link to="/factions">Factions Overview</Link>,
        key: "factions",
        icon: <TeamOutlined />,
      },
      {
        label: <Link to="/contracts">Contracts overview</Link>,
        key: "contracts",
        icon: <FileTextOutlined />,
      },
    ],
  },

  {
    label: <Link to="/newAgent">New Agent</Link>,
    key: "newAgent",
    icon: <PlusOutlined />,
  },
  {
    label: <Link to="/cache">Cache Config</Link>,
    key: "cache",
    icon: <DeliveredProcedureOutlined />,
  },
];

function MySider({ Slider }: { Slider: typeof AntSiderSider }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Slider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="light"
      width={220}
    >
      <Menu mode="inline" items={items}></Menu>
    </Slider>
  );
}

export default MySider;
