CREATE TABLE dbo.ScanLog
(
  LogID INT IDENTITY (1, 1) NOT NULL,
  SerialID INT,
  ScanTime DATETIME CONSTRAINT DF_ScanLog_ScanTim DEFAULT (getdate()),
  Result VARCHAR (100),
  UserID INT,
  CONSTRAINT PK_ScanLog PRIMARY KEY CLUSTERED (LogID ASC),
  CONSTRAINT FK_ScanLog_Serials FOREIGN KEY (SerialID) REFERENCES dbo.Serials (SerialID),
  CONSTRAINT FK_ScanLog_Users FOREIGN KEY (UserID) REFERENCES dbo.Users (UserID)
)
