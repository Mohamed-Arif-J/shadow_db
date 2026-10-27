import { useState, useEffect, useRef, useCallback } from 'react';
import { ShadowDatabase } from '../services/sandbox';
import {
    saveDatabaseToStorage,
    loadDatabaseFromStorage,
    listSavedDatabases,
    deleteSavedDatabase
} from '../services/dbStorage';

const INITIAL_PROJECT_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  gpa REAL,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);
INSERT INTO departments VALUES (1, 'Computer Science'), (2, 'Electronics');
INSERT INTO students VALUES (101, 'Arif', 1, 9.47), (102, 'Adhil', 1, 8.85), (103, 'Roshan', 2, 8.92);
`;

export function useDatabaseStudio() {
    const prodDbRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [databasesList, setDatabasesList] = useState([]);
    const [currentDbName, setCurrentDbName] = useState("college");
    const [schemaDDL, setSchemaDDL] = useState("");
    const [tables, setTables] = useState([]);
    const [commits, setCommits] = useState([]);
    const [activeTab, setActiveTab] = useState("studio");

    const refreshMeta = useCallback(() => {
        if (prodDbRef.current) {
            setSchemaDDL(prodDbRef.current.getSchemaDDL());
            setTables(prodDbRef.current.getTablesInfo());
        }
    }, []);

    // Save current working database snapshot into IndexedDB
    const persistCurrentDb = useCallback(async (dbInstance, name) => {
        if (!dbInstance || !name) return;
        const binary = dbInstance.exportSnapshot();
        await saveDatabaseToStorage(name, binary);
        const all = await listSavedDatabases();
        setDatabasesList(all.map(d => d.name));
    }, []);

    // Switch or load database
    const loadDatabase = useCallback(async (name) => {
        setIsReady(false);
        if (prodDbRef.current) {
            prodDbRef.current.close();
        }

        const savedBinary = await loadDatabaseFromStorage(name);
        const db = new ShadowDatabase();

        if (savedBinary) {
            await db.init(savedBinary);
        } else {
            // If brand new, init with template
            await db.init(INITIAL_PROJECT_SCHEMA);
            await persistCurrentDb(db, name);
        }

        prodDbRef.current = db;
        setCurrentDbName(name);
        refreshMeta();

        const snapshot = db.exportSnapshot();
        setCommits([
            {
                id: "c_" + Math.random().toString(36).substring(2, 9),
                message: `Database '${name}' loaded`,
                timestamp: new Date().toLocaleTimeString(),
                snapshot
            }
        ]);
        setIsReady(true);
    }, [persistCurrentDb, refreshMeta]);

    // Initial Boot
    useEffect(() => {
        async function boot() {
            const saved = await listSavedDatabases();
            let target = "college";
            if (saved.length > 0) {
                setDatabasesList(saved.map(d => d.name));
                target = saved[0].name;
            } else {
                setDatabasesList(["college"]);
            }
            await loadDatabase(target);
        }
        boot();
    }, [loadDatabase]);

    // Create brand new database
    const createNewDatabase = async (name) => {
        if (!name || databasesList.includes(name)) return;
        const db = new ShadowDatabase();
        await db.init(""); // empty fresh database
        await persistCurrentDb(db, name);
        await loadDatabase(name);
    };

    // Delete a database
    const removeDatabase = async (name) => {
        await deleteSavedDatabase(name);
        const remaining = databasesList.filter(d => d !== name);
        setDatabasesList(remaining);
        if (currentDbName === name) {
            const nextDb = remaining.length > 0 ? remaining[0] : "main_db";
            await loadDatabase(nextDb);
        }
    };

    // Import Database from binary (.sqlite, .db) or SQL string (.sql)
    const importDatabase = async (name, fileData, isBinary = true) => {
        const db = new ShadowDatabase();
        if (isBinary) {
            await db.init(fileData); // Uint8Array
        } else {
            await db.init(fileData); // SQL string
        }
        await persistCurrentDb(db, name);
        await loadDatabase(name);
    };

    const runSandboxTrial = (candidateSql) => {
        if (!prodDbRef.current) return null;
        const sandbox = prodDbRef.current.fork();
        const result = sandbox.executeSandbox(candidateSql);
        sandbox.close();
        return result;
    };

    const promoteToProduction = async (approvedSql, commitMsg) => {
        if (!prodDbRef.current) return;
        prodDbRef.current.executeSandbox(approvedSql);

        await persistCurrentDb(prodDbRef.current, currentDbName);
        refreshMeta();

        const newCommit = {
            id: "c_" + Math.random().toString(36).substring(2, 9),
            message: commitMsg || "Applied sandbox SQL changes",
            timestamp: new Date().toLocaleTimeString(),
            sqlApplied: approvedSql,
            snapshot: prodDbRef.current.exportSnapshot()
        };

        setCommits(prev => [newCommit, ...prev]);
    };

    const rollbackToCommit = async (commitId) => {
        const target = commits.find(c => c.id === commitId);
        if (!target || !prodDbRef.current) return false;
        await prodDbRef.current.restoreSnapshot(target.snapshot);
        await persistCurrentDb(prodDbRef.current, currentDbName);
        refreshMeta();

        const rollbackCommit = {
            id: "c_" + Math.random().toString(36).substring(2, 9),
            message: `Rolled back to snapshot ${target.id} ("${(target.message || '').slice(0, 40)}")`,
            timestamp: new Date().toLocaleTimeString(),
            sqlApplied: target.sqlApplied ? `-- Reverted to state from ${target.id}` : null,
            snapshot: target.snapshot
        };

        setCommits(prev => [rollbackCommit, ...prev]);
        return true;
    };

    const getTableData = (tableName) => {
        if (!prodDbRef.current) return { columns: [], values: [] };
        return prodDbRef.current.getTableData(tableName);
    };

    const getTableStructure = (tableName) => {
        if (!prodDbRef.current) return [];
        return prodDbRef.current.getTableStructure(tableName);
    };

    const exportCurrentDb = (type = "sqlite") => {
        if (!prodDbRef.current) return;
        if (type === "sqlite") {
            const binary = prodDbRef.current.exportSnapshot();
            const blob = new Blob([binary], { type: "application/x-sqlite3" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `${currentDbName}.sqlite`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } else {
            const dump = prodDbRef.current.generateSqlDump();
            const blob = new Blob([dump], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `${currentDbName}_dump.sql`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
    };

    return {
        isReady,
        currentDbName,
        databasesList,
        schemaDDL,
        tables,
        commits,
        activeTab,
        setActiveTab,
        loadDatabase,
        createNewDatabase,
        removeDatabase,
        importDatabase,
        exportCurrentDb,
        runSandboxTrial,
        promoteToProduction,
        rollbackToCommit,
        getTableData,
        getTableStructure,
        refreshMeta
    };
}