import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "oyunerdene";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Oyunerdene99911";

async function ensureAdminAccount(): Promise<void> {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const result = await pool.query(
    `
      insert into users (username, password, role)
      values ($1, $2, 'admin')
      on conflict (username) do update
      set password = excluded.password,
          role = 'admin'
      returning id, username, role
    `,
    [ADMIN_USERNAME, hashedPassword],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Failed to create or update the admin account.");
  }

  console.log(
    `Admin account ready: ${user.username} (${user.role}) [id=${user.id}]`,
  );
}

ensureAdminAccount()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
