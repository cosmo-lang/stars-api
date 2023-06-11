import { Package, PrismaClient } from "@prisma/client";
import { AuthorService } from "./author";
import * as bcrypt from "bcrypt";

export class PackageAlreadyExistsError extends Error {}
export class AuthorAuthenticationFailedError extends Error {}

export class PackageService {
  public constructor(
    private readonly prisma: PrismaClient,
    private readonly authors: AuthorService
  ) {}

  public async fetch(authorName: string, name: string): Promise<Package | null> {
    const author = await this.authors.fetch(authorName);
    if (!author) return null;

    return this.prisma.package.findFirst({
      where: {
        name: name,
        authorId: author.id
      }
    });
  }

  public async create(authorName: string, authorPassword: string, name: string, repository: string): Promise<void> {
    const packageData = await this.fetch(authorName, name);
    if (packageData)
      throw new PackageAlreadyExistsError;

    const author = await this.authors.fetch(authorName);
    if (author && !bcrypt.compareSync(authorPassword, author.passwordHash))
      throw new AuthorAuthenticationFailedError;

    await this.authors.update(authorName, [
      await this.prisma.package.create({
        data: {
          name: name,
          repository: repository,
          author: {
            connect: { id: (await this.authors.fetch(authorName))!.id }
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