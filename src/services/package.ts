import { Package, PrismaClient } from "@prisma/client";
import { AuthorService } from "./author";
import AuthenticationService from "./authentication";

export class PackageAlreadyExistsError extends Error {}
export class AuthorAuthenticationFailedError extends Error {}

export class PackageService {
  public constructor(
    private readonly prisma: PrismaClient,
    private readonly authors: AuthorService,
    private readonly auth: AuthenticationService
  ) {}

  public async fetch(authorName: string, name: string): Promise<Package | null> {
    const author = await this.authors.fetch(authorName);
    if (!author) return null;

    return this.prisma.package.findFirst({
      where: {
        name,
        authorId: author.id
      }
    });
  }

  public async create(
    authorName: string,
    authorPassword: string,
    name: string,
    repository: string,
    token: string
  ): Promise<void> {

    const packageData = await this.fetch(authorName, name);
    if (packageData)
      throw new PackageAlreadyExistsError;

    const passwordMatches = await this.authors.isAuthenticated(authorName, authorPassword);
    if (!passwordMatches || !await this.auth.verify(token))
      throw new AuthorAuthenticationFailedError;

    const author = (await this.authors.fetch(authorName))!
    await this.authors.update(authorName, [
      await this.prisma.package.create({
        data: {
          name: name,
          fullName: author.name + "/" + name,
          repository: repository,
          timeCreated: Date.now() / 1000,
          author: {
            connect: { id: author.id }
          }
        },
      })
    ]);
  }

  public async delete(authorName: string, name: string): Promise<void> {
    const packageData = await this.fetch(authorName, name);
    await this.prisma.package.delete({
      where: { id: packageData!.id }
    });
  }
}