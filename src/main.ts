import { PrismaClient } from "@prisma/client";
import { errorBody } from "./util";
import express from "express";
import { PackageAlreadyExistsError, PackageService } from "./services/package-service";

const prisma = new PrismaClient;
const packages = new PackageService(prisma);
const app = express();
const port = 3030;

app.use(express.json());
const router = express.Router();

// Fetch author
router.get("/packages/:author", async (req, res) => {
  try {
    const author = await prisma.author.findFirst({
      where: { name: req.params.author }
    });

    if (!author)
      res.status(404).json(errorBody("Author does not exist."));
    else {
      const packages = await prisma.package.findMany({
        where: { author: author }
      })
      res.json({ success: true, result: packages });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(errorBody("Failed to fetch package."));
  }
});

// Add author
router.post("/packages", async (req, res) => {
  const authorName = req.body.authorName.toLowerCase()
  const author = await prisma.author.findFirst({
    where: { name: authorName }
  });

  if (!author) {
    await prisma.author.create({
      data: {
        name: authorName
      }
    });

    res.json({ success: true });
  } else
    res.status(503).json(errorBody("Author already exists."));
});

// Delete author
router.delete("/packages", async (req, res) => {
  const authorName = req.body.authorName.toLowerCase()
  const author = await prisma.author.findFirst({
    where: { name: authorName }
  });

  if (author) {
    await prisma.author.delete({
      where: { name: authorName }
    });

    res.json({ success: true });
  } else
    res.status(404).json(errorBody("Author does not exist."));
});

// Get package
router.get("/packages/:author/:name", async (req, res) => {
  try {
    const author = await prisma.author.findFirst({
      where: { name: req.params.author.toLowerCase() }
    });

    if (!author)
      res.status(404).json(errorBody("Author does not exist."));
    else {
      const packageData = await prisma.package.findFirst({
        where: { author: author }
      });

      if (!packageData)
        res.status(404).json(errorBody("Package does not exist."));
      else
        res.json({ success: true, result: packageData });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(errorBody("Failed to fetch package."));
  }
});

// Add package
router.post("/packages/:author",  async (req, res) => {
  const packageName: string = req.body.packageName.toLowerCase();
  const repository: string = req.body.repository;
  const author = await prisma.author.findFirst({
    where: { name: req.params.author.toLowerCase() }
  });

  if (!author)
    res.status(404).json(errorBody("Author does not exist."));
  else {
    try {
      await packages.create(author, packageName, repository);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof PackageAlreadyExistsError)
        res.status(503).json(errorBody("Package already exists."));
      else {
        console.error(err);
        res.status(500).json(errorBody("Failed to fetch package."));
      }
    }
  }
});

// Delete a package
router.delete("/packages/:author", async (req, res) => {
  const packageName = req.body.name.toLowerCase();
  const author = await prisma.author.findFirst({
    where: { name: req.params.author.toLowerCase() }
  });

  if (!author)
    res.status(404).json(errorBody("Author does not exist."));
  else {
    const packageData = await prisma.package.findFirst({
      where: { author: author }
    });

    if (packageData) {
      await prisma.package.delete({
        where: { name: packageName }
      });

      res.json({ success: true });
    } else
      res.status(503).json(errorBody("Package does not exist."));
  }
});

app.use("/api", router);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});