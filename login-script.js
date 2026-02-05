// VoteNow - Login Script (Firebase Version)

// Admin credentials (in production, use Firebase Authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const userLoginForm = document.getElementById('userLoginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const userName = document.getElementById('userName');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const userError = document.getElementById('userError');
const adminError = document.getElementById('adminError');

// Switch between tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show corresponding form
        if (tab === 'user') {
            userLoginForm.classList.add('active');
            adminLoginForm.classList.remove('active');
        } else {
            adminLoginForm.classList.add('active');
            userLoginForm.classList.remove('active');
        }

        // Clear errors
        userError.classList.remove('active');
        adminError.classList.remove('active');
    });
});

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.add('active');
    setTimeout(() => {
        element.classList.remove('active');
    }, 5000);
}

// Handle user login
userLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = userName.value.trim();

    if (!name) {
        showError(userError, 'Please enter your name');
        return;
    }

    if (name.length < 2) {
        showError(userError, 'Name must be at least 2 characters');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Checking...';
    submitBtn.disabled = true;

    try {
        // Check if user can vote using Firebase
        const canVote = await FirebaseHelper.canUserVote(name);

        if (!canVote) {
            const hoursRemaining = await FirebaseHelper.getTimeUntilNextVote(name);
            const hours = Math.floor(hoursRemaining);
            const minutes = Math.floor((hoursRemaining - hours) * 60);
            showError(userError, `You can vote again in ${hours}h ${minutes}m`);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Store current user in session
        sessionStorage.setItem('currentUser', name);

        // Redirect to voting page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error checking vote status:', error);
        showError(userError, 'Error connecting to server. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Handle admin login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = adminUsername.value.trim();
    const password = adminPassword.value;

    if (!username || !password) {
        showError(adminError, 'Please enter both username and password');
        return;
    }

    // Verify credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store admin session
        sessionStorage.setItem('adminAuthenticated', 'true');

        // Redirect to admin panel
        window.location.href = 'admin.html';
    } else {
        showError(adminError, 'Invalid username or password');
        adminPassword.value = '';
    }
});

// Check if already logged in
window.addEventListener('load', async () => {
    const currentUser = sessionStorage.getItem('currentUser');
    const isAdmin = sessionStorage.getItem('adminAuthenticated');

    try {
        // If user is logged in, check if they can vote
        if (currentUser) {
            const canVote = await FirebaseHelper.canUserVote(currentUser);
            if (canVote) {
                window.location.href = 'index.html';
            }
        }

        // If admin is authenticated, redirect to admin panel
        if (isAdmin === 'true') {
            window.location.href = 'admin.html';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
});
