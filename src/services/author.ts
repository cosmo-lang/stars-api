import { Author, Package, Prisma, PrismaClient } from "@prisma/client";

export class AuthorService {
  public constructor(
    private readonly prisma: PrismaClient
  ) {}

  public async exists(name: string): Promise<boolean> {
    return !!(await this.fetch(name));
  }

  public fetch(name: string): Prisma.Prisma__AuthorClient<Author | null, null> {
    return this.prisma.author.findFirst({
      where: { name: name },
      include: { packages: true }
    })
  }

  public async create(name: string): Promise<void> {
    await this.prisma.author.create({
      data: {
        name: name,
        packages: { create: [] }
      }
    });
  }

  /**
   * Warning: An author with the name `name` must exist
   * to call this method.
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
    await this.prisma.author.delete({
      where: { name: name }
    });
  }
}