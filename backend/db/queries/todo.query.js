const pool = require("../index");

const addTodo = async (data) => {
    const client = await pool.connect()
    try {
        const result = await client.query('INSERT INTO todos (title, description, user_id, status) VALUES ($1,$2,$3,$4) RETURNING *', [
            data.title, data.description, data.user_id, data.status
        ])
      
        return result.rows[0]
    } finally {
        client.release()
    }
}

const getTodos = async (user_id, limit, skip, orderBy = 'DESC', status, title) => {
    const client = await pool.connect()

    try{
        let query = 'SELECT * FROM todos WHERE user_id=$1'
        const values = [user_id]
        let index = 2 

        // Filtering by status
        if(status){
            query += ` AND status = $${index}`
            values.push(status)
            index++
        }

        // Filtering by title
        if(title){
            query += ` AND title ILIKE $${index}`
            values.push(`%${title}%`)
            index++
        }

        // Add order, limit, sort

        query += ` ORDER BY created_at ${orderBy} LIMIT $${index} OFFSET $${index + 1}`
        values.push(limit, skip)

        const result = await client.query(query, values)

        return result.rows

    } finally {
        client.release()
    }
}

const getCountOfTodos = async (user_id) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT COUNT(*) FROM todos WHERE user_id = $1', [user_id])
        return result.rows[0]
    } finally {
        client.release()
    }
}

const getSingleTodo = async (options) => {
    const client = await pool.connect()
    try {
        const keys = Object.keys(options)
        
        if(keys.length === 0){
            throw new Error('No filter options provided')
        }

        let query = `SELECT * FROM todos WHERE `;
        const conditions = []
        const values = []

        keys.forEach((key, index) => {
            conditions.push(`${key} = $${index + 1}`)
            values.push(options[key])
        })

        query += conditions.join(' AND ')
        query += ' LIMIT 1'

        const result = await client.query(query, values)

        return result.rows[0] || null
    } finally {
        client.release()
    }
}


const deleteTodoById = async (id) => {
    const client = await pool.connect()
    try {
        const result = await client.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id])

        return result.rows[0] || null
    } finally {
        client.release()
    }
}


const updateTodoById = async (id, {title, description, status, updated_at}) => {
    const client = await pool.connect()
    try {
        const result = await client.query(`
            UPDATE todos
            SET title = $1, description = $2, status = $3, updated_at = $4
            WHERE id = $5 
            RETURNING *
        `, [title, description, status, updated_at, id])

        return result.rows[0] || null
    } finally {
        client.release()
    }
}

module.exports = {
    getTodos,
    addTodo,
    getCountOfTodos,
    getSingleTodo,
    deleteTodoById,
    updateTodoById
}