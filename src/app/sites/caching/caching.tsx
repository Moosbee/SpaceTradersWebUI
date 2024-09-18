import { Button, Space } from "antd";
import CachingContractsCard from "../../features/cachingCard/CachingContractsCard";
import CachingFleetCard from "../../features/cachingCard/CachingFleetCard";
import CachingSystemsCard from "../../features/cachingCard/CachingSystemsCard";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { clearContracts } from "../../spaceTraderAPI/redux/contractSlice";
import { clearShips } from "../../spaceTraderAPI/redux/fleetSlice";
import PageTitle from "../../features/PageTitle";

function Caching() {
  const dispatch = useAppDispatch();
  const myAgentSymbol = useAppSelector(selectAgentSymbol);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Caching Menu`} />
      <h1>Caching</h1>
      <Space>
        <Button
          onClick={() => {
            dispatch(clearContracts());
          }}
        >
          Clear ALL Contracts
        </Button>
        <Button
          onClick={() => {
            dispatch(clearShips());
          }}
        >
          Clear ALL Fleets
        </Button>
      </Space>
      <h2>{myAgentSymbol}</h2>
      <Space>
        <CachingSystemsCard />
        <CachingContractsCard />
        <CachingFleetCard />
      </Space>
    </div>
  );
}

export default Caching;
