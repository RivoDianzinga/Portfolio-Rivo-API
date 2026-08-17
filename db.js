require("dotenv").config();

const { Pool } = require("pg");

let pool;

if (process.env.DATABASE_URL) {

    // En production sur Render
    pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

} else {

    // En développement sur mon PC
    pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

}

module.exports = pool;