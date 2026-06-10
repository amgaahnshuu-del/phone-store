import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type AuthUser = {
  id: number;
  username: string;
  role: string;
};

function sendAuthSession(req: Request, res: Response, user: AuthUser): void {
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.username = user.username;

  req.session.save((err) => {
    if (err) {
      logger.error({ err }, "Failed to save auth session");
      res.status(500).json({ error: "Session хадгалах үед алдаа гарлаа" });
      return;
    }

    res.json({ id: user.id, username: user.username, role: user.role });
  });
}

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      res.status(400).json({ error: "Нэвтрэх нэр болон нууц үг шаардлагатай" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));

    if (!user) {
      res.status(401).json({ error: "Нэвтрэх нэр эсвэл нууц үг буруу байна" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Нэвтрэх нэр эсвэл нууц үг буруу байна" });
      return;
    }

    sendAuthSession(req, res, user);
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Нэвтрэх үед алдаа гарлаа" });
  }
});

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };
    const cleanUsername = username?.trim();

    if (!cleanUsername || !password) {
      res.status(400).json({ error: "Нэвтрэх нэр болон нууц үг шаардлагатай" });
      return;
    }

    if (cleanUsername.length < 3) {
      res.status(400).json({ error: "Нэвтрэх нэр дор хаяж 3 тэмдэгт байх ёстой" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой" });
      return;
    }

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, cleanUsername));

    if (existingUser) {
      res.status(409).json({ error: "Энэ нэвтрэх нэр бүртгэлтэй байна" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        username: cleanUsername,
        password: hashedPassword,
        role: "user",
      })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        role: usersTable.role,
      });

    if (!createdUser) {
      res.status(500).json({ error: "Бүртгэл үүсгэх үед алдаа гарлаа" });
      return;
    }

    sendAuthSession(req, res, createdUser);
  } catch (err) {
    logger.error({ err }, "Registration failed");
    res.status(500).json({ error: "Бүртгүүлэх үед алдаа гарлаа" });
  }
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.sendStatus(204);
  });
});

router.get("/auth/me", (req, res): void => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Нэвтрээгүй байна" });
    return;
  }

  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
  });
});

export default router;
