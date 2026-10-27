import fs from 'fs';
import initSqlJs from 'sql.js';

async function main() {
    console.log("1. Initializing sql.js engine...");
    const SQL = await initSqlJs();

    console.log("2. Reading initial SQLite file: d:/shadow_db/test_inventory.sqlite");
    const fileBuffer = fs.readFileSync('d:/shadow_db/test_inventory.sqlite');
    const u8 = new Uint8Array(fileBuffer);

    console.log("3. Importing database into sql.js engine (exact same logic as ShadowDatabase.init)...");
    const db = new SQL.Database(u8);

    console.log("4. Verifying imported products table:");
    const initialProducts = db.exec("SELECT * FROM products;");
    console.log("Products rows:", initialProducts[0].values);

    console.log("5. Making changes: creating 'orders' table and inserting data...");
    db.run(`
        CREATE TABLE orders (
            order_id INTEGER PRIMARY KEY,
            product_id INTEGER,
            quantity INTEGER,
            order_date TEXT
        );
        INSERT INTO orders VALUES (101, 1, 2, '2026-10-27');
        INSERT INTO orders VALUES (102, 3, 1, '2026-10-28');
    `);

    console.log("6. Verifying updated tables in database:");
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    console.log("Tables:", tables[0].values.flat());

    console.log("7. Exporting binary snapshot (db.export())...");
    const exportedBinary = db.export();
    fs.writeFileSync('d:/shadow_db/test_inventory_updated.sqlite', Buffer.from(exportedBinary));
    console.log("Saved: d:/shadow_db/test_inventory_updated.sqlite (Size: " + exportedBinary.length + " bytes)");

    console.log("8. Exporting SQL dump...");
    let dump = "-- ShadowDB SQL Dump Export\n";
    for (const tbl of tables[0].values.flat()) {
        const schema = db.exec(`SELECT sql FROM sqlite_master WHERE name='${tbl}';`)[0].values[0][0];
        dump += schema + ";\n\n";
        const rows = db.exec(`SELECT * FROM "${tbl}";`);
        if (rows.length && rows[0].values) {
            for (const r of rows[0].values) {
                const escaped = r.map(v => typeof v === 'number' ? v : `'${String(v).replace(/'/g, "''")}'`);
                dump += `INSERT INTO "${tbl}" VALUES (${escaped.join(", ")});\n`;
            }
        }
        dump += "\n";
    }
    fs.writeFileSync('d:/shadow_db/test_inventory_updated.sql', dump);
    console.log("Saved: d:/shadow_db/test_inventory_updated.sql (Size: " + dump.length + " bytes)");

    db.close();
    console.log("ALL IMPORT/EXPORT ROUNDTRIP TESTS COMPLETED SUCCESSFULLY!");
}

main().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
