import { Router } from "express";
import { AuthorService } from "../services/author";
import {
  AuthorAuthenticationFailedError,
  PackageAlreadyExistsError,
  PackageService
} from "../services/package";

import { assertBodyField, errorBody } from "../util";
import BaseRouter from "./base-router";

export default class PackageRouter implements BaseRouter {
  public constructor(
    private readonly authors: AuthorService,
    private readonly packages: PackageService,
    private readonly router: Router
  ) {}

  public route() {
    // Fetch package
    this.router.get("/:author/:name", async (req, res) => {
      try {
        const authorName = req.params.author.toLowerCase();

        if (await this.authors.exists(authorName)) {
          const pkg = await this.packages.fetch(authorName, req.params.name)

          if (!pkg)
            res.status(404).json(errorBody("Package does not exist."));
          else
            res.status(200).json({ success: true, result: pkg });
        } else
          res.status(404).json(errorBody("Author does not exist."));
      } catch (err) {
        console.error(err);
        res.status(500).json(errorBody("Failed to fetch package."));
      }
    });

    // Add package
    this.router.post("/:author",  async (req, res) => {
      if (!assertBodyField(req, res, "packageName")) return;
      if (!assertBodyField(req, res, "authorPassword")) return;
      if (!assertBodyField(req, res, "repository")) return;

      const packageName: string = req.body.packageName.toLowerCase();
      const repository: string = req.body.repository;
      const authorPassword: string = req.body.authorPassword;
      const authorName = req.params.author.toLowerCase();

      if (await this.authors.exists(authorName))
        try {
          await this.packages.create(authorName, authorPassword, packageName, repository);
          res.status(200).json({ success: true });
        } catch (err) {
          if (err instanceof PackageAlreadyExistsError)
            res.status(403).json(errorBody("Package already exists."));
          if (err instanceof AuthorAuthenticationFailedError)
            res.status(401).json(errorBody("Failed to authenticate."));
          else {
            console.error(err);
            res.status(500).json(errorBody("Failed to fetch package."));
          }
        }
      else
        res.status(404).json(errorBody("Author does not exist."));
    });

    // Delete a package
    this.router.delete("/:author", async (req, res) => {
      if (!assertBodyField(req, res, "packageName")) return;

      const packageName = req.body.packageName.toLowerCase();
      const authorName = req.params.author.toLowerCase();

      if (await this.authors.exists(authorName)) {
        const pkg = await this.packages.fetch(authorName, packageName);

        if (pkg) {
          await this.packages.delete(authorName, packageName);
          res.status(200).json({ success: true });
        } else
          res.status(403).json(errorBody("Package does not exist."));
      } else
        res.status(404).json(errorBody("Author does not exist."));
    });
  }
}