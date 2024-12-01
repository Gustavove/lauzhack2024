import {GLTFExporter} from "three/addons";

export function sendDrawingToServer(socket, painter) {
    const exporter = new GLTFExporter();
    if(!painter.mesh) {
        socket.send("No hay un modelo para exportar");
        return;
    }

    exporter.parse(
        painter.mesh,
        (gltf) => {
            const data = JSON.stringify(gltf);
            socket.send("Modelo exportado: ", data);
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data);
                console.log("Dibujo enviado al servidor WebSocket");
            } else {
                console.error("WebSocket no está listo para enviar datos");
            }
        },
        (error) => {
            console.error("Error al exportar el modelo:", error);
            socket.send("Error al exportar el modelo", painter.mesh);
        }
    );
}