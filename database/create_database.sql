-- ==========================================================
-- Project     : ShopSphere
-- File        : create_database.sql
-- Database    : PostgreSQL
-- Author      : Ramya Ramadoss
-- Description : Creates the ShopSphere database
-- ==========================================================

-- Create Database
CREATE DATABASE shopsphere_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_India.1252'
    LC_CTYPE = 'English_India.1252'
    LOCALE_PROVIDER = 'libc'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;