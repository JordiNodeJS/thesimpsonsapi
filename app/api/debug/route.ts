
import { pool } from "@/app/_lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const info = await pool.query("SELECT current_database(), current_schema(), current_user, version()");
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      LIMIT 10
    `);
    
    let charCount = "N/A";
    try {
      const res = await pool.query("SELECT COUNT(*) FROM the_simpson.characters");
      charCount = res.rows[0].count;
    } catch (e: any) {
      charCount = "Error: " + e.message;
    }

    return NextResponse.json({
      connection: info.rows[0],
      tables: tables.rows,
      charCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlStart: process.env.DATABASE_URL?.substring(0, 20) + "..."
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
