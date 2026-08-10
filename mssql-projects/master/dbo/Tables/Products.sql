CREATE TABLE dbo.Products
(
  ProductCode VARCHAR (100),
  ProductID INT IDENTITY (1, 1) NOT NULL,
  ProductName VARCHAR (100),
  CONSTRAINT PK_Products PRIMARY KEY CLUSTERED (ProductID ASC)
)
