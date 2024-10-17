import { useAppDispatch, useAppSelector } from "../../hooks";
import type {
  MarketTradeGoodTypeEnum,
  ShipType,
  TradeSymbol,
  WaypointTraitSymbol,
  WaypointType,
} from "../../spaceTraderAPI/api";
import {
  selectMarketItems,
  selectMarketItemTypes,
  selectOnlyInterestingMarket,
  selectSearchAutoComplete,
  selectSearchTraits,
  selectSearchType,
  selectShipTypes,
  setMarketItems,
  setMarketItemTypes,
  setOnlyInterestingMarket,
  setSearchAutoComplete,
  setSearchTraits,
  setSearchType,
  setShipTypes,
} from "../../spaceTraderAPI/redux/mapSlice";
import { selectSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import FilterCard from "./FilterCard";

function MapFilterCard({ systemID }: { systemID: string }) {
  const dispatch = useAppDispatch();

  const searchType = useAppSelector(selectSearchType);
  const searchTraits = useAppSelector(selectSearchTraits);
  const searchAutoComplete = useAppSelector(selectSearchAutoComplete);
  const marketItems = useAppSelector(selectMarketItems);
  const marketItemTypes = useAppSelector(selectMarketItemTypes);
  const shipTypes = useAppSelector(selectShipTypes);
  const onlyInterestingMarket = useAppSelector(selectOnlyInterestingMarket);

  const setOnlyInterestingMarketFunc = (value: boolean) => {
    dispatch(setOnlyInterestingMarket({ value }));
  };
  const setSearchTypeFunc = (value: WaypointType[]) => {
    dispatch(setSearchType({ value }));
  };
  const setSearchTraitsFunc = (value: WaypointTraitSymbol[]) => {
    dispatch(setSearchTraits({ value }));
  };
  const setSearchAutoCompleteFunc = (value: string) => {
    dispatch(setSearchAutoComplete({ value }));
  };
  const setMarketItemsFunc = (value: TradeSymbol[]) => {
    dispatch(setMarketItems({ value }));
  };
  const setMarketItemTypesFunc = (value: MarketTradeGoodTypeEnum[]) => {
    dispatch(setMarketItemTypes({ value }));
  };
  const setShipTypesFunc = (value: ShipType[]) => {
    dispatch(setShipTypes({ value }));
  };

  const unfilteredWaypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemID!),
  );

  return (
    <FilterCard
      waypoints={Object.keys(unfilteredWaypoints).map((key) => key)}
      searchType={searchType}
      searchTraits={searchTraits}
      searchAutoComplete={searchAutoComplete}
      marketItems={marketItems}
      marketItemTypes={marketItemTypes}
      shipTypes={shipTypes}
      onlyInterestingMarket={onlyInterestingMarket}
      setSearchType={setSearchTypeFunc}
      setSearchTraits={setSearchTraitsFunc}
      setSearchAutoComplete={setSearchAutoCompleteFunc}
      setMarketItems={setMarketItemsFunc}
      setMarketItemTypes={setMarketItemTypesFunc}
      setShipTypes={setShipTypesFunc}
      setOnlyInterestingMarket={setOnlyInterestingMarketFunc}
    />
  );
}

export default MapFilterCard;
