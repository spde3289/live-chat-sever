import express, { Request, Response, NextFunction } from "express";

let router = express.Router();

/* GET home page. */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("안녕! ");
});

export default router;
