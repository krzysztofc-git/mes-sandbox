CREATE TABLE dbo.Serials
(
  SerialID INT IDENTITY (1, 1) NOT NULL,
  SerialCode VARCHAR (100),
  ProductID INT,
  CurrentStationID INT,
  CreatedAt DATETIME CONSTRAINT DF_Serials_CreatedAt DEFAULT (getdate()) NOT NULL,
  Status VARCHAR (100),
  CONSTRAINT PK_Serials PRIMARY KEY CLUSTERED (SerialID ASC),
  CONSTRAINT FK_Serials_Products FOREIGN KEY (ProductID) REFERENCES dbo.Products (ProductID),
  CONSTRAINT FK_Serials_Stations FOREIGN KEY (CurrentStationID) REFERENCES dbo.Stations (StationID),
  CONSTRAINT UQ_Serials UNIQUE NONCLUSTERED (SerialCode ASC)
)
