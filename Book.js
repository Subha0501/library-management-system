const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    book_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    author: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING(13),
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    available_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    shelf_location: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    published_year: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Book; 