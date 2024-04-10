import express, { Request, Response, NextFunction } from "express";
let router = express.Router();

/** 방 리스트 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("ddd");
});

/** 방 생성 */
// router.post("/1", (req: Request, res: Response, next: NextFunction) => {
//   const participant = {
//     id: roomList.length + 1,
//     name: req.body.name,
//   };
//   roomList.push(participant);

//   const stringJson = JSON.stringify(roomList);
//   fs.writeFileSync("./data/roomList.json", stringJson);
//   res.send(roomList);
// });

/** 방 입장 */
router.get("/join", (req: Request, res: Response, next: NextFunction) => {
  res.send("@@@@ 방 입장 @@@@");
});

export default router;
