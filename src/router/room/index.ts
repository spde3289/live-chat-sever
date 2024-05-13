import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../../data/roomList.json";
import { WebClient } from "@slack/web-api";
import "dotenv/config";

let router = express.Router();

const botClient = new WebClient(process.env.BOT_KEY!);
const channelId = process.env.ROOM_CHANNEL_ID!;
/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json(roomList);
});

interface ReqBodyType {
  id: string;
  name: string;
  user: string;
  status: string;
}

interface RoomDataType {
  id: string;
  roomName: string;
  status: string;
}

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const postData: ReqBodyType = req.body;
  const date = new Date().toString();

  const capyRoomList: RoomDataType[] = roomList;
  if (Array.isArray(capyRoomList) && typeof postData === "object") {
    capyRoomList.push({
      id: postData.id,
      roomName: postData.name,
      status: "진행중",
    });
  }

  const stringJson = JSON.stringify(capyRoomList);

  const Json = JSON.stringify([
    { text: postData.name, name: postData.user, time: date },
  ]);

  fs.writeFileSync(`./src/data/${postData.id}-chatLog.json`, Json);

  botClient.chat
    .postMessage({
      channel: channelId,
      text: `New Room ${postData.name}!`,
    })
    .catch((error) => {
      console.log("오류가 발생했습니다.");
      console.error(error);
    });

  fs.writeFileSync("./src/data/roomList.json", stringJson);
  res.send(capyRoomList);
});

export default router;
