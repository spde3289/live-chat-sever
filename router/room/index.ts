import express, { Request, Response, NextFunction } from "express";
import roomList from "../../data/roomList.json";

let router = express.Router();

/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json(roomList);
});

export default router;
