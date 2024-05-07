import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../../data/roomList.json";

let router = express.Router();

/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  // console.log("dddd")
  res.json(roomList);
  // res.json({ user: "tj" });
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const postData = req.body;
  console.log(postData);
  const capyRoomList = roomList;
  if (postData) {
    capyRoomList.push(postData);
  }

  const stringJson = JSON.stringify(capyRoomList);

  const Json = JSON.stringify([]);

  fs.writeFileSync(`./src/data/${postData.name}-chatLog.json`, Json);

  console.log(stringJson);
  fs.writeFileSync("./src/data/roomList.json", stringJson);
  res.send("POST request to the homepage");
});

export default router;
