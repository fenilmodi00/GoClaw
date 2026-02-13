
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        const result = await db.all(sql`PRAGMA table_info(users)`);
        console.log("Users table columns:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

main();
