CREATE PROCEDURE dbo.ScanSerial
  @SerialCode VARCHAR(100),
  @UserID INT
AS
  BEGIN
    BEGIN TRY
      BEGIN TRANSACTION;

      DECLARE @Status VARCHAR(20);

      SELECT @Status = Status
      FROM Serials
      WHERE SerialCode = @SerialCode;

      IF @Status IS NULL
      BEGIN
        INSERT INTO ScanLog (SerialCode, Result, UserID)
        VALUES (@SerialCode, 'NOT FOUND', @UserID);

        COMMIT; -- should be "ROLLBACK" but set to "COMMIT" for testing
        RETURN;
      END

      IF @Status = 'SCRAPPED'
      BEGIN
        INSERT INTO ScanLog (SerialCode, Result, UserID)
        VALUES (@SerialCode, 'SCRAPPED', @UserID);

        ROLLBACK;
        RETURN;
      END

      INSERT INTO ScanLog (SerialCode, Result, UserID)
      VALUES (@SerialCode, 'OK', @UserID);

      COMMIT;
    END TRY
    BEGIN CATCH
      ROLLBACK;
    END CATCH
  END
RETURN 0
