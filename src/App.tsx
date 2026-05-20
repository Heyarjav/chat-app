import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { useEffect, useState } from "react";
let ws: WebSocket | null = null;
type toSend = {
  text: string;
  mine: boolean;
}
export function App() {
  const [messages, setMessages] = useState<toSend[]>([]);
  const [input, setInput] = useState("");
  useEffect(() => {
    // connect to websocket server
    if (ws) return;
    ws = new WebSocket("ws://localhost:3000/chat");

    ws.onopen = () => {
      console.log("connected");
    };

    ws.onmessage = event => {
      console.log("received:", event.data);
      const parsed = JSON.parse(event.data);
      setMessages(prev => [...prev, parsed]);
    };

    ws.onclose = () => {
      console.log("disconnected");
    };

    return () => {
      ws?.close();
      ws = null;
    };
  }, []);

  function sendMessage() {
    ws?.send(input);
    setInput("");
  }
  return (
    <div className="app">
      <div className="messages">
        {messages.toReversed().map((msg, i) => (
          msg.mine ? <div className="sent" key={i}><span className="box">{msg.text}</span></div> : <div className="received" key={i}><span className="box">{msg.text}</span></div>
        ))}
      </div>
      <div className="message-box">
        <input value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }} type="text" className="input-box" />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
}

export default App;
