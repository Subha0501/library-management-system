document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    // Fetch dashboard data
    fetchDashboardData();
    fetchRecentBorrowings();
    fetchOverdueBooks();

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
});

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        } else {
            showAlert('Failed to fetch dashboard data', 'danger');
        }
    } catch (error) {
        console.error('Dashboard data error:', error);
        showAlert('An error occurred while fetching dashboard data', 'danger');
    }
}

async function fetchRecentBorrowings() {
    try {
        const response = await fetch('/api/borrowings/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateRecentBorrowingsTable(data);
        }
    } catch (error) {
        console.error('Recent borrowings error:', error);
    }
}

async function fetchOverdueBooks() {
    try {
        const response = await fetch('/api/borrowings/overdue', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateOverdueBooksTable(data);
        }
    } catch (error) {
        console.error('Overdue books error:', error);
    }
}

function updateDashboardStats(data) {
    document.getElementById('totalBooks').textContent = data.totalBooks;
    document.getElementById('activeMembers').textContent = data.activeMembers;
    document.getElementById('borrowedBooks').textContent = data.borrowedBooks;
    document.getElementById('overdueBooks').textContent = data.overdueBooks;
}

function updateRecentBorrowingsTable(borrowings) {
    const tbody = document.querySelector('#recentBorrowingsTable tbody');
    tbody.innerHTML = '';

    borrowings.forEach(borrowing => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${borrowing.bookTitle}</td>
            <td>${borrowing.memberName}</td>
            <td>${new Date(borrowing.borrowDate).toLocaleDateString()}</td>
            <td><span class="badge bg-${getStatusBadgeColor(borrowing.status)}">${borrowing.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateOverdueBooksTable(overdueBooks) {
    const tbody = document.querySelector('#overdueBooksTable tbody');
    tbody.innerHTML = '';

    overdueBooks.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.bookTitle}</td>
            <td>${book.memberName}</td>
            <td>${new Date(book.dueDate).toLocaleDateString()}</td>
            <td>$${book.fineAmount.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case 'borrowed':
            return 'primary';
        case 'returned':
            return 'success';
        case 'overdue':
            return 'danger';
        default:
            return 'secondary';
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
} 