import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartItemsTable, phonesTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Нэвтрээгүй байна" });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, req.session.userId))
    .orderBy(ordersTable.id);

  const result = await Promise.all(
    orders.map(async (order) => {
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
        username: req.session.username,
        items,
      };
    })
  );

  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Нэвтрээгүй байна" });
    return;
  }

  const cartItems = await db
    .select({
      id: cartItemsTable.id,
      phoneId: cartItemsTable.phoneId,
      quantity: cartItemsTable.quantity,
      phone: phonesTable,
    })
    .from(cartItemsTable)
    .innerJoin(phonesTable, eq(cartItemsTable.phoneId, phonesTable.id));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Сагс хоосон байна" });
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + item.phone.price * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({ userId: req.session.userId, total, status: "pending" })
    .returning();

  await db.insert(orderItemsTable).values(
    cartItems.map((item) => ({
      orderId: order.id,
      phoneId: item.phoneId,
      quantity: item.quantity,
      price: item.phone.price,
    }))
  );

  await db.delete(cartItemsTable);

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

  res.status(201).json({
    ...order,
    createdAt: order.createdAt.toISOString(),
    username: req.session.username,
    items,
  });
});

export default router;
