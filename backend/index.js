import { WebSocket, WebSocketServer } from "ws";
import express from "express";
import { uid } from "uid";
import cors from "cors";
import {
  gamesCheckInterval,
  heartbeatPingInterval,
  messageTypes,
} from "./constants.js";
import { portNumber, frontendUrl } from "./app.config.js";

let SEEKERS = [];
let GAMES = {};
let CLIENTS = {};

function heartbeat() {
  this.isAlive = true;
}

const seekOrCreate = (user) => {
  if (SEEKERS.length === 0) {
    SEEKERS.push(user);
    return null;
  } else {
    let opponent = SEEKERS.shift();

    while (
      !CLIENTS[opponent] ||
      CLIENTS[opponent].readyState !== WebSocket.OPEN
    ) {
      if (CLIENTS[opponent]) delete CLIENTS[opponent];
      if (SEEKERS.length === 0) {
        SEEKERS.push(user);
        return null;
      }
      opponent = SEEKERS.shift();
    }
    const newGame = {
      players: [user, opponent],
      isWhite: Math.random() > 0.5 ? user : opponent,
      gameState: "",
    };
    const gameId = uid();
    GAMES[gameId] = newGame;
    return {
      type: messageTypes.GAME_STARTED,
      message: { ...newGame, gameId, playerIf: "" },
    };
  }
};

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", function connection(ws) {
  ws.id = uid();
  ws.isAlive = true;
  CLIENTS[ws.id] = ws;
  console.log(ws.id, "connected.");
  console.log("Number of connected clients:", wss.clients.size);

  ws.on("message", function message(data) {
    console.log(ws.id, "sent message", JSON.parse(data));
    const msg = JSON.parse(data);
    const { type, message } = msg;

    if (type === messageTypes.SEEK_GAME) {
      let game = seekOrCreate(ws.id);

      if (game !== null) {
        const players = game.message.players;
        players.forEach((playerId) => {
          const player = CLIENTS[playerId];
          if (player.readyState === WebSocket.OPEN) {
            game.message.playerId = playerId;
            player.send(JSON.stringify(game), { binary: false });
          }
        });
      }
    }

    if (type === messageTypes.SEEK_TIMEOUT) {
      SEEKERS = SEEKERS.filter((seeker) => seeker !== ws.id);
    }

    if (type === messageTypes.MOVE) {
      const { gameId, gameDetails, playerId } = message;
      const gamePlayers = GAMES[gameId].players;
      GAMES[gameId].gameState = gameDetails;

      const opponentId = gamePlayers
        .filter((client) => client !== playerId)
        .pop();
      const opponentClient = CLIENTS[opponentId];

      if (opponentClient.readyState === WebSocket.OPEN) {
        opponentClient.send(data, { binary: false });
      }
    }
  });

  ws.on("pong", heartbeat);

  ws.on("error", console.error);

  /**
   * Ping for heartbeat
   */
  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        delete CLIENTS[ws.id];
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, heartbeatPingInterval);

  /**
   * Delete games where at least one player is inactive
   */
  const gameDeleteInterval = setInterval(() => {
    Object.keys(GAMES).forEach((game) => {
      for (const player of GAMES[game].players) {
        if (
          !CLIENTS[player] ||
          CLIENTS[player].readyState === WebSocket.CLOSED
        ) {
          delete GAMES[game];
          return;
        }
      }
    });
    console.log("Active games:", Object.keys(GAMES));
  }, gamesCheckInterval);

  wss.on("close", function close() {
    clearInterval(interval);
    clearInterval(gameDeleteInterval);
  });
});

const app = express();
app.use(
  cors({
    origin: frontendUrl.split(","),
  })
);
const server = app.listen(portNumber);
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

app.get("/game", (req, res) => {
  const game = Object.keys(GAMES).filter((id) => id === req.query.gameId);
  if (game.length > 0) {
    res.send(GAMES[game.pop()]);
  } else res.send({});
});
