import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export default class AuthenticationService {
  constructor(
    private readonly prisma: PrismaClient
  ) {}

  public async generateToken(authorId: string): Promise<string> {
    const token = uuidv4();

    const EXPIRATION_HOURS = 24
    await this.prisma.authenticationToken.create({
      data: {
        authorId: authorId,
        token: token,
        timeExpires: (Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000) / 1000
      },
    });

    return token;
  }

  public async verify(token: string): Promise<boolean> {
    const tokenData = await this.prisma.authenticationToken.findUnique({
      where: { id: token }
    });

    if (!tokenData || tokenData.timeExpires < (Date.now() / 1000))
      return false;

    return true;
  }
}