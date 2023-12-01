import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChessGame } from "./pages/ChessGame";
import { SeekGame } from "./pages/SeekGame";
import { WebSocketContextProvider } from "./context/WebSocketContext";
import { routes } from "./utils/constants";

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <SeekGame />,
  },
  {
    path: `${routes.game}`,
    element: <ChessGame />,
  },
]);

export const Main = () => (
  <WebSocketContextProvider>
    <RouterProvider router={router} />
  </WebSocketContextProvider>
);
