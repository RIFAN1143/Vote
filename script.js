// VoteNow - Main Application Script (Firebase Version)

// Check authentication
const currentUser = sessionStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'login.html';
}

// Poll Data Structure
let pollData = {
    title: "",
    description: "",
    options: []
};

// DOM Elements
const voteForm = document.getElementById('voteForm');
const voteOptions = document.getElementById('voteOptions');
const submitBtn = document.getElementById('submitBtn');
const resultsContainer = document.getElementById('resultsContainer');
const resultsContent = document.getElementById('resultsContent');
const totalVotesEl = document.getElementById('totalVotes');
const backToVoteBtn = document.getElementById('backToVoteBtn');
const successMessage = document.getElementById('successMessage');
const pollTitle = document.getElementById('pollTitle');
const pollDescription = document.getElementById('pollDescription');

// State
let selectedOption = null;
let hasVoted = false;

// Load poll data from Firebase
async function loadVoteData() {
    try {
        pollData = await FirebaseHelper.getPollData();
        renderPoll();
    } catch (error) {
        console.error('Error loading poll data:', error);
        alert('Error loading poll data. Please refresh the page.');
    }
}

// Check if user can vote (24 hour check)
async function checkUserVoteStatus() {
    try {
        const canVote = await FirebaseHelper.canUserVote(currentUser);
        hasVoted = !canVote;

        if (hasVoted) {
            showResults();
        } else {
            renderVoteOptions();
        }
    } catch (error) {
        console.error('Error checking vote status:', error);
    }
}

// Initialize the application
async function init() {
    try {
        await loadVoteData();
        await checkUserVoteStatus();
        attachEventListeners();
        setupRealtimeListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Setup real-time listeners for poll changes
function setupRealtimeListeners() {
    FirebaseHelper.onPollDataChange((data) => {
        if (data) {
            pollData = data;
            renderPoll();
            if (hasVoted) {
                renderResults();
            } else {
                renderVoteOptions();
            }
        }
    });
}

// Render poll title and description
function renderPoll() {
    pollTitle.textContent = pollData.title;
    pollDescription.textContent = pollData.description;
}

// Render vote options
function renderVoteOptions() {
    voteOptions.innerHTML = '';

    pollData.options.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'vote-option';
        optionEl.dataset.optionId = option.id;

        optionEl.innerHTML = `
      <div class="option-content">
        <div class="option-radio"></div>
        <div class="option-label">${option.label}</div>
      </div>
    `;

        optionEl.addEventListener('click', () => selectOption(option.id));
        voteOptions.appendChild(optionEl);
    });
}

// Select an option
function selectOption(optionId) {
    selectedOption = optionId;

    // Update UI
    document.querySelectorAll('.vote-option').forEach(el => {
        el.classList.remove('selected');
    });

    const selectedEl = document.querySelector(`[data-option-id="${optionId}"]`);
    if (selectedEl) {
        selectedEl.classList.add('selected');
    }

    submitBtn.disabled = false;
}

// Handle vote submission
async function handleVoteSubmit(e) {
    e.preventDefault();

    if (!selectedOption) {
        return;
    }

    // Disable button to prevent double-voting
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Record vote in Firebase
        pollData = await FirebaseHelper.recordVote(currentUser, selectedOption);
        hasVoted = true;

        // Show success message
        successMessage.classList.add('active');

        // Transition to results after a delay
        setTimeout(() => {
            successMessage.classList.remove('active');
            showResults();
            submitBtn.textContent = 'Cast Your Vote';
        }, 2000);
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('Error submitting vote. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cast Your Vote';
    }
}

// Calculate total votes
function getTotalVotes() {
    return pollData.options.reduce((sum, option) => sum + option.votes, 0);
}

// Show results
function showResults() {
    voteForm.style.display = 'none';
    resultsContainer.classList.add('active');

    renderResults();
}

// Render results
function renderResults() {
    const totalVotes = getTotalVotes();
    totalVotesEl.textContent = totalVotes;

    resultsContent.innerHTML = '';

    // Sort options by votes (descending)
    const sortedOptions = [...pollData.options].sort((a, b) => b.votes - a.votes);

    sortedOptions.forEach(option => {
        const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        resultItem.innerHTML = `
      <div class="result-header">
        <div class="result-label">${option.label}</div>
        <div class="result-stats">
          <div class="result-percentage">${percentage}%</div>
          <div class="result-votes">${option.votes} ${option.votes === 1 ? 'vote' : 'votes'}</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
    `;

        resultsContent.appendChild(resultItem);
    });

    // Animate progress bars
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach(el => {
            const width = el.style.width;
            el.style.width = '0';
            setTimeout(() => {
                el.style.width = width;
            }, 100);
        });
    }, 100);
}

// Go back to voting
async function backToVote() {
    try {
        // Check if user can vote again
        const canVote = await FirebaseHelper.canUserVote(currentUser);

        if (!canVote) {
            const hoursRemaining = await FirebaseHelper.getTimeUntilNextVote(currentUser);
            const hours = Math.floor(hoursRemaining);
            const minutes = Math.floor((hoursRemaining - hours) * 60);
            alert(`You can vote again in ${hours}h ${minutes}m`);
            return;
        }

        hasVoted = false;
        selectedOption = null;

        voteForm.style.display = 'block';
        resultsContainer.classList.remove('active');
        submitBtn.disabled = true;

        renderVoteOptions();
    } catch (error) {
        console.error('Error checking vote status:', error);
        alert('Error checking vote status. Please try again.');
    }
}

// Attach event listeners
function attachEventListeners() {
    voteForm.addEventListener('submit', handleVoteSubmit);
    backToVoteBtn.addEventListener('click', backToVote);
}

// Display current user
function displayCurrentUser() {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay && currentUser) {
        userDisplay.textContent = currentUser;
    }
}

// Logout functionality
function logout() {
    // Clean up Firebase listeners
    FirebaseHelper.offPollDataChange();

    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Attach logout listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
    logoutBtn.addEventListener('mouseenter', (e) => {
        e.target.style.background = 'rgba(245, 87, 108, 0.2)';
        e.target.style.borderColor = 'var(--accent-red)';
        e.target.style.color = 'var(--accent-red)';
    });
    logoutBtn.addEventListener('mouseleave', (e) => {
        e.target.style.background = 'rgba(255,255,255,0.1)';
        e.target.style.borderColor = 'rgba(255,255,255,0.2)';
        e.target.style.color = 'var(--text-secondary)';
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    FirebaseHelper.offPollDataChange();
});

// Start the application
displayCurrentUser();
init();
