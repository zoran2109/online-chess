const isProd = process.env.NODE_ENV === "production";

export const backendUrl = isProd
  ? process.env.REACT_APP_BACKEND_URL
  : "http://127.0.0.1:8080";

export const backendWsUrl = isProd
  ? process.env.REACT_APP_BACKEND_WS_URL
  : "ws://127.0.0.1:8080";
