// VoteNow - Admin Panel Script (Firebase Version)

// Check admin authentication
const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated');
if (isAdminAuthenticated !== 'true') {
    window.location.href = 'login.html';
}

// Poll Data Structure
let pollData = {
    title: "",
    description: "",
    options: []
};

// DOM Elements
const pollForm = document.getElementById('pollForm');
const pollTitleInput = document.getElementById('pollTitleInput');
const pollDescInput = document.getElementById('pollDescInput');
const optionsList = document.getElementById('optionsList');
const addOptionBtn = document.getElementById('addOptionBtn');
const resetVotesBtn = document.getElementById('resetVotesBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const successAlert = document.getElementById('successAlert');
const errorAlert = document.getElementById('errorAlert');
const statsGrid = document.getElementById('statsGrid');

// Load data from Firebase
async function loadData() {
    try {
        pollData = await FirebaseHelper.getPollData();
        populateForm();
        renderStats();
    } catch (error) {
        console.error('Error loading data:', error);
        showAlert('error');
    }
}

// Setup real-time listeners
function setupRealtimeListeners() {
    FirebaseHelper.onPollDataChange((data) => {
        if (data) {
            pollData = data;
            renderStats();
        }
    });
}

// Show alert
function showAlert(type, duration = 3000) {
    const alert = type === 'success' ? successAlert : errorAlert;
    alert.classList.add('active');
    setTimeout(() => {
        alert.classList.remove('active');
    }, duration);
}

// Render statistics
function renderStats() {
    const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
    const totalOptions = pollData.options.length;
    const leadingOption = pollData.options.reduce((max, opt) =>
        opt.votes > max.votes ? opt : max, pollData.options[0] || { votes: 0 });

    statsGrid.innerHTML = `
    <div class="stat-card">
      <span class="stat-value">${totalVotes}</span>
      <span class="stat-label">Total Votes</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${totalOptions}</span>
      <span class="stat-label">Options</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${leadingOption.votes}</span>
      <span class="stat-label">Leading Option</span>
    </div>
  `;
}

// Populate form with current data
function populateForm() {
    pollTitleInput.value = pollData.title;
    pollDescInput.value = pollData.description;
    renderOptions();
}

// Render options list
function renderOptions() {
    optionsList.innerHTML = '';

    pollData.options.forEach((option, index) => {
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';

        optionItem.innerHTML = `
      <input 
        type="text" 
        class="form-input option-input" 
        value="${option.label}"
        data-option-id="${option.id}"
        placeholder="Option ${index + 1}"
        required
      >
      <button 
        type="button" 
        class="btn-icon btn-remove"
        data-option-id="${option.id}"
        ${pollData.options.length <= 2 ? 'disabled' : ''}
      >
        ✕
      </button>
    `;

        optionsList.appendChild(optionItem);
    });

    // Attach remove listeners
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => removeOption(parseInt(btn.dataset.optionId)));
    });
}

// Add new option
function addOption() {
    const newId = pollData.options.length > 0
        ? Math.max(...pollData.options.map(opt => opt.id)) + 1
        : 1;

    pollData.options.push({
        id: newId,
        label: '',
        votes: 0
    });

    renderOptions();

    // Focus on the new input
    const inputs = document.querySelectorAll('.option-input');
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
}

// Remove option
function removeOption(optionId) {
    if (pollData.options.length <= 2) {
        showAlert('error');
        return;
    }

    pollData.options = pollData.options.filter(opt => opt.id !== optionId);
    renderOptions();
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    // Get updated values
    const title = pollTitleInput.value.trim();
    const description = pollDescInput.value.trim();

    if (!title || !description) {
        showAlert('error');
        return;
    }

    // Update options labels
    const optionInputs = document.querySelectorAll('.option-input');
    let allFilled = true;

    optionInputs.forEach(input => {
        const id = parseInt(input.dataset.optionId);
        const label = input.value.trim();

        if (!label) {
            allFilled = false;
            return;
        }

        const option = pollData.options.find(opt => opt.id === id);
        if (option) {
            option.label = label;
        }
    });

    if (!allFilled || pollData.options.length < 2) {
        showAlert('error');
        return;
    }

    // Update poll data
    pollData.title = title;
    pollData.description = description;

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        // Save to Firebase
        await FirebaseHelper.savePollData(pollData);
        renderStats();
        showAlert('success');
    } catch (error) {
        console.error('Error saving data:', error);
        showAlert('error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Reset votes only
async function resetVotes() {
    if (!confirm('Are you sure you want to reset all votes? This cannot be undone.')) {
        return;
    }

    try {
        await FirebaseHelper.resetAllVotes();
        await loadData();
        showAlert('success');
    } catch (error) {
        console.error('Error resetting votes:', error);
        showAlert('error');
    }
}

// Reset everything
async function resetAll() {
    if (!confirm('Are you sure you want to reset EVERYTHING? This will clear all data and cannot be undone.')) {
        return;
    }

    // Confirm again for safety
    if (!confirm('This is your last chance. Reset everything?')) {
        return;
    }

    try {
        await FirebaseHelper.resetEverything();
        await loadData();
        showAlert('success');
    } catch (error) {
        console.error('Error resetting everything:', error);
        showAlert('error');
    }
}

// Admin logout
function adminLogout() {
    // Clean up Firebase listeners
    FirebaseHelper.offPollDataChange();

    sessionStorage.removeItem('adminAuthenticated');
    window.location.href = 'login.html';
}

// Attach logout listener
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', adminLogout);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    FirebaseHelper.offPollDataChange();
});

// Initialize
async function init() {
    await loadData();
    setupRealtimeListeners();

    // Event listeners
    pollForm.addEventListener('submit', handleSubmit);
    addOptionBtn.addEventListener('click', addOption);
    resetVotesBtn.addEventListener('click', resetVotes);
    resetAllBtn.addEventListener('click', resetAll);
}

// Start the app
init();
