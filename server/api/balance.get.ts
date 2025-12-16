import { prisma } from "../../prisma/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = Number(query.limit) || 500;

  const logs = await prisma.balanceLog.findMany({
    orderBy: { timestamp: "asc" },
    take: limit,
  });

  return logs.map((log) => ({
    time: Math.floor(log.timestamp.getTime() / 1000),
    value: log.balance,
  }));
});
