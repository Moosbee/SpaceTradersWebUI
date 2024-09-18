import { Card, Descriptions, Statistic } from "antd";
import type { Survey } from "../../spaceTraderAPI/api";

const { Countdown } = Statistic;

function SurveyDisp({ survey }: { survey: Survey }) {
  const items = [
    {
      key: "1",
      label: "Signature",
      children: <p>{survey.signature}</p>,
    },

    {
      key: "2",
      label: "Expiration",
      children: (
        <p>
          {new Date(survey.expiration).toLocaleString()}{" "}
          <Countdown value={new Date(survey.expiration).getTime()}></Countdown>
        </p>
      ),
    },

    {
      key: "3",
      label: "Size",
      children: <p>{survey.size}</p>,
    },

    {
      key: "4",
      label: "Waypoint",
      children: <p>{survey.symbol}</p>,
    },

    {
      key: "5",
      label: "Deposits",
      children: (
        <span>
          {survey.deposits.map((d) => (
            <p>{d.symbol}</p>
          ))}
        </span>
      ),
    },
  ];
  return (
    <div>
      <Card title="Survey">
        <Descriptions bordered items={items} layout="vertical" />{" "}
      </Card>
    </div>
  );
}

export default SurveyDisp;
