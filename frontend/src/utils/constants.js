export const routes = {
  home: "/",
  game: "/game/:gameId",
};

export const messageTypes = {
  SEEK_GAME: "seek-game",
  SEEK_TIMEOUT: "seek-timeout",
  GAME_STARTED: "game-started",
  MOVE: "move",
};

export const chessPiecesUnicode = {
  w: {
    k: "\u2654",
    q: "\u2655",
    r: "\u2656",
    b: "\u2657",
    n: "\u2658",
    p: "\u2659",
  },
  b: {
    k: "\u265A",
    q: "\u265B",
    r: "\u265C",
    b: "\u265D",
    n: "\u265E",
    p: "\u265F",
  },
};
