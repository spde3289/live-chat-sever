import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

import chatLog from "./data/chatLog.json";
import indexRouter from "./router/index";
import roomRouter from "./router/room";
import { UserListType, ChatLogType } from "./Type";
import { time } from "console";

const app = express();
const sever = app.listen("3000", () => {
  console.log(`
  ################################################
        🛡️  Server listening on port: 3000🛡️
  ################################################
  `);
});

let io = new Server(sever);

let userList: UserListType = [];

io.on("connection", (socket) => {
  // 연결 끊김
  socket.on("disconnect", () => {
    for (let i = 0; i < userList?.length; i++) {
      if (userList[i].id === socket.id) {
        userList.splice(i, 1);
        i--;
      }
    }
    io.emit("user list", userList);
  });

  // 방 입장
  socket.on("join room", (user) => {
    userList.push({ user: user, id: socket.id });
    io.emit("user list", userList);
  });

  // 채팅 입력
  socket.on("chat message", (msg, id) => {
    const newChatLog: ChatLogType = chatLog;
    const date = new Date().toString();

    newChatLog.push({ msg: msg, user: id, time: date });
    const stringJson = JSON.stringify(newChatLog);

    fs.writeFileSync("./src/data/chatLog.json", stringJson);
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
