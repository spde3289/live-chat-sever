import express, { Request, Response, NextFunction } from "express";
import roomList from "../data/roomList.json";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

import indexRouter from "../router/index";
import roomRouter from "../router/room";

const app = express();
const sever = app.listen("3000", () => {
  console.log(`
  ################################################
        🛡️  Server listening on port: 3000🛡️
  ################################################
  `);
});

let io = new Server(sever);

let userList: any[] = [];

io.on("connection", (socket) => {
  console.log("접속");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (let i = 0; i < userList?.length; i++) {
      if (userList[i].id === socket.id) {
        userList.splice(i, 1);
        i--;
      }
    }
    io.emit("user list", userList);
  });

  socket.on("join room", (user) => {
    userList.push({ user: user, id: socket.id });
    io.emit("user list", userList);
  });

  socket.on("chat message", (msg, id) => {
    console.log(id + ": " + msg);
    io.emit("chat message", { msg: msg, user: id });
  });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173/");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  bodyParser.json();
  next();
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use("/", indexRouter);
app.use("/room", roomRouter);
