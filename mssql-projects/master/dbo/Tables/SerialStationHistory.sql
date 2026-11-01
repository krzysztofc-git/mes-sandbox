CREATE TABLE dbo.SerialStationHistory (
  HistoryID INT IDENTITY (1, 1) NOT NULL,
  SerialID INT NOT NULL,
  FromStationID INT,
  ToStationID INT NOT NULL,
  MoveTime DATETIME CONSTRAINT DF_History_MoveTime DEFAULT (getdate()),
  UserID INT NOT NULL,

  CONSTRAINT PK_History PRIMARY KEY CLUSTERED (HistoryID ASC),

  CONSTRAINT FK_History_Serials FOREIGN KEY (SerialID) REFERENCES dbo.Serials (SerialID),

  CONSTRAINT FK_History_FromStation FOREIGN KEY (FromStationID) REFERENCES dbo.Stations (StationID),

  CONSTRAINT FK_History_ToStation FOREIGN KEY (ToStationID) REFERENCES dbo.Stations (StationID),

  CONSTRAINT FK_History_Users FOREIGN KEY (UserID) REFERENCES dbo.Users (UserID)
);