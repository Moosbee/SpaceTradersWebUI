import type { AutoCompleteProps, PaginationProps, SelectProps } from "antd";
import {
  AutoComplete,
  Card,
  Descriptions,
  Divider,
  Flex,
  Pagination,
  Select,
} from "antd";
import { selectSystems } from "../../spaceTraderAPI/redux/systemSlice";
import { useAppSelector } from "../../hooks";
import CachingSystemsCard from "../../features/cachingCard/CachingSystemsCard";
import { useMemo, useState } from "react";
import SystemDisp from "../../features/disp/SystemDisp";
import type { System } from "../../spaceTraderAPI/api";
import { Link } from "react-router-dom";

function Systems() {
  const unfilteredSystems: System[] = useAppSelector(selectSystems);

  const [searchType, setSearchType] = useState<string[]>([]);
  const [searchFaction, setSearchFaction] = useState<string[]>([]);
  const [searchSector, setSearchSector] = useState<string[]>([]);
  const [searchAutoComplete, setSearchAutoComplete] = useState("");
  const [sortType, setSortType] = useState<
    "sectorSymbol" | "symbol" | "type" | "waypoints"
  >("symbol");
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("ascend");

  const systems = useMemo(
    () =>
      unfilteredSystems
        .filter((system) => {
          const typeMatch =
            searchType.length === 0 || searchType.includes(system.type);
          const sectorMatch =
            searchSector.length === 0 ||
            searchSector.includes(system.sectorSymbol);
          const factionMatch =
            searchFaction.length === 0 ||
            system.factions.some((faction) =>
              searchFaction.includes(faction.symbol),
            );

          const autoCompleteMatch =
            searchAutoComplete === "" ||
            system.symbol
              .toLowerCase()
              .includes(searchAutoComplete.toLowerCase());

          return typeMatch && sectorMatch && factionMatch && autoCompleteMatch;
        })
        .sort((a, b) => {
          if (sortOrder === "ascend") {
            if (sortType === "waypoints") {
              return a.waypoints.length - b.waypoints.length;
            }
            return a[sortType].localeCompare(b[sortType]);
          } else {
            if (sortType === "waypoints") {
              return b.waypoints.length - a.waypoints.length;
            }
            return b[sortType].localeCompare(a[sortType]);
          }
        }),
    [
      searchAutoComplete,
      searchFaction,
      searchSector,
      searchType,
      sortOrder,
      sortType,
      unfilteredSystems,
    ],
  );

  const [systemsPage, setSystemsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const systemsPaging = useMemo(() => {
    return systems.slice(
      (systemsPage - 1) * itemsPerPage,
      systemsPage * itemsPerPage,
    );
  }, [itemsPerPage, systems, systemsPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setSystemsPage(page);
    setItemsPerPage(pageSize);
  };

  const onSortChange = (
    value: "sectorSymbol" | "symbol" | "type" | "waypoints",
  ) => {
    setSortType(value);
    setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
  };

  const options: {
    sectors: SelectProps["options"];
    type: SelectProps["options"];
    factions: SelectProps["options"];
  } = useMemo(() => {
    return {
      sectors: [...new Set(unfilteredSystems.map((w) => w.sectorSymbol))].map(
        (w) => ({
          value: w,
          label: w,
          key: w,
        }),
      ),
      type: [...new Set(unfilteredSystems.map((w) => w.type))].map((w) => ({
        value: w,
        label: w,
        key: w,
      })),
      factions: [
        ...new Set(
          unfilteredSystems.flatMap((w) => w.factions).map((w) => w.symbol),
        ),
      ].map((w) => ({
        value: w,
        label: w,
        key: w,
      })),
    };
  }, [unfilteredSystems]);

  const options_auto: {
    autoComplete: AutoCompleteProps["options"];
  } = useMemo(() => {
    return {
      autoComplete: systems.map((w) => ({
        key: w.symbol,
        value: w.symbol,
      })),
    };
  }, [systems]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <h2>All Systems</h2>
      <Link to={"/systems/current"}>Current</Link>
      <Flex justify="space-around" gap={8}>
        <Card style={{ width: "fit-content" }} title={"Search"}>
          <Descriptions
            column={2}
            items={[
              {
                key: "1",
                label: "Sector",
                children: (
                  <Select
                    mode="multiple"
                    placeholder="Please select"
                    onChange={setSearchSector}
                    style={{ width: 250 }}
                    options={options.sectors}
                  />
                ),
              },
              {
                key: "2",
                label: "Symbol",
                children: (
                  <AutoComplete
                    options={options_auto.autoComplete}
                    style={{ width: 250 }}
                    onSelect={setSearchAutoComplete}
                    onSearch={setSearchAutoComplete}
                    placeholder="Search for a system"
                  />
                ),
              },
              {
                key: "3",
                label: "Type",
                children: (
                  <Select
                    mode="multiple"
                    placeholder="Please select"
                    onChange={setSearchType}
                    style={{ width: 250 }}
                    options={options.type}
                  />
                ),
              },
              {
                key: "4",
                label: "Factions",
                children: (
                  <Select
                    mode="multiple"
                    placeholder="Please select"
                    onChange={setSearchFaction}
                    style={{ width: 250 }}
                    options={options.factions}
                  />
                ),
              },
              {
                key: "5",
                label: "Sort By",
                children: (
                  <Select
                    style={{ width: 250 }}
                    onChange={onSortChange}
                    placeholder="Please select sort key"
                    options={[
                      {
                        value: "symbol",
                        label: "Symbol",
                      },
                      {
                        value: "sectorSymbol",
                        label: "Sector Symbol",
                      },
                      {
                        value: "type",
                        label: "Type",
                      },
                      {
                        value: "waypoints",
                        label: "Waypoints",
                      },
                    ]}
                  />
                ),
              },
              {
                key: "6",
                label: "Order",
                children: (
                  <Select
                    style={{ width: 250 }}
                    onChange={setSortOrder}
                    placeholder="Please direction"
                    options={[
                      {
                        value: "ascend",
                        label: "Ascending",
                      },
                      {
                        value: "descend",
                        label: "Descending",
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </Card>
        <CachingSystemsCard />
      </Flex>
      <Divider></Divider>
      <Pagination
        current={systemsPage}
        onChange={onChange}
        total={systems.length}
        pageSizeOptions={[10, 25, 50, 75, 100]}
        pageSize={itemsPerPage}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {systemsPaging.map((value) => {
          return <SystemDisp key={value.symbol} system={value}></SystemDisp>;
        })}
      </Flex>
    </div>
  );
}

export default Systems;
