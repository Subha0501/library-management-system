const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrowing = sequelize.define('Borrowing', {
    borrowing_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'books',
            key: 'book_id'
        }
    },
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'members',
            key: 'member_id'
        }
    },
    borrow_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
        defaultValue: 'borrowed'
    },
    fine_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'borrowings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Borrowing; 