import React, { createContext, useEffect, useRef, useState } from "react";
import { getWsUrl } from "../utils/endpoint-urls";

export const WebSocketContext = createContext();

export const WebSocketContextProvider = ({ children }) => {
  const ws = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(getWsUrl());

    socket.onopen = () => setIsReady(true);
    socket.onclose = () => setIsReady(false);
    socket.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    ws.current = socket;

    return () => socket.close();
  }, []);

  return (
    <WebSocketContext.Provider
      value={[isReady, data, ws.current?.send.bind(ws.current)]}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
