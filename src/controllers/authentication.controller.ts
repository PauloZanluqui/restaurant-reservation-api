import { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import { compare, hash } from "bcryptjs";

export async function login(req: FastifyRequest, res: FastifyReply) {
  const loginUserBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const { email, password } = loginUserBodySchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).send({ error: "Invalid credentials" });
  }

  const passwordMatches = await compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).send({ error: "Invalid credentials" });
  }

  const token = await res.jwtSign(
    {},
    {
      sign: {
        sub: user.id.toString(),
        expiresIn: "1d",
      },
    }
  );

  return res.send({ token });
}

export async function register(req: FastifyRequest, res: FastifyReply) {
  const registerUserBodySchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["client", "admin"]),
  });

  const { name, email, password, role } = registerUserBodySchema.parse(req.body);

  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userWithSameEmail) {
    return res.status(409).send({ error: "User already exists" });
  }

  const passwordHash = await hash(password, 8);

  await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
    },
  });

  return res.status(201).send();
}
