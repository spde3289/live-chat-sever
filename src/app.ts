import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

import indexRouter from "../router/index";
import roomRouter from "../router/room";

const app = express();
const sever = app.listen("3000", () => {
  console.log(`
  ################################################
        🛡️  Server listening on port: 3000🛡️
  ################################################
  `);
});

const io = new Server(sever);
let currentUser: any;

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  console.log("welcome");
  socket.on("welcome", (user) => {
    currentUser = user;
    // socket.emit("newWelcome", user);
  });

  socket.on("chat message", (msg) => {
    console.log(currentUser + ": " + msg);
    io.emit("chat message", { msg: msg, user: currentUser });
  });
});

app.use((req, res, next) => {
  console.log("dasdasdasdasdasd");
  res.setHeader("Access-Control-Allow-Origin", "http://192.168.0.101:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", 0);
  cors({
    origin: [
      "*",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://192.168.0.101:5173",
    ],
  });
  next();
});
app.use(bodyParser.json());

app.use("/", indexRouter);
app.use("/room", roomRouter);

/* let participants: any = [
  { id: 1, nation: "Republic of Korea" },
  { id: 2, nation: "United States" },
  { id: 3, nation: "Great Britain" },
  { id: 4, nation: "Canada" },
  { id: 5, nation: "Japan" },
];

app.get("/welcome", (req: Request, res: Response, next: NextFunction) => {
  res.send(participants);
});

app.get("/welcome/:id", (req: Request, res: Response, next: NextFunction) => {
  res.send(participants.find((el: any) => (el.id = req.params.id)));
});

app.post("/welcome", (req, res, next) => {
  const participant = {
    id: participants.length + 1,
    nation: req.body.nation,
  };
  participants.push(participant);
  res.send(participants);
});

app.put("/welcome/:id", (req, res, next) => {
  const participant = participants.find(
    (p: any) => p.id === parseInt(req.params.id)
  );
  if (!participant) {
    return res.status(404).send("ID was not found.");
  }
  participant.nation = req.body.nation;
  res.status(200).json(participant);
  console.log("participants : " + participants);
});

app.delete("/welcome/:id", (req, res, next) => {
  const participant = participants.find(
    (p: any) => p.id === parseInt(req.params.id)
  );
  if (!participant) {
    return res.status(404).send("ID was not found.");
  }
  const index = participants.indexOf(participant);
  participants.splice(index, 1);
  console.log(participants);
  res.json("deleted!");
}); */
