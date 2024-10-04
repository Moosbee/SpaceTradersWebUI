import { Button, Flex, Select, Space } from "antd";
import SurveyDisp from "../../features/disp/SurveyDisp";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  pruneSurveys,
  selectSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";

function Surveys() {
  const surveys = useAppSelector(selectSurveys);
  const dispatch = useAppDispatch();

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
            onChange={(value) => {}}
            options={[
              { value: "size", label: "Size" },
              { value: "creation", label: "Creation" },
              { value: "expiration", label: "Expiration" },
              { value: "signature", label: "Signature" },
              { value: "deposits", label: "Deposits" },
            ]}
          ></Select>
          <Select
            defaultValue="desc"
            style={{ width: 120 }}
            onChange={(value) => {}}
            options={[
              { value: "desc", label: "Descending" },
              { value: "asc", label: "Ascending" },
            ]}
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
