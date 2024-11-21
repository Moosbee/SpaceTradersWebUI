import { Button, Popconfirm, Space } from "antd";
import CachingContractsCard from "../../features/cachingCard/CachingContractsCard";
import CachingFleetCard from "../../features/cachingCard/CachingFleetCard";
import CachingSystemsCard from "../../features/cachingCard/CachingSystemsCard";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { clearContracts } from "../../spaceTraderAPI/redux/contractSlice";
import { clearShips } from "../../spaceTraderAPI/redux/fleetSlice";

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
        <Popconfirm
          title="Do you want to Reset the App?"
          description={
            <span>
              Please make sure all other tabs are closed!
              <br /> So that this is the only open Tap here.
              <br /> This will delete all data from IndexedDB and reload the
              application.
            </span>
          }
          onConfirm={() => {
            indexedDB.deleteDatabase("myApp");
            window.location.reload();
          }}
          okText="OK"
          cancelText="No"
        >
          <Button danger>Clear Everything</Button>
        </Popconfirm>
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
