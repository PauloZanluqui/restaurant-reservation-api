import { FastifyInstance } from "fastify";
import { createTable, deleteTable, listTables, updateTable } from "../controllers/tables.controller";

export async function tablesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      res.status(401).send({ error: "Unauthorized" });
    }
  });

  app.get("/tables", listTables);

  app.post("/tables", createTable);

  app.patch("/tables/:id", updateTable);

  app.delete("/tables/:id", deleteTable);
}
