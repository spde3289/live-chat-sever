import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../../data/roomList.json";
import { WebClient } from "@slack/web-api";
import "dotenv/config";

let router = express.Router();

const botClient = new WebClient(process.env.BOT_KEY!);
const channelId = process.env.ROOM_CHANNEL_ID!;
/** 방 리스트 */

const roomListMap = (list: any[]) => {
  return list.map((el: any) => {
    return {
      id: el.id,
      selectMenu: el.selectMenu,
      roomName: el.roomName,
      status: el.status,
    };
  });
};

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  const data = fs.readFileSync("./src/data/roomList.json", "utf8");
  const jsonData = JSON.parse(data);

  res.json(roomListMap(jsonData));
});

interface ReqBodyType {
  selectMenu: string;
  id: string;
  name: string;
  user: string;
  status: string;
  password: string;
}

interface RoomDataType {
  id: string;
  selectMenu: string;
  roomName: string;
  status: string;
  password: string;
}

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const postData: ReqBodyType = req.body;
  const date = new Date().toString();

  const capyRoomList: RoomDataType[] = roomList;
  if (Array.isArray(capyRoomList) && typeof postData === "object") {
    capyRoomList.push({
      id: postData.id,
      selectMenu: postData.selectMenu,
      roomName: postData.name,
      status: "진행중",
      password: postData.password,
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
  res.send(roomListMap(capyRoomList));
});

router.post("/join", (req: Request, res: Response, next: NextFunction) => {
  const postData: any = req.body;

  if (roomList.length != 0) {
    const findRoom = roomList.find((el) => {
      return el!.id === postData.content;
    });

    if (findRoom) res.send(findRoom!.password === postData.password);
  }
});

router.delete("/", (req: Request, res: Response, next: NextFunction) => {
  const postData: any = req.body;

  const data = fs.readFileSync("./src/data/roomList.json", "utf8");
  const JsonData = JSON.parse(data);

  const deleteData = JsonData.filter((el: any) => el.id != postData.data.id);

  const stringJson = JSON.stringify(deleteData);

  fs.writeFileSync("./src/data/roomList.json", stringJson);

  res.json(roomListMap(deleteData));
});

router.put("/", (req: Request, res: Response, next: NextFunction) => {
  const postData: any = req.body;

  const data = fs.readFileSync("./src/data/roomList.json", "utf8");
  let rooms = JSON.parse(data);

  let room = rooms.find((r: any) => r.id === postData.id);

  if (room) {
    Object.assign(room, postData);
    fs.writeFileSync(
      "./src/data/roomList.json",
      JSON.stringify(rooms, null, 2),
      "utf8"
    );
    res.json(roomListMap(rooms));
  } else {
    res.status(404).send({ message: "Room not found" });
  }
});

export default router;
