import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../../data/roomList.json";

let router = express.Router();

/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json(roomList);
});

interface RoomData {
  id: string;
  name: string;
  user: string;
  status: string;
}

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const postData: RoomData = req.body;
  // console.log(postData);
  const date = new Date().toString();
  const capyRoomList: RoomData[] = roomList;
  if (Array.isArray(capyRoomList) && typeof postData === "object") {
    capyRoomList.push(postData);
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
