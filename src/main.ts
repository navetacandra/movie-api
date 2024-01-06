import express, { Request, Response } from "express";
import cors from "cors";
import router from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ methods: ["GET"], origin: "*" }));
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Welcome",
    author: "navetacandra <naveta.cand@gmail.com>",
  });
});

app.get("*", (req: Request, res: Response) => {
  return res.status(404).json({ status: "error", message: "not found" });
});

app.listen(PORT, () => console.log("Running in port:", PORT));
