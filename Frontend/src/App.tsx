import { useEffect, useState } from "react";
import "./App.css";
import { Main } from "./pages/Main";
import { GLTFLoader } from "three-stdlib";

function App() {
  const [socket, setSocket] = useState(null);
  const [gltfScene, setGltfScene] = useState(null);
  useEffect(() => {
    const ws = new WebSocket("wss://dog-comic-easily.ngrok-free.app");
    ws.onopen = () => {
      console.log("Connected a GUSTAVO");
    };

    ws.onclose = () => {
      console.log("Desconectado de GUSTAVO");
    };

    ws.onmessage = async (event) => {
      console.log("Message received:", event.data);

      // Check if the incoming data is binary or string
      if (event.data instanceof ArrayBuffer) {
        // If the data is binary (GLB file)
        const loader = new GLTFLoader();
        loader.parse(event.data, "", (gltf) => {
          setGltfScene(gltf.scene); // Set the GLTF scene to state
        });
      } else if (event.data instanceof Blob) {
        // If the data is a Blob (GLTF JSON file)
        const text = await event.data.text(); // Convert Blob to text
        const jsonData = JSON.parse(text); // Parse the JSON string
        const blob = new Blob([JSON.stringify(jsonData)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
          setGltfScene(gltf.scene); // Set the GLTF scene to state
        });
      } else {
        console.error("Unexpected data type received:", typeof event.data);
      }
    };

    setSocket(ws);
    return {
      //wsclose();
    };
  }, []);
  return (
    <>
      <Main gltfScene={gltfScene} socket={socket} />
    </>
  );
}

export default App;
