require('dotenv').config()

const PORT = process.env.PORT
let DB_URL = process.env.DB_URL
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

if (process.env.NODE_ENV === "test") {
    DB_URL = process.env.TEST_DB_URL
}

module.exports = {
    PORT, DB_URL, ACCESS_TOKEN_SECRET
}