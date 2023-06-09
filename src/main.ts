import { PrismaClient } from "@prisma/client";
import { PackageAlreadyExistsError, PackageService } from "./services/package-service";
import { AuthorService } from "./services/author-service";
import { assertBodyField, errorBody } from "./util";
import express from "express";

const prisma = new PrismaClient;
const authors = new AuthorService(prisma);
const packages = new PackageService(prisma, authors);
const app = express();
const port = 3030;

app.use(express.json());
const router = express.Router();

// Fetch author
router.get("/packages/:author", async (req, res) => {
  try {
    const authorName = req.params.author.toLowerCase();
    const author = await authors.fetch(authorName);

    if (!author)
      res.status(404).json(errorBody("Author does not exist."));
    else
      res.json({ success: true, result: author });
  } catch (err) {
    console.error(err);
    res.status(500).json(errorBody("Failed to fetch author."));
  }
});

// Add author
router.post("/packages", async (req, res) => {
  if (!assertBodyField(req, res, "authorName")) return;

  const authorName: string = req.body.authorName.toLowerCase()
  const author = await authors.fetch(authorName);

  if (!author) {
    await authors.create(authorName);
    res.json({ success: true });
  } else
    res.status(503).json(errorBody("Author already exists."));
});

// Delete author
router.delete("/packages", async (req, res) => {
  if (!assertBodyField(req, res, "authorName")) return;

  const authorName: string = req.body.authorName.toLowerCase()
  const author = await authors.fetch(authorName);

  if (author) {
    await authors.delete(authorName);
    res.json({ success: true });
  } else
    res.status(404).json(errorBody("Author does not exist."));
});

// Fetch package
router.get("/packages/:author/:name", async (req, res) => {
  try {
    const authorName = req.params.author.toLowerCase();

    if (await authors.exists(authorName)) {
      const pkg = await packages.fetch(authorName, req.params.name)

      if (!pkg)
        res.status(404).json(errorBody("Package does not exist."));
      else
        res.json({ success: true, result: pkg });
    } else
      res.status(404).json(errorBody("Author does not exist."));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorBody("Failed to fetch package."));
  }
});

// Add package
router.post("/packages/:author",  async (req, res) => {
  if (!assertBodyField(req, res, "packageName")) return;
  if (!assertBodyField(req, res, "repository")) return;

  const packageName: string = req.body.packageName.toLowerCase();
  const repository: string = req.body.repository;
  const authorName = req.params.author.toLowerCase();

  if (await authors.exists(authorName))
    try {
      await packages.create(authorName, packageName, repository);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof PackageAlreadyExistsError)
        res.status(503).json(errorBody("Package already exists."));
      else {
        console.error(err);
        res.status(500).json(errorBody("Failed to fetch package."));
      }
    }
  else
    res.status(404).json(errorBody("Author does not exist."));
});

// Delete a package
router.delete("/packages/:author", async (req, res) => {
  if (!assertBodyField(req, res, "packageName")) return;

  const packageName = req.body.packageName.toLowerCase();
  const authorName = req.params.author.toLowerCase();

  if (await authors.exists(authorName)) {
    const pkg = await packages.fetch(authorName, packageName);

    if (pkg) {
      await packages.delete(authorName, packageName);
      res.json({ success: true });
    } else
      res.status(503).json(errorBody("Package does not exist."));
  } else
    res.status(404).json(errorBody("Author does not exist."));
});

app.use("/api", router);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});