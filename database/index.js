/* ******************************************
 * Database Connection
 * This file handles connecting to PostgreSQL
 * Works both locally and on Render
 ******************************************/

const { Pool } = require("pg")
require("dotenv").config()

/* Create connection pool */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render-hosted PostgreSQL
  },
})

/* Log confirmation when connected */
pool.connect()
  .then(client => {
    console.log("Connected to PostgreSQL successfully 🎉")
    client.release()
  })
  .catch(err => console.error("Database connection failed ❌", err.message))

/* Export query helper */
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      return res
    } catch (error) {
      console.error("Database query error:", error.message)
      throw error
    }
  },
  pool,
}