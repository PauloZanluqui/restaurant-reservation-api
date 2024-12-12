import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { authenticationRoutes } from "./routes/authentication.routes";
import { tablesRoutes } from "./routes/tables.routes";
import { reservationsRoutes } from "./routes/reservations.routes";

const app = fastify();

app.register(fastifyJwt, {
  secret: "ChaveSecreta12345Ç"
})

app.register(cors, {
  origin: "*",
});

app.register(authenticationRoutes)
app.register(tablesRoutes)
app.register(reservationsRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: fromZodError(error) })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
})

app.listen({port: 3000}).then(() => { 
  console.log("Server is listening on port 3000");  
});