import express from "express";
import fs from "fs";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import { WebClient } from "@slack/web-api";
import "dotenv/config";

import indexRouter from "./router/index";
import roomRouter from "./router/room";

const app = express();

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`
  ################################################
        🛡️  Server listening on port: ${PORT}🛡️
  ################################################
  `);
});

let io = new Server(server);

const botClient = new WebClient(process.env.BOT_KEY!);
const channelId = process.env.CHAT_CHANNEL_ID!;

const users: any = [];

function userJoin(userId: any, username: any, roomName: any) {
  const roomList = JSON.parse(
    fs.readFileSync("./src/data/roomList.json", "utf8")
  );

  const roomId = roomList.find((el: any) => {
    return el.id === roomName;
  }).id;

  const user = { userId, username, roomId };
  users.push(user);
  return user;
}

function getCurrentUser(userId: any) {
  return users.find((user: any) => user.userId === userId);
}

function userLeave(userId: any) {
  const index = users.findIndex((user: any) => user.userId === userId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room: any) {
  return users.filter((user: any) => user.roomId === room);
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

  socket.on("join room", (username, roomName) => {
    const user = userJoin(socket.id, username, roomName);
    socket.join(user.roomId);

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

    io.to(user.roomId).emit("chat log", chatLog(user.roomId));

    io.to(user.roomId).emit("roomUsers", {
      room: user.roomId,
      users: getRoomUsers(user.roomId),
    });
  });

  socket.on("chat message", (msg) => {
    const user = getCurrentUser(socket.id);

    botClient.chat
      .postMessage({
        channel: channelId,
        text: `New Chat ${user.roomId}!`,
      })
      .catch((error) => {
        console.log("오류가 발생했습니다.");
        console.error(error);
      });

    io.to(user.roomId).emit(
      "chat message",
      fromatMessage(user.username, msg, user.roomId)
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

// 수정된 CORS 설정
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://live-support.shop");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const whitelist: string[] = [
  "http://localhost:5173",
  "https://live-support.shop",
  "https://www.live-support.shop",
];

const corsOptions: cors.CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (origin && whitelist.indexOf(origin) !== -1) {
      // 만일 whitelist 배열에 origin인자가 있을 경우
      callback(null, true); // cors 허용
    } else {
      callback(new Error("Not Allowed Origin!")); // cors 비허용
    }
  },
};

app.use(bodyParser.json());
app.use(cors(corsOptions)); // 옵션을 추가한 CORS 미들웨어 추가

app.use("/", indexRouter);
app.use("/room", roomRouter);
