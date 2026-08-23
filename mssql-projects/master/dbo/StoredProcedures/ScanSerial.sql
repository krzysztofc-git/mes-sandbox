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
        INSERT INTO ScanLog (SerialID, Result, UserID)
        VALUES (@SerialID, @Result, @UserID);

        ROLLBACK;
        RETURN;
      END

      IF @Status = 'SCRAPPED'
      BEGIN
        SET @Result = 'SCRAPPED';
        INSERT INTO ScanLog (SerialID, Result, UserID)
        VALUES (@SerialID, @Result, @UserID);

        ROLLBACK;
        RETURN;
      END

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
