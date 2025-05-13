const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Book } = require('../models');
const { auth } = require('../middleware/auth');

// Get all books with optional search and filters
router.get('/', auth, async (req, res) => {
    try {
        const { search, category, availability } = req.query;
        const where = {};

        // Search by title or author
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter by category
        if (category) {
            where.category = category;
        }

        // Filter by availability
        if (availability === 'available') {
            where.available_quantity = { [Op.gt]: 0 };
        } else if (availability === 'borrowed') {
            where.available_quantity = 0;
        }

        const books = await Book.findAll({
            where,
            order: [['title', 'ASC']]
        });

        res.json(books);
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single book
router.get('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new book
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            category,
            quantity,
            shelf_location,
            published_year
        } = req.body;

        // Check if book with ISBN already exists
        const existingBook = await Book.findOne({ where: { isbn } });
        if (existingBook) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }

        const book = await Book.create({
            title,
            author,
            isbn,
            category,
            quantity,
            available_quantity: quantity,
            shelf_location,
            published_year
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update book
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            category,
            quantity,
            shelf_location,
            published_year
        } = req.body;

        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if ISBN is being changed and if it already exists
        if (isbn !== book.isbn) {
            const existingBook = await Book.findOne({ where: { isbn } });
            if (existingBook) {
                return res.status(400).json({ message: 'Book with this ISBN already exists' });
            }
        }

        // Calculate new available quantity
        const borrowed = book.quantity - book.available_quantity;
        const newAvailableQuantity = Math.max(0, quantity - borrowed);

        await book.update({
            title,
            author,
            isbn,
            category,
            quantity,
            available_quantity: newAvailableQuantity,
            shelf_location,
            published_year
        });

        res.json(book);
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if book is currently borrowed
        if (book.available_quantity < book.quantity) {
            return res.status(400).json({ message: 'Cannot delete book that is currently borrowed' });
        }

        await book.destroy();
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 