
CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);





INSERT INTO users (username, email, password) VALUES 
('testuser', 'test@example.com', 'hashedpassword123')
ON DUPLICATE KEY UPDATE username=username;


