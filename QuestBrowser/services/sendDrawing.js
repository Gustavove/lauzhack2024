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

// Verificar si painter.mesh es válido
        if (painter.mesh instanceof THREE.Mesh) {
            scene.add(painter.mesh);  // Asegúrate de agregar la malla correcta a la escena
        } else {
            console.error("Error: painter.mesh no es válido.");
            socket.send("Error al exportar el modelo: painter.mesh no es válido.");
            return;
        }

// Opciones de exportación
        const options = {
            binary: false,  // Usar formato .gltf (JSON)
            embedImages: true,
            onlyVisible: true,
            includeAnimations: false
        };

// Exportar el modelo
        exporter.parse(
            scene,  // Escena con painter.mesh
            (gltf) => {
                console.log("gltf exportado: ", gltf);  // Verifica que el gltf tiene los datos esperados
                const data = JSON.stringify(gltf);  // Convertir a JSON

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(data);  // Enviar al servidor
                    console.log("Modelo exportado y enviado al servidor.");
                } else {
                    console.error("WebSocket no está listo para enviar datos.");
                }
            },
            (error) => {
                console.error("Error al exportar el modelo:", error);
            },
            options
        );
    }

}