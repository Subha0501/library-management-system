# Library Management System

A comprehensive web-based library management system that allows users to manage books, members, and borrowing operations.

## Features

- Book Management (Add, Edit, Delete, Search)
- Member Management (Add, Edit, Delete)
- Borrowing System
- Return Management
- Search Functionality
- User Authentication
- Admin Dashboard

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Additional Libraries: Bootstrap 5, jQuery

## Project Structure

```
library-management/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
│   ├── index.html
│   ├── books.html
│   ├── members.html
│   └── borrow.html
├── server/
│   ├── config/
│   ├── routes/
│   └── models/
└── database/
    └── schema.sql
```

## Setup Instructions

1. Install Node.js and MySQL
2. Clone the repository
3. Install dependencies: `npm install`
4. Set up the database using the schema.sql file
5. Configure database connection in config/database.js
6. Start the server: `npm start`
7. Access the application at http://localhost:3000

## Database Schema

The system uses the following main tables:
- books
- members
- borrowings
- users

## License

MIT License 