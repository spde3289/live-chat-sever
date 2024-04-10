import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import roomList from "../data/roomList.json";
// const roomList = require("../data/roomList.json");

let router = express.Router();

/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json(roomList);
});

/** 방 생성 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const participant = {
    id: roomList.length + 1,
    name: req.body.name,
  };
  roomList.push(participant);

  const stringJson = JSON.stringify(roomList);
  fs.writeFileSync("./data/roomList.json", stringJson);
  res.send(roomList);
});

export default router;
