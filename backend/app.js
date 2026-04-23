import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import {connectToSocket} from "./src/controllers/socketManager.js";
import dotenv from "dotenv";
dotenv.config();

import userRoutes from './src/routes/users.routes.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit : "40kb" }));
app.use(express.urlencoded({ limit : "40kb" , extended: true}));

app.use("/api/v1/users", userRoutes)

app.get("/home", (req, res)=>{
    return res.json({"hello": "world"});
});


const start = async()=>{
    try{
    app.set("mongo_user", "zoomproject18");
    const connectionDb = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MONGO Connected DB Host : ${connectionDb.connection.host}`);
    server.listen(app.get("port"), ()=>{
        console.log("Listening on port 8000");
    });
}catch(err){
    console.error("DB Connection failed : ", err.message);
}
}

start();