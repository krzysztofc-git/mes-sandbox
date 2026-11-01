CREATE TABLE dbo.StationAllowedRoutes (
  StationAllowedRouteID INT IDENTITY (1, 1) NOT NULL,
  FromStationID INT NOT NULL,
  ToStationID INT NOT NULL,

  CONSTRAINT PK_StationAllowedRoutes PRIMARY KEY CLUSTERED (StationAllowedRouteID ASC),

  CONSTRAINT UQ_StationAllowedRoutes UNIQUE (FromStationID, ToStationID),

  CONSTRAINT FK_StationAllowedRoutes_FromStation FOREIGN KEY (FromStationID) REFERENCES dbo.Stations(StationID),

  CONSTRAINT FK_StationAllowedRoutes_ToStation FOREIGN KEY (ToStationID) REFERENCES dbo.Stations(StationID),

  CONSTRAINT CK_StationAllowedRoutes_DifferentStations CHECK (FromStationID <> ToStationID)
);