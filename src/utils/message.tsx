import { useEffect } from "react";

import { message } from "antd";
import { MESSAGE_EVENT_NAME } from "./antdMessage";

const Message = (props: {}) => {
  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    const bindEvent = (e: CustomEvent | any) => {
      const func = e?.detail?.type || "info";
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { content, duration, onClose } = e.detail?.params;
      // @ts-ignore
      api[func](content, duration, onClose);
    };

    window.addEventListener(MESSAGE_EVENT_NAME, bindEvent);

    return () => {
      window.removeEventListener(MESSAGE_EVENT_NAME, bindEvent);
    };
  }, [api]);

  return <>{contextHolder}</>;
};

export default Message;
