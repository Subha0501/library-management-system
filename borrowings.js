const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Book, Member, Borrowing } = require('../models');
const { auth } = require('../middleware/auth');

// Get all borrowings with optional filters
router.get('/', auth, async (req, res) => {
    try {
        const { status, member_id, book_id } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }
        if (member_id) {
            where.member_id = member_id;
        }
        if (book_id) {
            where.book_id = book_id;
        }

        const borrowings = await Borrowing.findAll({
            where,
            include: [
                {
                    model: Book,
                    as: 'book'
                },
                {
                    model: Member,
                    as: 'member'
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(borrowings);
    } catch (error) {
        console.error('Get borrowings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent borrowings
router.get('/recent', auth, async (req, res) => {
    try {
        const borrowings = await Borrowing.findAll({
            include: [
                {
                    model: Book,
                    as: 'book'
                },
                {
                    model: Member,
                    as: 'member'
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        res.json(borrowings);
    } catch (error) {
        console.error('Get recent borrowings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get overdue books
router.get('/overdue', auth, async (req, res) => {
    try {
        const today = new Date();
        const borrowings = await Borrowing.findAll({
            where: {
                status: 'borrowed',
                due_date: {
                    [Op.lt]: today
                }
            },
            include: [
                {
                    model: Book,
                    as: 'book'
                },
                {
                    model: Member,
                    as: 'member'
                }
            ]
        });

        // Calculate fines
        const overdueBooks = borrowings.map(borrowing => {
            const daysOverdue = Math.floor((today - new Date(borrowing.due_date)) / (1000 * 60 * 60 * 24));
            const fineAmount = daysOverdue * 1.00; // $1 per day

            return {
                ...borrowing.toJSON(),
                days_overdue: daysOverdue,
                fine_amount: fineAmount
            };
        });

        res.json(overdueBooks);
    } catch (error) {
        console.error('Get overdue books error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new borrowing
router.post('/', auth, async (req, res) => {
    try {
        const { book_id, member_id, borrow_date, due_date } = req.body;

        // Check if book exists and is available
        const book = await Book.findByPk(book_id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (book.available_quantity <= 0) {
            return res.status(400).json({ message: 'Book is not available for borrowing' });
        }

        // Check if member exists and is active
        const member = await Member.findByPk(member_id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        if (member.status !== 'active') {
            return res.status(400).json({ message: 'Member account is not active' });
        }

        // Check if member has any overdue books
        const overdueBooks = await Borrowing.count({
            where: {
                member_id,
                status: 'borrowed',
                due_date: {
                    [Op.lt]: new Date()
                }
            }
        });

        if (overdueBooks > 0) {
            return res.status(400).json({ message: 'Member has overdue books' });
        }

        // Create borrowing record
        const borrowing = await Borrowing.create({
            book_id,
            member_id,
            borrow_date,
            due_date,
            status: 'borrowed'
        });

        // Update book available quantity
        await book.update({
            available_quantity: book.available_quantity - 1
        });

        res.status(201).json(borrowing);
    } catch (error) {
        console.error('Create borrowing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Return book
router.put('/:id/return', auth, async (req, res) => {
    try {
        const borrowing = await Borrowing.findByPk(req.params.id, {
            include: [
                {
                    model: Book,
                    as: 'book'
                }
            ]
        });

        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        if (borrowing.status === 'returned') {
            return res.status(400).json({ message: 'Book is already returned' });
        }

        const returnDate = new Date();
        const dueDate = new Date(borrowing.due_date);
        let fineAmount = 0;

        // Calculate fine if returned late
        if (returnDate > dueDate) {
            const daysOverdue = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
            fineAmount = daysOverdue * 1.00; // $1 per day
        }

        // Update borrowing record
        await borrowing.update({
            return_date: returnDate,
            status: 'returned',
            fine_amount: fineAmount
        });

        // Update book available quantity
        await borrowing.book.update({
            available_quantity: borrowing.book.available_quantity + 1
        });

        res.json(borrowing);
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 