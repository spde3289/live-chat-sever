import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../../data/roomList.json";

let router = express.Router();

/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json(roomList);
  // res.json({ user: "tj" });
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  // console.log(req);
  // console.log(res)
  const postData = req.body;
  const capyRoomList = roomList;
  // capyRoomList.push(postData);

  const stringJson = JSON.stringify(capyRoomList);
  // fs.writeFileSync("./src/data/roomList.json", stringJson);
  // io.emit("chat message", { msg: msg, user: id });
  res.send("POST request to the homepage");
});

export default router;
