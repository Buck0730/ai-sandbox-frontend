import { useEffect, useRef, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const connectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket("wss://ju0zz8khde.execute-api.us-east-1.amazonaws.com/production/");

    ws.onopen = () => {
      setStatus("Connected");
      setMessages((prev) => [...prev, "Connected to WebSocket"]);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, `Received: ${event.data}`]);
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
      message: "hello from browser"
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
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1>AI Simulation Sandbox</h1>
      <p>Status: {status}</p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button onClick={connectWebSocket}>Connect</button>
        <button onClick={sendMessage}>Send Test Message</button>
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