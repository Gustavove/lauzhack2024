import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as THREE from "three";
export function sendDrawingToServer(socket, painter) {
    // Verificar si painter.mesh es un THREE.Mesh válido
    if (!(painter.mesh instanceof THREE.Mesh)) {
        console.error("painter.mesh no es una instancia válida de THREE.Mesh.");
        socket.send("Error al exportar el modelo: painter.mesh no es una instancia válida de THREE.Mesh.");
        return;  // No continuar con la exportación
    } else {
        // Si es válido, continuar con la exportación
        const exporter = new GLTFExporter();

        const scene = new THREE.Scene();
        scene.add(painter.mesh);  // Asegúrate de que painter.mesh sea un THREE.Mesh

        const options = {
            binary: false,  // Formato .gltf
            embedImages: true,
            onlyVisible: true,
            includeAnimations: false,
        };

        exporter.parse(
            scene,
            (gltf) => {
                const data = JSON.stringify(gltf);
                socket.send("Modelo exportado: " + data);
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send("Modelo exportado: " + data);
                    console.log("Dibujo exportado y enviado al servidor WebSocket");
                } else {
                    console.error("WebSocket no está listo para enviar datos");
                }
            },
            (error) => {
                console.error("Error al exportar el modelo:", error);
                socket.send("Error al exportar el modelo: " + error);
            },
            options
        );
    }

}