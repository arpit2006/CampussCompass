const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/users.json');

// Helper to ensure database folder and file exist
const initDb = () => {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing JSON database:', error);
  }
};

initDb();

class User {
  constructor(data) {
    this._id = data._id || Date.now().toString();
    this.email = data.email;
    this.password = data.password;
    this.isProfileComplete = data.isProfileComplete !== undefined ? data.isProfileComplete : false;
    this.profile = data.profile || {};
    this.profile.fullName = this.profile.fullName || '';
    this.profile.collegeName = this.profile.collegeName || '';
    this.profile.branch = this.profile.branch || '';
    this.profile.currentYear = this.profile.currentYear || '';
    this.profile.cgpa = this.profile.cgpa !== undefined ? this.profile.cgpa : null;
    this.profile.careerGoal = this.profile.careerGoal || '';
    this.profile.skills = this.profile.skills || [];
    this.profile.interests = this.profile.interests || [];
    this.profile.dailyStudyHours = this.profile.dailyStudyHours !== undefined ? this.profile.dailyStudyHours : null;
    this.profile.githubUsername = this.profile.githubUsername || '';
    this.profile.leetcodeUsername = this.profile.leetcodeUsername || '';

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Mimic Mongoose instance save() method
  async save() {
    const users = User.getAll();
    const index = users.findIndex(u => u._id === this._id);

    // Hash password if it's not already hashed
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    this.updatedAt = new Date().toISOString();

    const userData = this.toJSON();

    if (index === -1) {
      users.push(userData);
    } else {
      users[index] = userData;
    }

    User.saveAll(users);
    return this;
  }

  // Mimic Mongoose password matching method
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Serialize object data
  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      password: this.password,
      isProfileComplete: this.isProfileComplete,
      profile: this.profile,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // --- Static Database Operations ---

  // Read all users from the file
  static getAll() {
    try {
      initDb();
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading from JSON database:', e);
      return [];
    }
  }

  // Write all users to the file
  static saveAll(users) {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    } catch (e) {
      console.error('Error writing to JSON database:', e);
    }
  }

  // Mimic Mongoose findOne()
  static async findOne({ email }) {
    if (!email) return null;
    const users = this.getAll();
    const userObj = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return userObj ? new User(userObj) : null;
  }

  // Mimic Mongoose findById()
  static async findById(id) {
    if (!id) return null;
    const users = this.getAll();
    const userObj = users.find(u => u._id === id);
    return userObj ? new User(userObj) : null;
  }
}

module.exports = User;
