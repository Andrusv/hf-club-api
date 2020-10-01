CREATE TABLE IF NOT EXISTS users(
    user_id VARCHAR(24) PRIMARY KEY,
    balance DOUBLE(7,4) DEFAULT 0.00,
    banned TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS withdrawals(
    withdrawal_id INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(24) NOT NULL,
    balance DOUBLE(5,2) NOT NULL,
    received TINYINT(1) DEFAULT 0,
    aproved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP DEFAULT 0,
    aproved_at TIMESTAMP DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coupons(
    coupon_id INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    coupon VARCHAR(64) NOT NULL,
    link VARCHAR(21) NOT NULL,
    user_id VARCHAR(24),
    used TINYINT(1) DEFAULT 0,
    aproved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP DEFAULT 0
);