-- ============================================================
-- SocialPlatform Database - SQL Server Express
-- Ejecutar en SQL Server Management Studio (SSMS)
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SocialPlatformDB')
BEGIN
    CREATE DATABASE SocialPlatformDB
    COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE SocialPlatformDB;
GO

-- La estructura de tablas es gestionada por Entity Framework Migrations.
-- Este script crea la base de datos inicial y configura permisos.

-- Crear login de aplicacion (opcional, si no usa Windows Auth)
-- IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'spi_app')
-- BEGIN
--     CREATE LOGIN spi_app WITH PASSWORD = 'AppUser@StrongPassword2024!';
-- END
-- GO

-- CREATE USER spi_app FOR LOGIN spi_app;
-- EXEC sp_addrolemember 'db_owner', 'spi_app';
-- GO

PRINT 'Base de datos SocialPlatformDB creada exitosamente.';
PRINT 'Ejecute las migraciones de EF Core para crear las tablas.';
GO
