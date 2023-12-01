import React, { useState, useEffect } from "react";

const styles = {
  textAlign: { textAlign: "center" },
  chessGameContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
  },
  chessGameContainerSmall: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "40vh",
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "left",
    fontSize: "1.5em",
  },
  chessBoard: {
    width: "600px",
    maxWidth: "80%",
  },
  chessBoardSmall: {
    width: "400px",
    maxWidth: "80%",
  },
  playerDetailsContainer: { padding: "30px 5px" },
  playerDetailsContainerSmall: {
    padding: "10px 0",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  underline: (myTurn) =>
    myTurn
      ? {
          borderBottom: "3px solid #0275d8",
          display: "fit-content",
        }
      : null,
  capturedPieces: { padding: "16px 0" },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "25% 50% 25%",
  },
};

const getCurrentWidth = () => window.innerWidth;

export const ChessGameLayout = ({
  myTurn,
  capturedPieces,
  playerId,
  opponentId,
  gameState,
  children,
}) => {
  const [screenWidth, setScreenWidth] = useState(getCurrentWidth());

  useEffect(() => {
    const updateWidth = () => {
      setScreenWidth(getCurrentWidth());
    };
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [screenWidth]);

  return screenWidth > 1000 ? (
    <div style={styles.gridContainer}>
      <div></div>
      <div style={styles.chessGameContainer}>
        <div style={styles.chessBoard}>{children}</div>
      </div>
      <div style={styles.flexContainer}>
        <div>
          <div style={styles.playerDetailsContainer}>
            <div>{capturedPieces.player}</div>
            <span style={styles.underline(!myTurn)}>Guest{opponentId}</span>
          </div>
          <div style={styles.playerDetailsContainer}>
            <span style={styles.underline(myTurn)}>Guest{playerId} (You)</span>
            <div>{capturedPieces.opponent}</div>
            <div>{gameState}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div style={styles.flexContainer}>
      <div>
        <div style={styles.playerDetailsContainerSmall}>
          <div style={!capturedPieces.player ? styles.capturedPieces : null}>
            {capturedPieces.player}
          </div>
          <span style={styles.underline(!myTurn)}>Guest{opponentId}</span>
        </div>
        <div style={styles.chessGameContainerSmall}>
          <div style={styles.chessBoardSmall}>{children}</div>
        </div>
        <div style={styles.playerDetailsContainerSmall}>
          <span style={styles.underline(myTurn)}>Guest{playerId} (You)</span>
          <div style={!capturedPieces.opponent ? styles.capturedPieces : null}>
            {capturedPieces.opponent}
          </div>
          <div>{gameState}</div>
        </div>
      </div>
    </div>
  );
};
