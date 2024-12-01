import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function sendDrawingToServer(socket, painter) {
  const exporter = new GLTFExporter();
  exporter.parse(
    painter.mesh,
    (gltf) => {
      const data = JSON.stringify(gltf);

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
        console.log("Dibujo enviado al servidor WebSocket");
      } else {
        console.error("WebSocket no está listo para enviar datos");
      }
    },
    (error) => {
      console.error("Error al exportar el modelo:", error);
    }
  );
}