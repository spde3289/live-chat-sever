import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

import indexRouter from "./router/index";
import roomRouter from "./router/room";
import { UserListType, ChatLogType } from "./Type";

const app = express();
const sever = app.listen("3000", () => {
  console.log(`
  ################################################
        🛡️  Server listening on port: 3000🛡️
  ################################################
  `);
});

let io = new Server(sever);

const Announcement = "공지";
const users: any = [];

function userJoin(id: any, username: any, room: any) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function getCurrentUser(id: any) {
  return users.find((user: any) => user.id === id);
}

function userLeave(id: any) {
  const index = users.findIndex((user: any) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room: any) {
  return users.filter((user: any) => user.room === room);
}

function fromatMessage(name: any, text: any, room: any) {
  const date = new Date().toString();

  const filePath = `./src/data/${room}-chatLog.json`;
  fs.readFile(filePath, "utf8", (err: any, data: any) => {
    if (err) {
      console.error("파일을 읽는 도중 오류가 발생했습니다:", err);
      return;
    }

    // JSON 파싱
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("JSON을 파싱하는 도중 오류가 발생했습니다:", parseErr);
      return;
    }

    jsonData.push({ text: text, name: name, time: date });

    // 수정된 JSON 파일 쓰기
    fs.writeFile(
      filePath,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("파일을 쓰는 도중 오류가 발생했습니다:", writeErr);
          return;
        }
      }
    );
  });

  return {
    name,
    text,
    time: date,
  };
}

function chatLog(room: any) {
  const filePath = `./src/data/${room}-chatLog.json`;
  const jsonData = fs.readFileSync(filePath, "utf8");

  return jsonData;
}

io.on("connection", (socket) => {
  // 방 입장
  socket.on("join room", (username, room) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // socket.broadcast
    //   .to(user.room)
    //   .emit(
    //     "chat message",
    //     fromatMessage(
    //       Announcement,
    //       `${user.username}님이 입장하셨습니다.`,
    //       user.room
    //     )
    //   );

    io.to(user.room).emit("chat log", chatLog(user.room));

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chat message", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit(
      "chat message",
      fromatMessage(user.username, msg, user.room)
    );
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      // io.to(user.room).emit(
      //   "chat message",
      //   fromatMessage(
      //     Announcement,
      //     `${user.username}님이 퇴장하셨습니다.`,
      //     user.room
      //   )
      // );
    }
  });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173/");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/", indexRouter);
app.use("/room", roomRouter);
