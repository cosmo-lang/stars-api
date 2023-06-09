import { PrismaClient } from "@prisma/client";
import { AuthorService } from "./services/author";
import { PackageService } from "./services/package";
import AuthorRouter from "./routers/author";
import PackageRouter from "./routers/package";
import BaseRouter from "./routers/base-router";
import express from "express";

const prisma = new PrismaClient;
const authors = new AuthorService(prisma);
const packages = new PackageService(prisma, authors);
const app = express();
const port = 3030;

app.use(express.json());
const router = express.Router();

const routers: BaseRouter[] = [];
routers.push(new AuthorRouter(authors, router));
routers.push(new PackageRouter(authors, packages, router));

for (const router of routers)
  router.route();

app.use("/api/packages", router);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});