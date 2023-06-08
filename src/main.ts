import express, { Request, Response } from "express";

const app = express();
const port = 3030;

const apiRouter = express.Router();

apiRouter.get("/packages/:author", (req, res) => {
  res.send("Todo");
});

apiRouter.get("/packages/:author/:name", (req, res) => {
  res.send("Todo");
});

apiRouter.post("/packages/:author", (req, res) => {
  res.send("Todo");
});

app.use("/api", apiRouter);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});