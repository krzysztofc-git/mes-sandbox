CREATE PROCEDURE dbo.ScanSerial
  @SerialCode VARCHAR(100),
  @UserID INT,
  @StationID INT,
  @Result VARCHAR(20) OUTPUT,
  @ProductName VARCHAR(100) OUTPUT
AS
  BEGIN
    BEGIN TRY
      BEGIN TRANSACTION;

      DECLARE @Status VARCHAR(20);
      DECLARE @SerialID INT;
      DECLARE @CurrentStationID INT;

      SELECT @Status = Status
      FROM Serials
      WHERE SerialCode = @SerialCode;

      SELECT @SerialID = SerialID
      FROM Serials
      WHERE SerialCode = @SerialCode;

      SELECT @ProductName = ProductName
      FROM Products AS P
      INNER JOIN Serials AS S
        ON P.ProductID = S.ProductID
      WHERE S.SerialID = @SerialID;

      IF @Status IS NULL
      BEGIN
        SET @Result = 'NOT FOUND';
        ROLLBACK;
        RETURN;
      END

      SELECT @CurrentStationID = CurrentStationID
      FROM Serials
      WHERE SerialID = @SerialID;

      IF @Status = 'SCRAPPED'
      BEGIN
        SET @Result = 'SCRAPPED';
        ROLLBACK;
        RETURN;
      END

      IF @CurrentStationID <> @StationID
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM StationAllowedRoutes
          WHERE FromStationID = @CurrentStationID
          AND ToStationID = @StationID
        )
        BEGIN
          SET @Result = 'WRONG STATION';
          ROLLBACK;
          RETURN;
        END

        UPDATE Serials
        SET CurrentStationID = @StationID
        WHERE SerialID = @SerialID;

        INSERT INTO SerialStationHistory
          (SerialID, FromStationID, ToStationID, MoveTime, UserID)
        VALUES
          (@SerialID, @CurrentStationID, @StationID, GETDATE(), @UserID);
        SET @Result = 'MOVED';
      END

      IF @CurrentStationID = @StationID
        SET @Result = 'OK';
      INSERT INTO ScanLog (SerialID, Result, UserID)
      VALUES (@SerialID, @Result, @UserID);

      COMMIT;
    END TRY
    BEGIN CATCH
      ROLLBACK;
    END CATCH
  END
RETURN 0
