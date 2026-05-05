# LinkUp - Video Conferencing Platform

LinkUp is a real-time video conferencing application that allows users to create and join secure video meetings. It is built using modern web technologies to ensure low latency, high quality, and a smooth user experience.

## Features

- **Real-Time Video & Audio:** Peer-to-peer communication powered by WebRTC for seamless, low-latency streaming.
- **Multiple Participants:** Join group calls where multiple users can stream video and audio simultaneously.
- **Screen Sharing:** Share your screen with other participants in real-time.
- **Real-Time Chat:** Integrated in-meeting text chat utilizing Socket.IO.
- **Media Controls:** Easily toggle your microphone and camera on or off.
- **Active Speaker View:** Dynamically switch the main view to focus on the active participant by selecting their stream.
- **User Authentication:** Secure login and user management built with Node.js, Express, and MongoDB.

## Technology Stack

### Frontend
- **React (v19)** with **Vite** for fast, modern UI development.
- **Tailwind CSS (v4)** for highly customizable and responsive styling.
- **Material-UI (MUI)** for premium icons and components.
- **Socket.IO-client** for real-time signaling and chat communication.

### Backend
- **Node.js** & **Express** for the server framework.
- **Socket.IO** for WebSocket connections (WebRTC signaling, chat, participant presence).
- **MongoDB & Mongoose** for database management and user records.
- **WebRTC** for peer-to-peer media streaming.
- **Bcrypt** for secure password hashing.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (running locally or a MongoDB Atlas URI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SantoshK0809/LinkUp.git
   cd LinkUp
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory and add your MongoDB URI and port configurations.*

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   *Create a `.env` file in the `frontend` directory and add your Vite base URL for the backend API.*

### Running the Application

Open two terminal windows/tabs.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will typically run at `http://localhost:5173`. Open this in your browser to start using LinkUp!

## Usage
- **Sign Up / Log In**: Create an account or log in to an existing one.
- **Create Meeting**: Enter a date and time to schedule a meeting.
Then system will provide a meeting code.
- **Join Meeting**: Enter a meeting URL or meeting code to join the room.
- **In-Meeting Controls**: Use the bottom toolbar to toggle video/audio, share your screen, or open the chat panel.
- **Participant View**: Click on any participant in the bottom strip to bring their video to the main stage.
