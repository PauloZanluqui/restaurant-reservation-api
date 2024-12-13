import { FastifyInstance } from "fastify";
import { cancelReservation, createReservation, listReservations } from "../controllers/reservations.controller";

export async function reservationsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      res.status(401).send({ error: "Unauthorized" });
    }
  });
  
  app.get("/reservations", listReservations)

  app.post("/reservations", createReservation)

  app.patch("/reservations/:id/cancel", cancelReservation)
}