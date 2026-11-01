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
            WITH RankedScans AS (
                SELECT
                    SL.LogID,
                    S.SerialCode,
                    SL.ScanTime,
                    SL.Result,
                    U.Username,
                    CurrentStation.StationName AS CurrentStation,
                    PreviousStation.StationName AS PreviousStation,
                    ROW_NUMBER() OVER (
                        PARTITION BY S.SerialCode
                        ORDER BY SL.LogID DESC
                    ) AS RowNum
                FROM ScanLog AS SL
                LEFT JOIN Serials AS S
                    ON S.SerialID = SL.SerialID
                LEFT JOIN Users AS U
                    ON U.UserID = SL.UserID
                LEFT JOIN Stations AS CurrentStation
                    ON CurrentStation.StationID = S.CurrentStationID
                LEFT JOIN SerialStationHistory AS H
                    ON H.HistoryID = (
                        SELECT H2.HistoryID
                        FROM SerialStationHistory AS H2
                        WHERE H2.SerialID = SL.SerialID
                        ORDER BY
                            H2.MoveTime DESC,
                            H2.HistoryID DESC
                        LIMIT 1
                    )
                LEFT JOIN Stations AS PreviousStation
                    ON PreviousStation.StationID = H.FromStationID
                WHERE SL.ScanTime >= ?
            )
            SELECT
                LogID,
                SerialCode,
                ScanTime,
                Result,
                Username,
                CurrentStation,
                PreviousStation
            FROM RankedScans
            WHERE RowNum = 1
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
    const stationId = Number(payload.stationId);

    try {
        // Begin transaction
        db.exec("BEGIN TRANSACTION");

        // Get serial status, ID, origin station and product name
        const serial = db.exec({
            sql: `
                SELECT
                    S.SerialID,
                    S.Status,
                    S.CurrentStationID,
                    P.ProductName
                FROM Serials AS S
                LEFT JOIN Products AS P
                    ON P.ProductID = S.ProductID
                WHERE S.SerialCode = ?
            `,
            bind: [serialCode],
            rowMode: "object",
            returnValue: "resultRows"
        })[0];

        // Serial not found
        if (!serial) {
            db.exec("ROLLBACK");

            return {
                result: {
                    message: "Serial not found!",
                    type: "error",
                    productName: null
                },
                ...refresh(db)
            };
        }

        const serialId = serial.SerialID;
        const status = serial.Status;
        const originStationId = serial.CurrentStationID;
        const productName = serial.ProductName ?? null;

        // Reject scrapped serials
        if (status === "SCRAPPED") {
            db.exec("ROLLBACK");

            return {
                result: {
                    message: "Serial is scrapped!",
                    type: "warning",
                    productName
                },
                ...refresh(db)
            };
        }

        // Check if the serial is already at the destination
        if (originStationId === stationId) {
            // Log the successful validation scan
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
                    "OK",
                    userId
                ]
            });

            // Commit transaction
            db.exec("COMMIT");

            return {
                result: {
                    message: "Serial is OK.",
                    type: "success",
                    productName
                },
                ...refresh(db)
            };
        }

        // Check if the route between stations is allowed
        const route = db.exec({
            sql: `
                SELECT
                    StationAllowedRouteID
                FROM StationAllowedRoutes
                WHERE FromStationID = ?
                  AND ToStationID = ?
            `,
            bind: [
                originStationId,
                stationId
            ],
            rowMode: "object",
            returnValue: "resultRows"
        })[0];

        // Reject an invalid station sequence
        if (!route) {
            // Log the rejected scan
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
                    "WRONG STATION",
                    userId
                ]
            });

            // Rollback transaction and the ScanLog insert
            db.exec("ROLLBACK");

            return {
                result: {
                    message: "The station sequence is not allowed!",
                    type: "warning",
                    productName
                },
                ...refresh(db)
            };
        }

        // Update the serial's current station
        db.exec({
            sql: `
                UPDATE Serials
                SET CurrentStationID = ?
                WHERE SerialID = ?
            `,
            bind: [
                stationId,
                serialId
            ]
        });

        // Record the station movement
        db.exec({
            sql: `
                INSERT INTO SerialStationHistory (
                    SerialID,
                    FromStationID,
                    ToStationID,
                    MoveTime,
                    UserID
                )
                VALUES (?, ?, ?, ?, ?)
            `,
            bind: [
                serialId,
                originStationId,
                stationId,
                new Date().toISOString(),
                userId
            ]
        });

        // Record the successful scan
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
                "OK",
                userId
            ]
        });

        // Commit transaction
        db.exec("COMMIT");

        // Combine results
        return {
            result: {
                message: "Station updated successfully.",
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

    allMovementHistory: `
        SELECT
            H.HistoryID,
            S.SerialCode,
            FromStation.StationName AS FromStation,
            ToStation.StationName AS ToStation,
            H.MoveTime,
            U.Username
        FROM SerialStationHistory AS H
        JOIN Serials AS S
            ON S.SerialID = H.SerialID
        LEFT JOIN Stations AS FromStation
            ON FromStation.StationID = H.FromStationID
        JOIN Stations AS ToStation
            ON ToStation.StationID = H.ToStationID
        JOIN Users AS U
            ON U.UserID = H.UserID
        ORDER BY H.HistoryID DESC;
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