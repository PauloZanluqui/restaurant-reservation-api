import { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function listReservations(req: FastifyRequest, res: FastifyReply) {
  const searchReservationsQuerySchema = z.object({
    status: z.enum(["active", "canceled"]).optional(),
  });

  const { status } = searchReservationsQuerySchema.parse(req.query);

  const reservations = await prisma.reservations.findMany({
    where: {
      userId: Number(req.user.sub),
      status: status? status : undefined,
    },
    include: {
      table: {
        select: {
          tableNumber: true,
        },
      },
    },
    orderBy: {
      reservationDate: "asc",
    },
  });

  return res.send({
    reservations,
  });
}

export async function createReservation(req: FastifyRequest, res: FastifyReply) {
  const updateReservationBodySchema = z.object({
    tableNumber: z.number().positive().optional(),
    peopleQuantity: z.number().positive(),
    reservationDate: z.string(),
  });

  const { tableNumber, peopleQuantity, reservationDate } = updateReservationBodySchema.parse(req.body);

  // Converte a string de data para o tipo Date
  const parsedReservationDate = new Date(reservationDate);

  if (parsedReservationDate < new Date()) {
    return res.status(400).send({ error: "Reservation date cannot be in the past" });
  }

  const table = await prisma.table.findFirst({
    where: {
      tableNumber,
    },
  });

  if (!table) {
    return res.status(404).send({ error: "Table not found" });
  }

  if (table.capacity < peopleQuantity) {
    return res.status(400).send({ error: "Not enough capacity in the table" });
  }

  const existingReservation = await prisma.reservations.findFirst({
    where: {
      tableId: table.id,
      reservationDate: parsedReservationDate,
    },
  });

  if (existingReservation) {
    return res.status(409).send({ error: "Reservation already exists for this table and date" });
  }

  await prisma.table.update({
    where: {
      id: table.id,
    },
    data: {
      status: "reserved",
    },
  });

  await prisma.reservations.create({
    data: {
      userId: Number(req.user.sub),
      tableId: table.id,
      reservationDate: parsedReservationDate,
      peopleQuantity,
      status: "active",
    },
  });

  return res.status(201).send();
}

export async function cancelReservation(req: FastifyRequest, res: FastifyReply) {
  const updateReservationParamsSchema = z.object({
    id: z.coerce.number(),
  });

  const { id } = updateReservationParamsSchema.parse(req.params);

  const reservation = await prisma.reservations.findUnique({
    where: {
      id,
    },
  });

  if (!reservation) {
    return res.status(404).send({ error: "Reservation not found" });
  }

  if (reservation.userId !== Number(req.user.sub)) {
    return res.status(403).send({ error: "User without permission" });
  }

  await prisma.reservations.update({
    where: {
      id,
    },
    data: {
      status: "canceled",
    },
  });

  let hasAnyMoreReservationsOnTable = await prisma.reservations.findFirst({
    where: {
      tableId: reservation.tableId,
      status: "active",
    }
  })

  if (hasAnyMoreReservationsOnTable == null) {
    await prisma.table.update({
      where: {
        id: reservation.tableId,
      },
      data: {
        status: "available",
      },
    });
  }

  return res.send();
}
