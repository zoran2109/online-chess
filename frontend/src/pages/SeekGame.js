import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { routes, messageTypes } from "../utils/constants";

const styles = {
  alignment: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
  },
  margin: { margin: "10px" },
  header: { fontSize: "10vmin" },
  seekingContainer: { height: "60px" },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
};

const Alert = ({
  variant = "info",
  show = false,
  setShow = () => {},
  children,
}) =>
  show && (
    <ToastContainer
      position="bottom-center"
      style={{ margin: "10px", textAlign: "center" }}
    >
      <Toast
        bg={variant}
        onClose={() => setShow(false)}
        show={show}
        delay={5000}
        autohide
      >
        <Toast.Body className="text-white">{children}</Toast.Body>
      </Toast>
    </ToastContainer>
  );

export const SeekGame = () => {
  const [seeking, setSeeking] = useState(false);
  const navigate = useNavigate();
  const [isReady, data, send] = useWebSocket();
  const [showAlert, setShowAlert] = useState(false);

  const handleClick = () => {
    send(messageTypes.SEEK_GAME);
    setSeeking(true);
  };

  useEffect(() => {
    if (seeking) {
      const seekTimeout = setTimeout(() => {
        send(messageTypes.SEEK_TIMEOUT);
        setSeeking(false);
        setShowAlert(true);
      }, 5000);

      return () => {
        clearTimeout(seekTimeout);
      };
    }
  }, [seeking, send]);

  useEffect(() => {
    if (data?.type === messageTypes.GAME_STARTED) {
      setSeeking(false);
      const {
        message: { playerId, gameId },
      } = data;

      sessionStorage.setItem("playerId", playerId);
      navigate(routes.game.replace(":gameId", gameId));
    }
  }, [data, navigate]);

  return (
    <div style={styles.alignment}>
      <h1 style={{ ...styles.margin, ...styles.header }}>&#9822; Play Chess</h1>
      <div style={styles.seekingContainer}>
        {!seeking ? (
          <Button
            variant="primary"
            size="lg"
            disabled={!isReady || seeking}
            onClick={handleClick}
            style={styles.margin}
          >
            Seek Chess Game
          </Button>
        ) : (
          <div style={styles.spinnerContainer}>
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              style={styles.margin}
            />
            Seeking...
          </div>
        )}
      </div>
      <Alert variant="primary" show={showAlert} setShow={setShowAlert}>
        Search timed-out. Please try again.
      </Alert>
    </div>
  );
};
