import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let SQL = null;

export async function getSqlEngine() {
    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: () => wasmUrl
        });
    }
    return SQL;
}

export class ShadowDatabase {
    constructor() {
        this.db = null;
    }

    async init(binaryOrDDL = "") {
        const engine = await getSqlEngine();
        if (binaryOrDDL instanceof Uint8Array) {
            this.db = new engine.Database(binaryOrDDL);
        } else {
            this.db = new engine.Database();
            if (typeof binaryOrDDL === 'string' && binaryOrDDL.trim()) {
                this.db.run(binaryOrDDL);
            }
        }
    }

    exportSnapshot() {
        return this.db.export();
    }

    async restoreSnapshot(byteArray) {
        const engine = await getSqlEngine();
        if (this.db) {
            this.db.close();
        }
        this.db = new engine.Database(byteArray);
    }

    fork() {
        const snapshot = this.exportSnapshot();
        const forked = new ShadowDatabase();
        forked.db = new SQL.Database(snapshot);
        return forked;
    }

    executeSandbox(sqlQuery) {
        const startTime = performance.now();
        try {
            const upper = sqlQuery.toUpperCase();
            const hasNakedUpdate = upper.includes("UPDATE ") && !upper.includes("WHERE ");
            const hasNakedDelete = upper.includes("DELETE FROM") && !upper.includes("WHERE ");

            const results = this.db.exec(sqlQuery);
            const executionTimeMs = (performance.now() - startTime).toFixed(2);

            return {
                success: true,
                results,
                executionTimeMs,
                warnings: [
                    ...(hasNakedUpdate ? ["Warning: UPDATE statement contains no WHERE clause (affects all rows)."] : []),
                    ...(hasNakedDelete ? ["Warning: DELETE statement contains no WHERE clause (truncates table)."] : [])
                ]
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                executionTimeMs: (performance.now() - startTime).toFixed(2),
                warnings: []
            };
        }
    }

    getSchemaDDL() {
        try {
            const res = this.db.exec("SELECT sql FROM sqlite_master WHERE type IN ('table', 'index') AND name NOT LIKE 'sqlite_%';");
            if (res.length === 0 || !res[0].values) return "";
            return res[0].values.map(v => v[0]).filter(Boolean).join(";\n") + ";";
        } catch {
            return "";
        }
    }

    getTablesInfo() {
        try {
            const res = this.db.exec("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
            if (!res.length || !res[0].values) return [];

            return res[0].values.map(([name, sql]) => {
                let rowCount = 0;
                try {
                    const countRes = this.db.exec(`SELECT COUNT(*) FROM "${name}"`);
                    if (countRes.length && countRes[0].values.length) {
                        rowCount = countRes[0].values[0][0];
                    }
                } catch {
                    rowCount = 0;
                }
                return { name, sql, rowCount };
            });
        } catch {
            return [];
        }
    }

    getTableData(tableName) {
        try {
            const res = this.db.exec(`SELECT * FROM "${tableName}" LIMIT 100;`);
            if (!res.length) {
                const pragmaRes = this.db.exec(`PRAGMA table_info("${tableName}");`);
                const columns = pragmaRes.length ? pragmaRes[0].values.map(v => v[1]) : [];
                return { columns, values: [] };
            }
            return {
                columns: res[0].columns,
                values: res[0].values
            };
        } catch (err) {
            return { columns: [], values: [], error: err.message };
        }
    }

    getTableStructure(tableName) {
        try {
            const res = this.db.exec(`PRAGMA table_info("${tableName}");`);
            if (!res.length || !res[0].values) return [];
            return res[0].values.map(([cid, name, type, notnull, dflt_value, pk]) => ({
                cid,
                name,
                type: type || 'TEXT',
                notnull: Boolean(notnull),
                defaultValue: dflt_value,
                isPk: Boolean(pk)
            }));
        } catch {
            return [];
        }
    }

    // Export full DB dump as SQL script
    generateSqlDump() {
        try {
            let dump = `-- ShadowDB SQL Dump\n-- Generated on ${new Date().toISOString()}\n\n`;
            const tables = this.getTablesInfo();

            for (const t of tables) {
                if (!t.sql) continue;
                dump += `${t.sql};\n\n`;
                const data = this.getTableData(t.name);
                for (const row of data.values) {
                    const escapedValues = row.map(v => {
                        if (v === null) return "NULL";
                        if (typeof v === 'number') return v;
                        return `'${String(v).replace(/'/g, "''")}'`;
                    });
                    dump += `INSERT INTO "${t.name}" VALUES (${escapedValues.join(", ")});\n`;
                }
                dump += "\n";
            }
            return dump;
        } catch (err) {
            return `-- Export failed: ${err.message}`;
        }
    }

    close() {
        if (this.db) this.db.close();
    }
}