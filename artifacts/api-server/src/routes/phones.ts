import { Router, type IRouter } from "express";
import { eq, and, ilike, sql } from "drizzle-orm";
import { db, phonesTable } from "@workspace/db";
import {
  ListPhonesQueryParams,
  CreatePhoneBody,
  GetPhoneParams,
  GetPhoneResponse,
  GetFeaturedPhonesResponse,
  GetPhoneStatsResponse,
  ListPhonesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/phones/featured", async (_req, res): Promise<void> => {
  const phones = await db
    .select()
    .from(phonesTable)
    .where(eq(phonesTable.featured, true))
    .limit(6);
  res.json(GetFeaturedPhonesResponse.parse(phones));
});

router.get("/phones/stats", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      totalProducts: sql<number>`count(*)::int`,
      totalBrands: sql<number>`count(distinct ${phonesTable.brand})::int`,
      minPrice: sql<number>`min(${phonesTable.price})`,
      maxPrice: sql<number>`max(${phonesTable.price})`,
      inStockCount: sql<number>`count(*) filter (where ${phonesTable.inStock} = true)::int`,
    })
    .from(phonesTable);

  res.json(
    GetPhoneStatsResponse.parse({
      totalProducts: stats?.totalProducts ?? 0,
      totalBrands: stats?.totalBrands ?? 0,
      minPrice: stats?.minPrice ?? 0,
      maxPrice: stats?.maxPrice ?? 0,
      inStockCount: stats?.inStockCount ?? 0,
    })
  );
});

router.get("/phones", async (req, res): Promise<void> => {
  const parsed = ListPhonesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoryId, search, featured } = parsed.data;
  const conditions = [];

  if (categoryId != null) {
    conditions.push(eq(phonesTable.categoryId, categoryId));
  }
  if (search) {
    conditions.push(ilike(phonesTable.name, `%${search}%`));
  }
  if (featured != null) {
    conditions.push(eq(phonesTable.featured, featured));
  }

  const phones = await db
    .select()
    .from(phonesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(phonesTable.id);

  res.json(ListPhonesResponse.parse(phones));
});

router.post("/phones", async (req, res): Promise<void> => {
  const parsed = CreatePhoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [phone] = await db.insert(phonesTable).values(parsed.data).returning();
  res.status(201).json(GetPhoneResponse.parse(phone));
});

router.delete("/phones/:id", async (req, res): Promise<void> => {
  if (!req.session?.userId || req.session?.role !== "admin") {
    res.status(403).json({ error: "Зөвшөөрөлгүй" });
    return;
  }
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(phonesTable).where(eq(phonesTable.id, id));
  res.sendStatus(204);
});

router.get("/phones/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPhoneParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [phone] = await db
    .select()
    .from(phonesTable)
    .where(eq(phonesTable.id, params.data.id));

  if (!phone) {
    res.status(404).json({ error: "Phone not found" });
    return;
  }

  res.json(GetPhoneResponse.parse(phone));
});

export default router;
