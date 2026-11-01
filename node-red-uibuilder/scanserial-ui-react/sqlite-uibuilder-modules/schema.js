export function createDatabase(db) {
    db.exec(`
        CREATE TABLE Products (
            ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductCode TEXT,
            ProductName TEXT
        );

        CREATE TABLE Stations (
            StationID INTEGER PRIMARY KEY AUTOINCREMENT,
            StationName TEXT NOT NULL
        );

        CREATE TABLE Users (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT NOT NULL
        );

        CREATE TABLE Serials (
            SerialID INTEGER PRIMARY KEY AUTOINCREMENT,
            SerialCode TEXT UNIQUE,
            ProductID INTEGER,
            CurrentStationID INTEGER,
            CreatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            Status TEXT,

            FOREIGN KEY (ProductID)
                REFERENCES Products(ProductID),

            FOREIGN KEY (CurrentStationID)
                REFERENCES Stations(StationID)
        );

        CREATE TABLE ScanLog (
            LogID INTEGER PRIMARY KEY AUTOINCREMENT,
            SerialID INTEGER,
            ScanTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            Result TEXT NOT NULL,
            UserID INTEGER,

            FOREIGN KEY (SerialID)
                REFERENCES Serials(SerialID),

            FOREIGN KEY (UserID)
                REFERENCES Users(UserID)
        );

        CREATE TABLE SerialStationHistory (
            HistoryID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            SerialID INTEGER NOT NULL,
            FromStationID INTEGER,
            ToStationID INTEGER NOT NULL,
            MoveTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UserID INTEGER NOT NULL,

            CONSTRAINT FK_History_Serials
                FOREIGN KEY (SerialID)
                REFERENCES Serials(SerialID),

            CONSTRAINT FK_History_FromStation
                FOREIGN KEY (FromStationID)
                REFERENCES Stations(StationID),

            CONSTRAINT FK_History_ToStation
                FOREIGN KEY (ToStationID)
                REFERENCES Stations(StationID),

            CONSTRAINT FK_History_Users
                FOREIGN KEY (UserID)
                REFERENCES Users(UserID)
        );

        CREATE TABLE StationAllowedRoutes (
            StationAllowedRouteID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            FromStationID INTEGER NOT NULL,
            ToStationID INTEGER NOT NULL,

            CONSTRAINT UQ_StationAllowedRoutes
                UNIQUE (FromStationID, ToStationID),

            CONSTRAINT FK_StationAllowedRoutes_FromStation
                FOREIGN KEY (FromStationID)
                REFERENCES Stations(StationID),

            CONSTRAINT FK_StationAllowedRoutes_ToStation
                FOREIGN KEY (ToStationID)
                REFERENCES Stations(StationID),

            CONSTRAINT CK_StationAllowedRoutes_DifferentStations
                CHECK (FromStationID <> ToStationID)
        );

        INSERT INTO Products (
            ProductCode,
            ProductID,
            ProductName
        )
        VALUES
            ('product 1', 1, 'Product 1'),
            ('product 2', 2, 'Product 2'),
            ('product 3', 3, 'Product 3');

        INSERT INTO Stations (
            StationID,
            StationName
        )
        VALUES
            (1, 'Assembly'),
            (2, 'Test'),
            (3, 'Packaging'),
            (4, 'Finished');

        INSERT INTO Users (
            UserID,
            Username
        )
        VALUES
            (1, 'User 1'),
            (2, 'User 2'),
            (3, 'User 3'),
            (4, 'User 4');

        INSERT INTO Serials (
            SerialID,
            SerialCode,
            ProductID,
            CurrentStationID,
            CreatedAt,
            Status
        )
        VALUES
            (1, 'A01', 1, 1, '2020-01-01 12:00:00.000', 'ACTIVE'),
            (2, 'A02', 2, 3, '2020-01-01 12:00:00.000', 'SCRAPPED'),
            (3, 'B01', 3, 4, '2020-01-01 12:00:00.000', 'COMPLETED'),
            (4, 'B02', 1, 2, '2020-01-01 12:00:00.000', 'HOLD');

        INSERT INTO ScanLog (
            LogID,
            SerialID,
            ScanTime,
            Result,
            UserID
        )
        VALUES
            (1, 1, '2020-01-01 12:00:00.000', 'OK', 1),
            (2, 2, '2020-01-01 12:00:00.000', 'SCRAPPED', 1),
            (3, 3, '2020-01-01 12:00:00.000', 'NOT FOUND', 1);

        INSERT INTO StationAllowedRoutes (
            FromStationID,
            ToStationID
        )
        VALUES
            (1, 2),
            (2, 3),
            (2, 1),
            (3, 4);

        CREATE INDEX idx_ScanLog_ScanTime
            ON ScanLog(ScanTime);

        CREATE INDEX idx_ScanLog_SerialID
            ON ScanLog(SerialID);
    `);
}