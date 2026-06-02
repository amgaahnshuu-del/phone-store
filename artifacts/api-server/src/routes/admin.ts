import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, phonesTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session.userId || req.session.role !== "admin") {
    res.status(403).json({ error: "Зөвшөөрөлгүй" });
    return;
  }
  next();
};

router.get("/admin/orders", requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.id);

  const result = await Promise.all(
    orders.map(async (order) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId));
      const items = await db
        .select({
          id: orderItemsTable.id,
          phoneId: orderItemsTable.phoneId,
          quantity: orderItemsTable.quantity,
          price: orderItemsTable.price,
          phone: phonesTable,
        })
        .from(orderItemsTable)
        .innerJoin(phonesTable, eq(orderItemsTable.phoneId, phonesTable.id))
        .where(eq(orderItemsTable.orderId, order.id));

      return {
        ...order,
        createdAt: order.createdAt.toISOString(),
        username: user?.username ?? null,
        items,
      };
    })
  );

  res.json(result);
});

router.patch("/admin/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { status } = req.body as { status: string };

  if (!["pending", "accepted", "rejected"].includes(status)) {
    res.status(400).json({ error: "Буруу статус" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Захиалга олдсонгүй" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId));
  const items = await db
    .select({
      id: orderItemsTable.id,
      phoneId: orderItemsTable.phoneId,
      quantity: orderItemsTable.quantity,
      price: orderItemsTable.price,
      phone: phonesTable,
    })
    .from(orderItemsTable)
    .innerJoin(phonesTable, eq(orderItemsTable.phoneId, phonesTable.id))
    .where(eq(orderItemsTable.orderId, updated.id));

  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    username: user?.username ?? null,
    items,
  });
});

export default router;
