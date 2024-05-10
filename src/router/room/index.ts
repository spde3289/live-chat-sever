import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../../data/roomList.json";

let router = express.Router();

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
  // console.log(postData);
  const capyRoomList: RoomDataType[] = roomList;
  if (Array.isArray(capyRoomList) && typeof postData === "object") {
    capyRoomList.push({
      id: postData.id,
      roomName: postData.name,
      status: "ongoing",
    });
  }

  const stringJson = JSON.stringify(capyRoomList);

  const Json = JSON.stringify([
    { text: postData.name, name: postData.user, time: date },
  ]);

  fs.writeFileSync(`./src/data/${postData.id}-chatLog.json`, Json);

  fs.writeFileSync("./src/data/roomList.json", stringJson);
  res.send(capyRoomList);
});

export default router;
