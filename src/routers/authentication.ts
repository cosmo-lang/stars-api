import { Router } from "express";
import { AuthorService } from "../services/author";
import { errorBody } from "../util";
import AuthenticationService from "../services/authentication";
import BaseRouter from "./base-router";

export default class AuthenticationRouter implements BaseRouter {
  public constructor(
    private readonly auth: AuthenticationService,
    private readonly authors: AuthorService,
    private readonly router: Router
  ) {}

  public route(): void {
    // Fetch authentication token
    this.router.get("/auth/:author", async (req, res) => {
      try {
        const username = req.params.author.toLowerCase();
        const author = await this.authors.fetch(username);

        if (!author)
          res.status(404).json(errorBody("Author does not exist."));
        else {
          const token = await this.auth.generateToken(author.id);
          res.status(200).json({ success: true, result: { authenticationToken: token } });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json(errorBody("Failed to fetch author."));
      }
    });
  }
}