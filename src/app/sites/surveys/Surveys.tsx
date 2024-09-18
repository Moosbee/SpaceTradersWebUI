import { Button, Flex } from "antd";
import SurveyDisp from "../../features/disp/SurveyDisp";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  pruneSurveys,
  selectSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";
import PageTitle from "../../features/PageTitle";

function Surveys() {
  const surveys = useAppSelector(selectSurveys);
  const dispatch = useAppDispatch();

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Surveys`} />

      <Flex justify="space-between">
        <h1>Surveys</h1>
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
