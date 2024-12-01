import React from "react";
import Displayer from "../components/Displayer";

export const Main = ({ socket, gltfScene }) => {
  return (
    <>
      <div className="h-screen bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white w-screen">
        <h1 className="p-5 flex justify-center items-center font-extrabold text-4xl">
          BoardCast - Live Classroom
        </h1>

        <Displayer gltfScene={gltfScene} socket={socket} />
      </div>
    </>
  );
};
