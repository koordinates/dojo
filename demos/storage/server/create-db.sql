/*
	SQL script to create the Moxie database.
	This SQL is MySQL specific.
	
	To use:
	
	mysql < create-db.sql
	
	Warning: This script first deletes any possible
	pre-existing Moxie database before creating it anew.

	@author Brad Neuberg, bkn3@columbia.edu
*/

DROP DATABASE IF EXISTS moxie;

CREATE DATABASE moxie; 

USE moxie;

CREATE TABLE DOCUMENTS (
	id 			INT(50) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	file_name		VARCHAR(255) UNIQUE NOT NULL,
	created_on		DATETIME NOT NULL,
	last_updated		DATETIME NOT NULL,
	content			TEXT 
) ENGINE=MyISAM;
