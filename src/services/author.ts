import { Author, Package, Prisma, PrismaClient } from "@prisma/client";
import AuthenticationService from "./authentication";
import * as bcrypt from "bcrypt"

export class AuthorService {
  public constructor(
    private readonly prisma: PrismaClient,
    private readonly auth: AuthenticationService
  ) {}

  public async exists(name: string): Promise<boolean> {
    return !!(await this.fetch(name));
  }

  public fetch(name: string): Prisma.Prisma__AuthorClient<Author | null, null> {
    return this.prisma.author.findUnique({
      where: { name },
      include: { packages: true }
    })
  }

  public async isAuthenticated(name: string, password: string): Promise<boolean> {
    const author = await this.fetch(name);
    if (!author) return false;
    if (!bcrypt.compareSync(password, author.passwordHash)) return false;
    return true;
  }

  public async create(name: string, email: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.author.create({
      data: {
        name,
        email,
        passwordHash,
        timeCreated: Date.now() / 1000,
        packages: { create: [] }
      }
    });
  }

  /**
   * Warning: An author with the name `name` must
   * exist to call this method.
   */
  public async update(name: string, newPackages: Package[]): Promise<void> {
    const authorPromise = this.fetch(name);
    const author = (await authorPromise)!;

    await this.prisma.author.update({
      where: { id: author.id },
      data: {
        packages: {
          set: newPackages.map(pkg => ({
            id: pkg.id
          })).concat(
            ((await authorPromise.packages({ where: { authorId: author.id } })) ?? []).map(pkg => ({
              id: pkg.id
            }))
          )
        }
      }
    });
  }

  public async delete(name: string): Promise<void> {
    await this.prisma.package.deleteMany({
      where: { author: { name } }
    });
    await this.prisma.author.delete({
      where: { name }
    });
  }
}