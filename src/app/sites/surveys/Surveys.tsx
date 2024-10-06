import { Button, Flex, Select, Space } from "antd";
import SurveyDisp from "../../features/disp/SurveyDisp";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  pruneSurveys,
  selectSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";
import { useMemo, useState } from "react";

type sortByType = "creation" | "expiration" | "size" | "signature" | "waypoint";
type orderType = "asc" | "desc";

function Surveys() {
  const unfilteredSurveys = useAppSelector(selectSurveys);
  const dispatch = useAppDispatch();

  const [sortBy, setSortBy] = useState<sortByType>("creation");
  const [order, setOrder] = useState<orderType>("desc");

  const surveys = useMemo(() => {
    const sortedSurveys = unfilteredSurveys.toSorted((a, b) => {
      switch (sortBy) {
        case "creation":
          return 0;
        case "expiration":
          return (
            new Date(b.expiration).getTime() - new Date(a.expiration).getTime()
          );
        case "size":
          return b.deposits.length - a.deposits.length;
        case "signature":
          return b.signature.localeCompare(a.signature);
        case "waypoint":
          return b.symbol.localeCompare(a.symbol);
        default:
          return 0;
      }
    });
    if (order === "asc") {
      return sortedSurveys;
    } else {
      return sortedSurveys.toReversed();
    }
  }, [order, sortBy, unfilteredSurveys]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Surveys`} />

      <Flex justify="space-between">
        <h1>Surveys</h1>
        <Space>
          Sort by:
          <Select
            defaultValue="creation"
            style={{ width: 120 }}
            onChange={(value) => {
              setSortBy(value as sortByType);
            }}
            options={[
              { value: "size", label: "Size" },
              { value: "creation", label: "Creation" },
              { value: "expiration", label: "Expiration" },
              { value: "signature", label: "Signature" },
              { value: "waypoint", label: "Waypoints" },
            ]}
            value={sortBy}
          ></Select>
          <Select
            defaultValue="desc"
            style={{ width: 120 }}
            onChange={(value) => {
              setOrder(value as orderType);
            }}
            options={[
              { value: "desc", label: "Descending" },
              { value: "asc", label: "Ascending" },
            ]}
            value={order}
          ></Select>
        </Space>
        <Button
          onClick={() => {
            dispatch(pruneSurveys(Date.now()));
          }}
        >
          Prune Surveys
        </Button>
      </Flex>
      {surveys.length === 0 ? <p>No surveys</p> : null}
      <Flex wrap={true} style={{ gap: "20px" }}>
        {surveys.map((survey) => (
          <SurveyDisp key={survey.signature} survey={survey} />
        ))}
      </Flex>
    </div>
  );
}

export default Surveys;
