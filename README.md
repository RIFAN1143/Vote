# VoteNow - Modern Voting Platform

A stunning, modern voting website with user authentication and 24-hour vote restrictions.

## ✨ Features

### 🔐 User Authentication
- **User Login**: Each voter must log in with their name
- **One Vote Per Person**: Users are tracked by name to prevent duplicate voting
- **24-Hour Reset**: Users can vote again 24 hours after their last vote
- **Session Management**: Secure session handling with automatic logout

### 👨‍💼 Admin Panel
- **Secure Login**: Admin access protected by username/password
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`
- **Poll Management**: Edit poll title, description, and options
- **Statistics Dashboard**: View total votes, option count, and leading option
- **Reset Controls**: Reset votes or reset everything

### 🎨 Modern Design
- Dark mode with glassmorphism effects
- Premium gradients and animations
- Smooth micro-interactions
- Fully responsive layout
- SEO optimized

## 🚀 Quick Start

1. **Start Voting**: Open `login.html` in your browser
2. **User Login**: Enter your name to participate
3. **Cast Your Vote**: Select an option and submit
4. **View Results**: See real-time vote statistics
5. **Admin Access**: Click settings icon → Login with admin credentials

## 📁 File Structure

```
Vote/
├── login.html          # Authentication page (START HERE)
├── login-script.js     # Login logic with 24-hour tracking
├── index.html          # Main voting interface
├── script.js           # Voting functionality
├── admin.html          # Admin panel
├── admin-script.js     # Admin functionality
└── style.css           # Complete design system
```

## 🔑 How It Works

### Voting Flow

1. **Login** (`login.html`)
   - User enters their name
   - System checks if they voted in the last 24 hours
   - If eligible, redirected to voting page
   - If not, shown time remaining until next vote

2. **Vote** (`index.html`)
   - Select a poll option
   - Submit vote
   - Vote is recorded with timestamp
   - Results displayed immediately

3. **24-Hour Restriction**
   - Each vote is timestamped per user
   - System calculates hours since last vote
   - Re-voting blocked until 24 hours elapsed
   - "Vote Again" button shows countdown if too early

### Admin Flow

1. **Admin Login** (`login.html`)
   - Click "Admin Login" tab
   - Enter credentials (admin/admin123)
   - Authenticated via sessionStorage

2. **Manage Poll** (`admin.html`)
   - Edit poll content and options
   - View real-time statistics
   - Reset votes or all data
   - Changes sync to main page instantly

## 💾 Data Storage

### localStorage
- **voteNowData**: Poll title, description, options, and vote counts
- **voters**: Object mapping usernames to vote timestamps
  ```javascript
  {
    "John Doe": {
      "lastVote": 1738738846000,
      "name": "John Doe"
    }
  }
  ```

### sessionStorage
- **currentUser**: Currently logged-in voter name
- **adminAuthenticated**: Admin login status ("true" or not set)

## 🛡️ Security Features

1. **Authentication Required**: All pages redirect to login if not authenticated
2. **Admin Protection**: Admin panel requires separate login credentials
3. **Vote Tracking**: Prevents duplicate voting within 24 hours
4. **Session-Based**: Uses sessionStorage for temporary sessions
5. **Logout Functionality**: Clear session on logout

## ⚙️ Configuration

### Change Admin Credentials
Edit `login-script.js`:
```javascript
const ADMIN_CREDENTIALS = {
  username: 'your_username',
  password: 'your_password'
};
```

### Adjust Vote Reset Time
Edit `login-script.js` and `script.js` - Change all instances of `24` (hours):
```javascript
return hoursSinceVote >= 24; // Change 24 to desired hours
```

## 📊 User Experience

### For Voters
1. Open `login.html`
2. Enter your name
3. Select your preferred option
4. View results
5. Return after 24 hours to vote again

### For Administrators
1. Open `login.html`
2. Switch to "Admin Login" tab
3. Enter credentials
4. Manage poll settings
5. Monitor statistics
6. Reset votes as needed

## 🎯 Key Features in Detail

### 24-Hour Vote Reset
- Each user's vote is timestamped
- System calculates time since last vote
- Users see countdown: "You can vote again in 23h 45m"
- Automatic eligibility check on login

### Session Management
- Session-based authentication (not persistent)
- Closing browser clears session
- Must re-login after browser close
- Separate sessions for voters and admins

### Real-Time Updates
- Vote counts update immediately
- Results refresh automatically
- Admin changes sync to main page
- Progress bars animate on load

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- LocalStorage and SessionStorage support
- ES6 JavaScript features

### No Server Required
- Runs entirely in the browser
- No backend needed
- Data persists locally
- Perfect for offline use

## 📝 Notes

⚠️ **Important**: This is a client-side implementation. For production use:
- Move authentication to a server
- Use a real database
- Implement proper security measures
- Add HTTPS encryption
- Use secure password hashing

💡 **Tip**: Clear localStorage to reset all data:
```javascript
localStorage.clear();
```

🔐 **Default Admin Credentials** are shown on the login page for convenience. Change them in production!

---

**Built with ❤️ using vanilla JavaScript, HTML, and CSS**
