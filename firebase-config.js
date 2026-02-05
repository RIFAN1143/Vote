// Firebase Configuration
// Replace these values with your own Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
    apiKey: "AIzaSyATgwGhFWenMyR4eo0rUc4hc4_1T4Kfzho",
    authDomain: "vote-10f30.firebaseapp.com",
    projectId: "vote-10f30",
    storageBucket: "vote-10f30.firebasestorage.app",
    messagingSenderId: "983645100186",
    appId: "1:983645100186:web:1ec25c4358559cf8956723",
    measurementId: "G-0M47BTHHKP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database();

// Database references
const dbRefs = {
    pollData: database.ref('pollData'),
    voters: database.ref('voters'),
    sessions: database.ref('sessions')
};

// Helper functions for Firebase operations
const FirebaseHelper = {
    // Get poll data
    async getPollData() {
        const snapshot = await dbRefs.pollData.once('value');
        return snapshot.val() || {
            title: "What's Your Favorite Technology?",
            description: "Help us understand the community's preferences by voting for your favorite technology stack",
            options: [
                { id: 1, label: "React - Modern UI Library", votes: 0 },
                { id: 2, label: "Vue.js - Progressive Framework", votes: 0 },
                { id: 3, label: "Angular - Complete Solution", votes: 0 },
                { id: 4, label: "Svelte - Compiler-based Framework", votes: 0 }
            ]
        };
    },

    // Save poll data
    async savePollData(data) {
        await dbRefs.pollData.set(data);
    },

    // Get voter data
    async getVoter(username) {
        const snapshot = await database.ref(`voters/${this.sanitizeKey(username)}`).once('value');
        return snapshot.val();
    },

    // Save voter data
    async saveVoter(username, data) {
        await database.ref(`voters/${this.sanitizeKey(username)}`).set(data);
    },

    // Get all voters
    async getAllVoters() {
        const snapshot = await dbRefs.voters.once('value');
        return snapshot.val() || {};
    },

    // Record a vote
    async recordVote(username, optionId) {
        const pollData = await this.getPollData();

        // Increment vote count
        const option = pollData.options.find(opt => opt.id === optionId);
        if (option) {
            option.votes++;
        }

        // Save updated poll data
        await this.savePollData(pollData);

        // Record voter timestamp
        await this.saveVoter(username, {
            lastVote: Date.now(),
            name: username,
            votedFor: optionId
        });

        return pollData;
    },

    // Check if user can vote
    async canUserVote(username) {
        const voter = await this.getVoter(username);

        if (!voter) {
            return true; // New voter
        }

        const lastVoteTime = voter.lastVote;
        const now = Date.now();
        const hoursSinceVote = (now - lastVoteTime) / (1000 * 60 * 60);

        return hoursSinceVote >= 24;
    },

    // Get time until next vote
    async getTimeUntilNextVote(username) {
        const voter = await this.getVoter(username);

        if (!voter) {
            return 0;
        }

        const lastVoteTime = voter.lastVote;
        const now = Date.now();
        const hoursRemaining = 24 - ((now - lastVoteTime) / (1000 * 60 * 60));

        return Math.max(0, hoursRemaining);
    },

    // Reset all votes
    async resetAllVotes() {
        const pollData = await this.getPollData();
        pollData.options.forEach(opt => {
            opt.votes = 0;
        });
        await this.savePollData(pollData);
        await dbRefs.voters.remove();
    },

    // Reset everything
    async resetEverything() {
        await dbRefs.pollData.remove();
        await dbRefs.voters.remove();
        // Set default data
        await this.savePollData({
            title: "What's Your Favorite Technology?",
            description: "Help us understand the community's preferences by voting for your favorite technology stack",
            options: [
                { id: 1, label: "React - Modern UI Library", votes: 0 },
                { id: 2, label: "Vue.js - Progressive Framework", votes: 0 },
                { id: 3, label: "Angular - Complete Solution", votes: 0 },
                { id: 4, label: "Svelte - Compiler-based Framework", votes: 0 }
            ]
        });
    },

    // Listen for poll data changes
    onPollDataChange(callback) {
        dbRefs.pollData.on('value', (snapshot) => {
            callback(snapshot.val());
        });
    },

    // Stop listening for changes
    offPollDataChange() {
        dbRefs.pollData.off('value');
    },

    // Sanitize Firebase key (remove invalid characters)
    sanitizeKey(key) {
        return key.replace(/[.#$/[\]]/g, '_');
    }
};
