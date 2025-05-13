require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');
const borrowingRoutes = require('./routes/borrowings');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'books.html'));
});

app.get('/members', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'members.html'));
});

app.get('/borrow', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'borrow.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Database connection and server start
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync database models
        await sequelize.sync();
        console.log('Database models synchronized.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
}

startServer(); 