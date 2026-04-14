import { useEffect, useRef, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [world, setWorld] = useState(null);
  const [round, setRound] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const socketRef = useRef(null);
  const sessionIdRef = useRef(null);

  const connectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket("wss://ju0zz8khde.execute-api.us-east-1.amazonaws.com/production");

    ws.onopen = () => {
      setStatus("Connected");
      setMessages((prev) => [...prev, "Connected to WebSocket"]);
    };

    ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "simulation_update") {
    setRound(data.round);
    setWorld(data.world);
    setRecentActions(data.recent_actions || []);

    if (data.sessionId) {
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
    }

    setMessages((prev) => [
      ...prev,
      `Received simulation update for round ${data.round}`,
      `Session ID: ${data.sessionId || sessionIdRef.current || "missing"}`
    ]);
  } else if (data.type === "error") {
    setMessages((prev) => [...prev, `Error: ${data.message}`]);
  } else {
    setMessages((prev) => [...prev, `Received: ${event.data}`]);
  }
};

    ws.onclose = () => {
      setStatus("Disconnected");
      setMessages((prev) => [...prev, "WebSocket closed"]);
    };

    ws.onerror = () => {
      setMessages((prev) => [...prev, "WebSocket error"]);
    };

    socketRef.current = ws;
  };

  const sendMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        action: "sendMessage",
        command: "start_simulation"
      };

      socketRef.current.send(JSON.stringify(payload));
      setMessages((prev) => [...prev, `Sent: ${JSON.stringify(payload)}`]);
    } else {
      setMessages((prev) => [...prev, "Socket is not connected"]);
    }
  };

  const nextRound = () => {
  const currentSessionId = sessionIdRef.current;

  if (!currentSessionId) {
    setMessages((prev) => [
      ...prev,
      "No sessionId yet. Click Start Simulation and wait for the session message."
    ]);
    return;
  }

  if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    const payload = {
      action: "sendMessage",
      command: "next_round",
      sessionId: currentSessionId
    };

    socketRef.current.send(JSON.stringify(payload));
    setMessages((prev) => [...prev, `Sent: ${JSON.stringify(payload)}`]);
  } else {
    setMessages((prev) => [...prev, "Socket is not connected"]);
  }
};

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ padding: "24px", fontFamily: "Arial", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>AI Simulation Sandbox</h1>
      <p>Status: {status}</p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button onClick={connectWebSocket}>Connect</button>
        <button onClick={sendMessage}>Start Simulation</button>
        <button onClick={nextRound}>Next Round</button>
      </div>

      {round !== null && <h2>Round: {round}</h2>}

      {world && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "24px"
          }}
        >
          {Object.entries(world).map(([key, value]) => (
            <div
              key={key}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                background: "#f7f7f7",
                color: "#111"
              }}
            >
              <strong>{key.replaceAll("_", " ")}</strong>
              <div>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <h2>Recent Actions</h2>
        <ul>
          {recentActions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}