import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function tablesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      res.status(401).send({ error: "Unauthorized" });
    }
  });

  app.get("/tables", async (req, res) => {
    const tables = await prisma.table.findMany();

    return res.send({
      tables,
    });
  });

  app.post("/tables", async (req, res) => {
    const createTableBodySchema = z.object({
      tableNumber: z.number().positive(),
      capacity: z.number().positive(),
      status: z.enum(["available", "reserved", "inactive"]),
    });

    const { tableNumber, capacity, status } = createTableBodySchema.parse(req.body);

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: Number(req.user.sub)
      }
    })

    if (user.role != "admin") {
      return res.status(403).send({ error: "User without permission" });
    }

    await prisma.table.create({
      data: {
        tableNumber,
        capacity,
        status,
      },
    });

    return res.status(201).send();
  });

  app.patch("/tables/:id", async (req, res) => {
    const updateTableParamsSchema = z.object({
      id: z.coerce.number(),
    });

    const updateTableBodySchema = z.object({
      tableNumber: z.number().positive().optional(),
      capacity: z.number().positive().optional(),
      status: z.enum(["available", "reserved", "inactive"]).optional(),
    });

    const { id } = updateTableParamsSchema.parse(req.params);
    const { tableNumber, capacity, status } = updateTableBodySchema.parse(req.body);

    const table = await prisma.table.findUnique({
      where: {
        id,
      },
    });

    if (!table) {
      return res.status(404).send({ error: "Table not found" });
    }

    await prisma.table.update({
      where: {
        id,
      },
      data: {
        tableNumber: tableNumber?? table.tableNumber,
        capacity: capacity?? table.capacity,
        status: status?? table.status,
      },
    }); 

    return res.send();
  })

  app.delete("/tables/:id", async (req, res) => {
    const deleteTableParamsSchema = z.object({
      id: z.coerce.number(),
    });

    const { id } = deleteTableParamsSchema.parse(req.params);

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: Number(req.user.sub)
      }
    })
    
    if (user.role != "admin") {
      return res.status(403).send({ error: "User without permission" });
    }

    const table = await prisma.table.delete({
      where: {
        id,
      },
    });

    if (!table) {
      return res.status(404).send({ error: "Table not found" });
    }

    return res.status(204).send();
  });
}
