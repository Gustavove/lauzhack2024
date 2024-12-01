import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber"; // Canvas is the container for the 3D scene
import { OrbitControls, Text, useGLTF } from "@react-three/drei"; // OrbitControls lets us move the camera around
import { GLTFExporter } from "three-stdlib"; // Import the GLTFExporter
import { XR, createXRStore } from "@react-three/xr";

const store = createXRStore();
// A new component to display the notes in 3D
const Note = ({ position, content, onChangeContent }) => {
  return (
    <group position={position}>
      <Text
        position={[0, 0.1, 0]} // Adjust text position relative to the note marker
        fontSize={0.05}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {content}
      </Text>
    </group>
  );
};

const Displayer = ({ socket, gltfScene }) => {
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

  const handleDownload = () => {
    if (!sceneRef.current) return;

    const exporter = new GLTFExporter();

    exporter.parse(
      sceneRef.current, // The scene or group you want to export
      (gltf) => {
        // Convert GLTF to a Blob and trigger the download
        const blob = new Blob([JSON.stringify(gltf)], {
          type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "scene.gltf"; // Set the file name
        link.click();
      },
      { binary: true } // Set to true for GLB export (binary format)
    );
  };
  return (
    <div className=" flex justify-center items-center">
      <div className="relative w-[800px] h-[600px] bg-white border-2 border-black-500 rounded-lg shadow-lg">
        <input
          type="text"
          value={content}
          onChange={handleContentChange}
          placeholder="Enter note..."
          className="border-blue-500 border-2  rounded-lg absolute bottom-3 right-5 z-10 p-2 text-base text-black"
        />
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="absolute z-10 bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          Add note
        </button>
        <button
          onClick={handleDownload}
          className="absolute z-10 bottom-3 left-16 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          Save work
        </button>
        {/* <button onClick={() => store.enterVR()}>Enter VR</button> */}
        <Canvas
          className="w-2 h-full bg-gray-100"
          camera={{ position: [0, 0, 2], fov: 45 }}
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
              {gltfScene && <primitive object={gltfScene} />}
              {notes.map((note, index) => (
                <Note
                  key={index}
                  position={note.position}
                  content={note.content}
                />
              ))}
            </group>
          </XR>
        </Canvas>
      </div>
    </div>
  );
};

export default Displayer;
