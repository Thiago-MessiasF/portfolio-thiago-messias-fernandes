import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { churches, users, events } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

dotenv.config();

const poolConnection = await mysql.createPool({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(poolConnection, { mode: "default", schema: { churches, users, events } });

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar primeira igreja
    const existingChurches = await db.select().from(churches).limit(1);

    let churchId = 1;
    if (existingChurches.length === 0) {
      const result = await db.insert(churches).values({
        name: "ChurchStream",
        slug: "churchstream",
        description: "Sua comunidade de fé conectada",
        primaryColor: "#7c3aed",
        secondaryColor: "#6d28d9",
        accentColor: "#a78bfa",
      });
      churchId = result[0]?.insertId || 1;
    } else {
      churchId = existingChurches[0].id;
    }
    console.log(`✅ Igreja criada/atualizada: ID ${churchId}`);

    // Associar usuário admin à igreja
    await db
      .update(users)
      .set({ churchId })
      .where(eq(users.role, "admin"));
    console.log(`✅ Usuário admin associado à igreja`);

    console.log("\n✨ Seed concluído com sucesso!");
    console.log(`   Igreja ID: ${churchId}`);
    console.log(`   Acesse: http://localhost:3000`);
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    throw error;
  } finally {
    await poolConnection.end();
  }
}

seed().catch(console.error);
