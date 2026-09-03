import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { createDatabase } from "./sqlite-uibuilder-modules/schema";
import { refresh, scan, debugQueries } from "./sqlite-uibuilder-modules/queries";

(() => {
    const listeners = new Map();

    let db = null;
    let initializationError = null;

    window.uibuilder = {
        onChange(type, callback) {
            listeners.set(type, callback);

            if (type === "ctrlMsg") {
                setTimeout(() => {
                    callback({
                        uibuilderCtrl: "client connect"
                    });
                }, 1000);
            }
        },

        async send(msg) {
            try {
                await dbReady;

                if (msg.payload?.refresh) {
                    const data = refresh(db);

                    emit("msg", {
                        payload: {
                            errormsg: "",
                            lastUpdated: Date.now(),
                            ...data
                        }
                    });


                    return;
                }

                const data =  scan(msg, db);

                emit("msg", {
                    payload: {
                        errormsg: "",
                        lastUpdated: Date.now(),
                        ...data
                    }
                });
            } catch (error) {
                console.error("SQLite uibuilder error:", error);

                emit("msg", {
                    payload: {
                        errormsg: error.message,
                        lastUpdated: Date.now(),
                        latestScans: [],
                        users: [],
                        stations: []
                    }
                });
            }
        }
    };

    window.sqliteDebug = {
        test: {},

        query(sql, bind = []) {
            if (!db) {
                console.error("SQLite database is not ready.");
                return;
            }

            try {
                const result = db.exec({
                    sql,
                    bind,
                    rowMode: "object",
                    returnValue: "resultRows"
                });

                console.table(result);

                return result;
            } catch (error) {
                console.error("SQLite query error:", error);
            }
        }
    };

    for (const [name, sql] of Object.entries(debugQueries)) {
        window.sqliteDebug.test[name] = () => {
            return window.sqliteDebug.query(sql);
        };
    }

    function emit(type, msg) {
        const callback = listeners.get(type);

        if (callback) {
            callback(msg);
            console.log("SQLite uibuilder emit:", msg.payload);
        }
    }

    const dbReady = initializeDatabase();

    async function initializeDatabase() {
        try {
            const sqlite3 = await sqlite3InitModule();

            console.log(
                "SQLite initialized:",
                sqlite3.version.libVersion
            );

            db = new sqlite3.oo1.DB(":memory:");

            createDatabase(db);

            console.log("SQLite database ready");

            return db;
        } catch (error) {
            initializationError = error;

            console.error(
                "Failed to initialize SQLite:",
                initializationError
            );

            throw error;
        }
    }
    
})();