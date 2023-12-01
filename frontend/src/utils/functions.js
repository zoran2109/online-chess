import { chessPiecesUnicode } from "../utils/constants";

export const myTurn = (game, playerColor) => game.turn() === playerColor;

export const getCapturedPieces = (game, color) => {
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  console.log(game.history({ verbose: true }));
  for (const move of game.history({ verbose: true })) {
    if (move.hasOwnProperty("captured") && move.color !== color) {
      captured[move.captured]++;
    }
  }

  return captured;
};

export const createCapturedPieces = (color, capturedPieceObj = {}) => {
  const captured = Object.keys(capturedPieceObj).map(
    (piece) =>
      chessPiecesUnicode[color][piece].repeat(capturedPieceObj[piece]) || null
  );
  return captured.join("");
};

export const getGameState = (game) => {
  const sideToMove = game.turn() === "w" ? "White" : "Black";
  if (game.isInsufficientMaterial())
    return "The game is draw due to insufficient material.";
  if (game.isStalemate()) return "The game is draw due to stalemate.";
  if (game.isThreefoldRepetition())
    return "The game is draw due to threefold repetition.";
  if (game.isDraw()) return "The game is draw.";
  if (game.isCheckmate()) return `${sideToMove} is checkmated.`;
  if (game.inCheck()) return `${sideToMove} is in check.`;
  return `${sideToMove} to move.`;
};
