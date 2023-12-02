import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useWebSocket } from "../hooks/useWebSocket";
import { useFetch } from "../hooks/useFetch";
import { messageTypes } from "../utils/constants";
import { getGameUrl } from "../utils/endpoint-urls";
import { ChessGameLayout } from "../components/ChessGameLayout";
import {
  myTurn,
  getCapturedPieces,
  createCapturedPieces,
  getGameState,
} from "../utils/functions";

const game = new Chess();

/* TODO
Promotion logic
Resign button
*/

export const ChessGame = () => {
  const [position, setPosition] = useState(game.fen());
  const [capturedPieces, setCapturedPieces] = useState({});
  const { gameId } = useParams();
  const [, data, send] = useWebSocket();
  const { data: gameDetails, isLoading } = useFetch(getGameUrl(gameId));
  const [gameState, setGameState] = useState(getGameState(game));

  // State for moving pieces on-click
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState(null);
  const [optionSquares, setOptionSquares] = useState({});

  const playerId = sessionStorage.getItem("playerId");
  const opponentId = gameDetails?.players
    .filter((player) => player !== playerId)
    .pop();
  const playerColor = gameDetails?.isWhite === playerId ? "w" : "b";

  const updateGameState = useCallback(() => {
    setPosition(game.fen());
    setCapturedPieces({
      player: createCapturedPieces(
        playerColor,
        getCapturedPieces(game, playerColor)
      ),
      opponent: createCapturedPieces(
        playerColor === "w" ? "b" : "w",
        getCapturedPieces(game, playerColor === "w" ? "b" : "w")
      ),
    });
    setGameState(getGameState(game));
  }, [playerColor]);

  useEffect(() => {
    if (data?.type === messageTypes.MOVE) {
      if (!myTurn(game, playerColor) && data.message.playerId !== playerId) {
        game.move(data.message.move);
        updateGameState();
      }
    }
  }, [data, playerColor, playerId, updateGameState]);

  const makeAMove = (move) => {
    if (!myTurn(game, playerColor)) return false;
    try {
      game.move(move);
      send(messageTypes.MOVE, { move, gameState: position, gameId, playerId });
      updateGameState();
      return true;
    } catch {
      return false;
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    return makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });
  };

  const getMoveOptions = (square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
    return true;
  };

  const onSquareClick = (square) => {
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (!moveTo) {
      const moves = game.moves({
        moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );

      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      setMoveTo(square);

      makeAMove({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  };
  return (
    !isLoading && (
      <ChessGameLayout
        myTurn={myTurn(game, playerColor)}
        capturedPieces={capturedPieces}
        playerId={playerId}
        opponentId={opponentId}
        gameState={gameState}
      >
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardOrientation={playerColor === "w" ? "white" : "black"}
          onSquareClick={onSquareClick}
          customSquareStyles={{
            ...optionSquares,
          }}
        />
      </ChessGameLayout>
    )
  );
};
