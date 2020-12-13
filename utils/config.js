require('dotenv').config()

const PORT = process.env.PORT
let DB_URL = process.env.DB_URL

if (process.env.NODE_ENV === "test") {
    DB_URL = process.env.TEST_DB_URL
}

module.exports = {
    PORT, DB_URL
}