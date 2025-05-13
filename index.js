const Book = require('./Book');
const Member = require('./Member');
const Borrowing = require('./Borrowing');
const User = require('./User');

// Book - Borrowing Association
Book.hasMany(Borrowing, {
    foreignKey: 'book_id',
    as: 'borrowings'
});
Borrowing.belongsTo(Book, {
    foreignKey: 'book_id',
    as: 'book'
});

// Member - Borrowing Association
Member.hasMany(Borrowing, {
    foreignKey: 'member_id',
    as: 'borrowings'
});
Borrowing.belongsTo(Member, {
    foreignKey: 'member_id',
    as: 'member'
});

module.exports = {
    sequelize: require('../config/database'),
    Book,
    Member,
    Borrowing,
    User
}; 