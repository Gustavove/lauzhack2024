# Collaborative Classroom Project - LauzHack Hackathon

## Overview

The **Collaborative Classroom Project** is an innovative solution for real-time, interactive learning in a virtual classroom environment. Built for the **MetaQuest 3S** and using **MX Ink**, this project enables teachers to create, share, and collaborate with students as they teach, all within a fully immersive experience. Students can view the teacher's creations live on their own browser clients, facilitating an engaging and collaborative learning process.

## Features

- **Real-time Collaboration:** Teachers can create content and share it live with students, all while interacting with the content through a shared virtual environment.
- **Immersive Experience:** Using **WebXR**, teachers can draw and interact with content from their MetaQuest 3S in real time, bringing a new dimension to virtual learning.
- **Student Client:** Students use a simple web browser to view the teacher’s content, making it easy to access without special hardware.
- **WebSocket Communication:** WebSockets enable seamless communication between the teacher's client (MetaQuest 3S) and student clients, ensuring live updates as the teacher draws and creates.
- **ReactJS & Three.js for 3D Visualization:** The student-side interface is built using **ReactJS** and **Three.js** to provide an interactive and engaging experience.

## Technologies Used

- **ReactJS:** Frontend framework used for building the student-facing website client.
- **Three.js:** JavaScript library for rendering 3D graphics within the browser, creating an immersive experience for students.
- **WebXR:** Used for the teacher’s point-of-view, allowing them to draw and interact within the virtual environment via the MetaQuest 3S.
- **WebSockets:** Facilitates real-time communication between the teacher and students, allowing live updates to be pushed from the teacher’s drawing session to the student clients.
- **Node.js:** Backend server that handles WebSocket connections and manages the flow of data.
- **Git:** Version control system used to manage code changes and collaboration during development.

## Installation

### Prerequisites

Before you can get started, you need to have the following tools installed:

- **Node.js** (v14 or later)
- **npm** (Node Package Manager)
- **Git**

