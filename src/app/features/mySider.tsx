import {
  AppstoreOutlined,
  AuditOutlined,
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
import { Link } from "react-router-dom";
import type { AntSiderSider } from "../../MyApp";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  selectSiderCollapsed,
  setSiderCollapsed,
} from "../spaceTraderAPI/redux/configSlice";
import FaIcon from "./FontAwsome/FaIcon";

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
        label: <Link to="/agents">Agents</Link>,
        key: "agents",
        icon: <ContactsOutlined />,
      },
      {
        label: <Link to="/fleet">Fleet</Link>,
        key: "fleet",
        icon: <RocketOutlined />,
      },
      {
        label: <Link to="/systems">Systems</Link>,
        key: "systems",
        icon: <GlobalOutlined />,
      },
      {
        label: <Link to="/factions">Factions</Link>,
        key: "factions",
        icon: <TeamOutlined />,
      },
      {
        label: <Link to="/contracts">Contracts</Link>,
        key: "contracts",
        icon: <FileTextOutlined />,
      },
      {
        label: <Link to="/surveys">Surveys</Link>,
        key: "surveys",
        icon: <AuditOutlined />,
      },
      {
        label: <Link to="/transactions/market">Market Transactions</Link>,
        key: "transactions/market",
        icon: <DeliveredProcedureOutlined />,
      },
    ],
  },
  {
    key: "maps",
    label: "Maps",
    icon: <FaIcon type="solid" icon="fa-map" />,
    children: [
      {
        label: <Link to="/system/wpConfig">Wp Map Config</Link>,
        key: "map",
        icon: <FaIcon type="solid" icon="fa-location-dot" />,
      },
      {
        label: <Link to="/fleet/selected">Selected Ship</Link>,
        key: "fleet/selected",
        icon: <RocketOutlined />,
      },
      {
        label: <Link to="/system/selected">Selected System</Link>,
        key: "system/selected",
        icon: <GlobalOutlined />,
      },
      {
        label: <Link to="/system/selected/selected">Selected Waypoint</Link>,
        key: "system/selected/selected",
        icon: <GlobalOutlined />,
      },
    ],
  },

  {
    key: "automation",
    label: "Automation",
    icon: <FaIcon type="solid" icon="fa-robot" />,
    children: [
      {
        label: <Link to="/automation/editor">Automation Editor</Link>,
        key: "automation/editor",
        icon: <FaIcon type="solid" icon="fa-user-robot" />,
      },
      {
        label: <Link to="/automation">Automations</Link>,
        key: "automations",
        icon: <FaIcon type="solid" icon="fa-robot" />,
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
  // const [collapsed, setCollapsed] = useState(false);

  const collapsed = useAppSelector(selectSiderCollapsed);
  const dispatch = useAppDispatch();

  return (
    <Slider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => dispatch(setSiderCollapsed(value))}
      theme="light"
      width={220}
    >
      <Menu mode="inline" items={items}></Menu>
    </Slider>
  );
}

export default MySider;
