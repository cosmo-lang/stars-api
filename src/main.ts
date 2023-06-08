import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient;
const app = express();
const port = 3030;

app.use(express.json());
const apiRouter = express.Router();

apiRouter.get("/packages/:author", async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { author: req.params.author }
    })
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch package." });
  }
});

apiRouter.post("/packages", (req, res) => {
  const authorName = req.body.name
  res.send("Todo");
});

apiRouter.get("/packages/:author/:name", async (req, res) => {
  try {
    const packageData = await prisma.package.findFirst({
      where: { author: req.params.author }
    })

    if (packageData == null)
      res.status(500).json({ error: "Package does not exist." });
    else
      res.json(packageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch package." });
  }
});

apiRouter.post("/packages/:author", (req, res) => {
  const author = req.params.author
  const packageName = req.body.name
  res.send("Todo");
});

app.use("/api", apiRouter);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});