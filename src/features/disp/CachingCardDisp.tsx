import { Button, Card, Flex, Progress, Space, Spin } from "antd";

const CachingCardDisp = ({
  title,
  totalItemsCount,
  loading,
  onUpdate,
  onClear,
  cachedItemsCount,
  remainingTime,
}: {
  title: string;
  totalItemsCount: number;
  loading: boolean;
  onUpdate: VoidFunction;
  onClear: VoidFunction;
  cachedItemsCount: number;
  remainingTime: string;
}) => (
  <Card style={{ width: "fit-content", textAlign: "center" }} title={title}>
    <Flex vertical gap={8}>
      <Space>
        <Button onClick={onUpdate}>Update</Button>
        <Spin spinning={loading}></Spin>
        <Button onClick={onClear}>Clear</Button>
      </Space>
      <br />
      <Progress
        percent={Math.round((cachedItemsCount / totalItemsCount) * 1000) / 10}
        type="circle"
      />
      <span>
        Cached Items: {cachedItemsCount}/{totalItemsCount}
      </span>
      <span>Time Remaining: {remainingTime}</span>
    </Flex>
  </Card>
);

export default CachingCardDisp;
