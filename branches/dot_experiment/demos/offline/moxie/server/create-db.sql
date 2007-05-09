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
	id 				INT(50) NOT NULL AUTO_INCREMENT,
	file_name		VARCHAR(255) NOT NULL,
	created_on		DATETIME NOT NULL,
	last_updated	DATETIME NOT NULL,
	content			MEDIUMTEXT,
	PRIMARY KEY(id),
	UNIQUE(file_name)
) ENGINE=MyISAM;


/* Create some fake data */

INSERT INTO DOCUMENTS (file_name, created_on, last_updated, content)
	VALUES ('message', NOW(), NOW(), 'Watson, come quickly!');
INSERT INTO DOCUMENTS (file_name, created_on, last_updated, content)
	VALUES ('message2', NOW(), NOW(), 'Hello World!');
INSERT INTO DOCUMENTS (file_name, created_on, last_updated, content)
	VALUES ('message3', NOW(), NOW(), 'Goodbye World!');
INSERT INTO DOCUMENTS (file_name, created_on, last_updated, content)
	VALUES ('message4', NOW(), NOW(), 'Brad Neuberg was here');	


/* Create our default user - You should change this default password. */

USE mysql;
DELETE IGNORE FROM user WHERE User = 'moxie';
INSERT INTO user (User, Host) 
	VALUES ('moxie', 'localhost');
FLUSH PRIVILEGES;
SET PASSWORD FOR moxie@localhost = PASSWORD('changeme');
GRANT ALL ON moxie.* TO moxie@localhost;
FLUSH PRIVILEGES;