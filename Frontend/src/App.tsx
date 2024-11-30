import { useEffect, useState } from "react";
import "./App.css";
import { Main } from "./pages/Main";

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://dog-comic-easily.ngrok-free.app");
    ws.onopen = () => {
      console.log("Connected a GUSTAVO");
    };

    ws.onclose = () => {
      console.log("Desconectado de GUSTAVO");
    };

    setSocket(ws);
    return {
      //wsclose();
    };
  }, []);
  return (
    <>
      <Main socket={socket} />
    </>
  );
}

export default App;
