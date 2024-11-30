import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber"; // Canvas is the container for the 3D scene
import { OrbitControls, Text } from "@react-three/drei"; // OrbitControls lets us move the camera around
import { GLTFExporter } from "three-stdlib"; // Import the GLTFExporter
import { XR, createXRStore } from "@react-three/xr";

const store = createXRStore();
// A new component to display the notes in 3D
const Note = ({ position, content, onChangeContent }) => {
  return (
    <group position={position}>
      <mesh>
        {/* A simple sphere as the note marker */}
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <Text
        position={[0, 0.2, 0]} // Adjust text position relative to the note marker
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {content || "Click to add note"}
      </Text>
    </group>
  );
};

const Displayer = ({ socket }) => {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const sceneRef = useRef();

  const handleAddNote = (event) => {
    const { point } = event;
    setNotes([...notes, { position: point, content }]);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleExport = () => {
    if (!sceneRef.current) return;

    // Use GLTFExporter to export the scene
    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current, // The scene or group you want to export
      (gltf) => {
        console.log("Generated GLTF:", gltf); // Debug to verify JSON structure
        socket.send(JSON.stringify(gltf)); // Send complete GLTF JSON
      },

      { binary: true } // Set to true for GLB export
    );
  };

  return (
    <div className="mt-8 flex justify-center items-center h-full ">
      <div className="relative w-[800px] h-[600px] bg-white border-2 border-black rounded-lg shadow-lg">
        <input
          type="text"
          value={content}
          onChange={handleContentChange}
          placeholder="Enter note content"
          className="border-black border-2 absolute top-20 left-20 z-10 p-2 text-base"
        />
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="absolute z-10 bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          Export 3D Object
        </button>
        <button onClick={() => store.enterVR()}>Enter VR</button>
        <Canvas
          className="w-2 h-full bg-gray-100" // Make the canvas take up the full screen
          camera={{ position: [0, 0, 5] }} // Position the camera 5 units away from the center
          onClick={handleAddNote}
        >
          <XR store={store}>
            {/* Add an ambient light to illuminate the scene */}
            <ambientLight intensity={0.5} />

            {/* Add a directional light */}
            <directionalLight position={[10, 10, 10]} />

            {/* Add OrbitControls to allow the user to move around the 3D scene */}
            <OrbitControls />
            <group ref={sceneRef}>
              {/* Render a simple cube */}
              <mesh position={[-1.5, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />{" "}
                {/* Box geometry with width, height, and depth */}
                <meshStandardMaterial color="orange" />{" "}
                {/* Material that makes the cube orange */}
              </mesh>

              <mesh position={[1.5, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />{" "}
                {/* Box geometry with width, height, and depth */}
                <meshStandardMaterial color="orange" />{" "}
                {/* Material that makes the cube orange */}
              </mesh>
            </group>
            {notes.map((note, index) => (
              <Note
                key={index}
                position={note.position}
                content={note.content}
              />
            ))}
          </XR>
        </Canvas>
      </div>
    </div>
  );
};

export default Displayer;
