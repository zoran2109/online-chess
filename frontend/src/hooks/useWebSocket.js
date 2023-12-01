import { useContext } from "react";
import { WebSocketContext } from "../context/WebSocketContext";

export const useWebSocket = () => {
  const [isReady, data, send] = useContext(WebSocketContext);

  const sendMessage = (type, message = {}) => {
    if (isReady) send(JSON.stringify({ type, message }));
  };

  return [isReady, data, sendMessage];
};
