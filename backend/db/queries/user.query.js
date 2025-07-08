const pool = require("..")

const getUserByEmail = async (email) => {
    const client = await pool.connect()
    try{
        const result = await client.query('SELECT * FROM users WHERE email=$1', [
            email
        ])
        return result.rows[0] || null
    } finally {
        client.release()
    }
}

const getUserById = async (id) => {
    const client = await pool.connect()
    try {
        const result = await client.query('SELECT * FROM users WHERE id=$1', [
            id
        ])
        return result.rows[0] || null
    } finally {
        client.release()
    }
}

const saveUser = async (data) => {
    const client = await pool.connect()
    try{
        const result = await client.query(`INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *`, [
            data.name,
            data.email,
            data.password
        ])

        return result.rows[0]
    } finally {
        client.release()
    }
}


module.exports = {
    getUserByEmail,
    saveUser,
    getUserById
}