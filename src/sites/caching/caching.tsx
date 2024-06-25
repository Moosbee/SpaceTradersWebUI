import { Space } from "antd";
import CachingContractsCard from "../../features/cachingCard/CachingContractsCard";
import CachingFleetCard from "../../features/cachingCard/CachingFleetCard";
import CachingSystemsCard from "../../features/cachingCard/CachingSystemsCard";

function Caching() {
  return (
    <div style={{ padding: "24px 24px" }}>
      <h1>Caching</h1>
      <Space>
        <CachingSystemsCard />
        <CachingContractsCard />
        <CachingFleetCard />
      </Space>
    </div>
  );
}

export default Caching;
