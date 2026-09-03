export function refresh(db) {
    const users = db.exec({
        sql: `
            SELECT
                UserID,
                Username
            FROM Users
            ORDER BY UserID
        `,
        rowMode: "object",
        returnValue: "resultRows"
    });

    const stations = db.exec({
        sql: `
            SELECT
                StationID,
                StationName
            FROM Stations
            ORDER BY StationID
        `,
        rowMode: "object",
        returnValue: "resultRows"
    });

    const tenMinutesAgo = new Date(
        Date.now() - 10 * 60 * 1000
    ).toISOString();

    const latestScans = db.exec({
        sql: `
            SELECT
                LogID,
                SerialID,
                ScanTime,
                Result,
                UserID
            FROM ScanLog
            WHERE ScanTime >= ?
            ORDER BY LogID DESC
        `,
        bind: [tenMinutesAgo],
        rowMode: "object",
        returnValue: "resultRows"
    });

    return {
        latestScans,
        users,
        stations
    };
}

export function scan(msg, db) {
    const payload = msg.payload ?? {};

    const serialCode = payload.serial;
    const userId = Number(payload.userId);

    try {
        // Begin transaction
        db.exec("BEGIN TRANSACTION");

        let status = null;
        let serialId = null;
        let productName = null;

        // Get serial status and ID
        const serial = db.exec({
            sql: `
                SELECT
                    Status,
                    SerialID
                FROM Serials
                WHERE SerialCode = ?
            `,
            bind: [serialCode],
            rowMode: "object",
            returnValue: "resultRows"
        })[0];

        if (serial) {
            status = serial.Status;
            serialId = serial.SerialID;
        }

        // Get product name
        if (serialId !== null) {
            const product = db.exec({
                sql: `
                    SELECT
                        P.ProductName
                    FROM Products AS P
                    INNER JOIN Serials AS S
                        ON P.ProductID = S.ProductID
                    WHERE S.SerialID = ?
                `,
                bind: [serialId],
                rowMode: "object",
                returnValue: "resultRows"
            })[0];

            productName = product?.ProductName ?? null;
        }

        // T-SQL procedure and hardcoded messages
        if (status === null) {
            const result = "NOT FOUND";

            // Scan Log
            db.exec({
                sql: `
                    INSERT INTO ScanLog (
                        SerialID,
                        ScanTime,
                        Result,
                        UserID
                    )
                    VALUES (?, ?, ?, ?)
                `,
                bind: [
                    serialId,
                    new Date().toISOString(),
                    result,
                    userId
                ]
            });

            // Rollback transaction
            db.exec("ROLLBACK");

            return {
                result: {
                    message: "Serial was not found.",
                    type: "error",
                    productName
                },
                ...refresh(db)
            };
        }

        if (status === "SCRAPPED") {
            const result = "SCRAPPED";

            // Scan Log
            db.exec({
                sql: `
                    INSERT INTO ScanLog (
                        SerialID,
                        ScanTime,
                        Result,
                        UserID
                    )
                    VALUES (?, ?, ?, ?)
                `,
                bind: [
                    serialId,
                    new Date().toISOString(),
                    result,
                    userId
                ]
            });

            // Rollback transaction
            db.exec("ROLLBACK");

            return {
                result: {
                    message: "Serial has scrapped status.",
                    type: "warning",
                    productName
                },
                ...refresh(db)
            };
        }

        const result = "OK";

        // Scan Log
        db.exec({
            sql: `
                INSERT INTO ScanLog (
                    SerialID,
                    ScanTime,
                    Result,
                    UserID
                )
                VALUES (?, ?, ?, ?)
            `,
            bind: [
                serialId,
                new Date().toISOString(),
                result,
                userId
            ]
        });

        // Commit transaction
        db.exec("COMMIT");

        // Combine results
        return {
            result: {
                message: "Serial is OK.",
                type: "success",
                productName
            },
            ...refresh(db)
        };

    } catch (error) {
        // T-SQL CATCH
        try {
            db.exec("ROLLBACK");
        } catch {
            // Ignore rollback error
        }

        throw error;
    }
}

export const debugQueries = {
    allProducts: `
        SELECT *
        FROM Products
    `,

    allSerials: `
        SELECT *
        FROM Serials
    `,

    allUsers: `
        SELECT *
        FROM Users
    `,

    allStations: `
        SELECT *
        FROM Stations
    `,

    allScanLogs: `
        SELECT *
        FROM ScanLog
        ORDER BY LogID DESC
    `,

    joinSelect: `
        SELECT
            L.LogID,
            S.SerialCode,
            P.ProductName,
            L.Result,
            L.ScanTime,
            U.Username,
            ST.StationName
        FROM ScanLog AS L
        LEFT JOIN Serials AS S
            ON S.SerialID = L.SerialID
        LEFT JOIN Products AS P
            ON P.ProductID = S.ProductID
        JOIN Users AS U
            ON U.UserID = L.UserID
        JOIN Stations AS ST
            ON ST.StationID = S.CurrentStationID
        ORDER BY L.LogID DESC
    `
};