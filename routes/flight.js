const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Pool } = require('pg');


const pool = new Pool({
    user: 'pritha',               
    host: 'localhost',            
    database: 'pritha_paybolt',   
    password: 'prithasen', 
    port: 5432,                   
});

const JWT_SECRET = 'your_jwt_secret';


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user; 
        next();
    });
};

let flight = [];
let currentId = 1; 

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO user_detail (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        res.status(201).json({ message: 'User created', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});



router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM user_detail WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});



router.post('/', authenticateToken, async (req, res) => {
    const { airline, origin, destination, departureTime, arrivalTime } = req.body;
    const userId = req.user.userId; 
    try {
        const result = await pool.query(
            'INSERT INTO flight (airline, origin, destination, departure_time, arrival_time, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [airline, origin, destination, departureTime, arrivalTime, userId]
        );
        const newFlight = result.rows[0];
        res.status(201).json({ message: 'Flight added', flight: newFlight });
    } catch (err) {
        res.status(500).json({ message: 'Error adding flight', error: err.message });
    }
});



router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query('SELECT * FROM flight WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching flights', error: err.message });
    }
});




router.get('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM flight WHERE id = $1', [id]);
        const flight = result.rows[0];

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        res.json(flight);
    } catch (err) {
        console.error('Error retrieving flight:', err);
        res.status(500).json({ message: 'Error retrieving flight', error: err.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { airline, origin, destination, departureTime, arrivalTime } = req.body;
    const userId = req.user.userId; 
    try {
        const result = await pool.query('SELECT * FROM flight WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'You do not have permission to modify this flight' });
        }
        const updateResult = await pool.query(
            'UPDATE flight SET airline = $1, origin = $2, destination = $3, departure_time = $4, arrival_time = $5 WHERE id = $6 RETURNING *',
            [airline, origin, destination, departureTime, arrivalTime, id]
        );
        res.json({ message: 'Flight updated', flight: updateResult.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error updating flight', error: err.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;  

    try {
        const result = await pool.query('SELECT * FROM flight WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'You do not have permission to delete this flight' });
        }
        await pool.query('DELETE FROM flight WHERE id = $1', [id]);
        res.json({ message: 'Flight deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting flight', error: err.message });
    }
});

module.exports = router