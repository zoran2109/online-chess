import { backendWsUrl, backendUrl } from "../app.config";

export const getWsUrl = () => backendWsUrl;

export const getGameUrl = (gameId) => `${backendUrl}/game?gameId=${gameId}`;
