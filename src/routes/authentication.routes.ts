import { FastifyInstance } from "fastify";
import { login, register } from "../controllers/authentication.controller";

export async function authenticationRoutes(app: FastifyInstance) {
  app.post("/auth/register", register);

  app.post("/auth/login", login);
}
