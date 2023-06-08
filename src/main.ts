import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient;
const app = express();
const port = 3030;

app.use(express.json());
const router = express.Router();

router.get("/packages/:author", async (req, res) => {
  try {
    const author = await prisma.author.findFirst({
      where: { name: req.params.author }
    });

    if (author == null)
      res.status(500).json({ success: false, error: "Author does not exist." });
    else {
      const packages = await prisma.package.findMany({
        where: { author: author }
      })
      res.json({ success: true, result: packages });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch package." });
  }
});

router.post("/packages", async (req, res) => {
  const authorName = req.body.authorName.toLowerCase()
  await prisma.author.create({
    data: {
      id: new ObjectId().toHexString(),
      name: authorName,
      packages: {
        create: []
      }
    }
  });

  res.json({ success: true });
});

router.get("/packages/:author/:name", async (req, res) => {
  try {
    const author = await prisma.author.findFirst({
      where: { name: req.params.author.toLowerCase() }
    });

    if (author == null)
      res.status(500).json({ error: "Author does not exist." });
    else {
      const packageData = await prisma.package.findFirst({
        where: { author: author }
      });

      if (packageData == null)
        res.status(500).json({ success: false, error: "Package does not exist." });
      else
        res.json({ success: true, result: packageData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch package." });
  }
});

router.post("/packages/:author",  async (req, res) => {
  const packageName = req.body.name
  const author = await prisma.author.findFirst({
    where: { name: req.params.author.toLowerCase() }
  });

  if (author == null)
    res.status(500).json({ success: false, error: "Author does not exist." });
  else {
    await prisma.package.create({
      data: {
        id: new ObjectId().toHexString(),
        name: packageName,
        author: {
          create: author
        }
      }
    });

    res.json({ success: true });
  }
});

app.use("/api", router);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});