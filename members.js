const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Member, Borrowing } = require('../models');
const { auth } = require('../middleware/auth');

// Get all members with optional search
router.get('/', auth, async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};

        if (search) {
            where[Op.or] = [
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const members = await Member.findAll({
            where,
            order: [['last_name', 'ASC'], ['first_name', 'ASC']]
        });

        res.json(members);
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single member with their borrowings
router.get('/:id', auth, async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id, {
            include: [{
                model: Borrowing,
                as: 'borrowings',
                include: [{
                    model: Book,
                    as: 'book'
                }]
            }]
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new member
router.post('/', auth, async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            address,
            membership_date
        } = req.body;

        // Check if member with email already exists
        const existingMember = await Member.findOne({ where: { email } });
        if (existingMember) {
            return res.status(400).json({ message: 'Member with this email already exists' });
        }

        const member = await Member.create({
            first_name,
            last_name,
            email,
            phone,
            address,
            membership_date
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Create member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update member
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            address,
            membership_date,
            status
        } = req.body;

        const member = await Member.findByPk(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if email is being changed and if it already exists
        if (email !== member.email) {
            const existingMember = await Member.findOne({ where: { email } });
            if (existingMember) {
                return res.status(400).json({ message: 'Member with this email already exists' });
            }
        }

        await member.update({
            first_name,
            last_name,
            email,
            phone,
            address,
            membership_date,
            status
        });

        res.json(member);
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete member
router.delete('/:id', auth, async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if member has any active borrowings
        const activeBorrowings = await Borrowing.count({
            where: {
                member_id: member.member_id,
                status: 'borrowed'
            }
        });

        if (activeBorrowings > 0) {
            return res.status(400).json({
                message: 'Cannot delete member with active borrowings'
            });
        }

        await member.destroy();
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 