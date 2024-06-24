import { Card, Flex, Button, Spin, Progress } from "antd";
import { PauseOutlined } from "@ant-design/icons";

const CachingCard = ({
  progress,
  loading,
  isPaused,
  total,
  remainingTimeString,
  title,
  startFetching,
  pauseFetching,
  continueFetching,
  cancelFetching,
  clearSystems,
}: {
  progress: number;
  loading: boolean;
  isPaused: boolean;
  total: number;
  remainingTimeString: string;
  title: string;
  startFetching: () => void;
  pauseFetching: () => void;
  continueFetching: () => void;
  cancelFetching: () => void;
  clearSystems: () => void;
}) => {
  return (
    <Card style={{ width: "fit-content", textAlign: "center" }} title={title}>
      <Flex vertical gap={8}>
        <Flex align="center" justify="center" gap={8}>
          {loading ? null : <Button onClick={startFetching}>Update</Button>}
          {!(loading && !isPaused) ? null : (
            <Button onClick={pauseFetching}>Pause</Button>
          )}
          {!(loading && isPaused) ? null : (
            <Button onClick={continueFetching}>Continue</Button>
          )}
          <Spin spinning={loading}></Spin>
          {!loading ? null : <Button onClick={cancelFetching}>Cancel</Button>}
          {loading ? null : <Button onClick={clearSystems}>Clear</Button>}
        </Flex>
        <br />
        {!isPaused && (
          <Progress
            percent={Math.round((progress / total) * 1000) / 10}
            type="circle"
          />
        )}
        {isPaused && (
          <Progress
            percent={Math.round((progress / total) * 1000) / 10}
            type="circle"
            format={() => <PauseOutlined spin />}
          />
        )}
        <span>
          Cached Items: {progress}/{total}
        </span>
        <span>Time Remaining: {remainingTimeString}</span>
      </Flex>
    </Card>
  );
};

export default CachingCard;
