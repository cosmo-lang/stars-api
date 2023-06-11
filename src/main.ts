import { PrismaClient } from "@prisma/client";
import { AuthorService } from "./services/author";
import { PackageService } from "./services/package";
import AuthenticationService from "./services/authentication";

import AuthorRouter from "./routers/author";
import PackageRouter from "./routers/package";
import AuthenticationRouter from "./routers/authentication";
import BaseRouter from "./routers/base-router";
import express from "express";

const prisma = new PrismaClient;
const auth = new AuthenticationService(prisma);
const authors = new AuthorService(prisma, auth);
const packages = new PackageService(prisma, authors, auth);
const app = express();
const port = 3030;

app.use(express.json());
const router = express.Router();

const routers: BaseRouter[] = [
  new AuthenticationRouter(auth, authors, router),
  new AuthorRouter(authors, router),
  new PackageRouter(authors, packages, router)
];

for (const router of routers)
  router.route();

app.use("/api/packages", router);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});