import { Router } from "express";
import { AuthorService } from "../services/author";
import { assertBodyField, errorBody } from "../util";
import BaseRouter from "./base-router";

export default class AuthorRouter implements BaseRouter {
  public constructor(
    private readonly authors: AuthorService,
    private readonly router: Router
  ) {}

  public route(): void {
    // Fetch author
    this.router.get("/:author", async (req, res) => {
      try {
        const authorName = req.params.author.toLowerCase();
        const author = await this.authors.fetch(authorName);

        if (!author)
          res.status(404).json(errorBody("Author does not exist."));
        else
          res.status(200).json({ success: true, result: author });
      } catch (err) {
        console.error(err);
        res.status(500).json(errorBody("Failed to fetch author."));
      }
    });

    // Add author
    this.router.post("/", async (req, res) => {
      if (!assertBodyField(req, res, "authorName")) return;
      if (!assertBodyField(req, res, "email")) return;
      if (!assertBodyField(req, res, "password")) return;

      const authorName: string = req.body.authorName.toLowerCase()
      const email: string = req.body.email
      const password: string = req.body.password
      const author = await this.authors.fetch(authorName);

      if (!author) {
        await this.authors.create(authorName, email, password);
        res.status(200).json({ success: true });
      } else
        res.status(403).json(errorBody("Author already exists."));
    });

    // Delete author
    this.router.delete("/", async (req, res) => {
      if (!assertBodyField(req, res, "authorName")) return;

      const authorName: string = req.body.authorName.toLowerCase()
      const author = await this.authors.fetch(authorName);

      if (author) {
        await this.authors.delete(authorName);
        res.status(200).json({ success: true });
      } else
        res.status(404).json(errorBody("Author does not exist."));
    });
  }
}