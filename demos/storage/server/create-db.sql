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

/* Set default character encoding so we i18n ready */
CREATE DATABASE moxie 
	DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE moxie;

CREATE TABLE document (
	id 				INT(50) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	file_name		VARCHAR(256) UNIQUE NOT NULL,
	created_on		DATETIME NOT NULL,
	last_updated		DATETIME NOT NULL,
	content			TEXT 
) ENGINE=MyISAM;