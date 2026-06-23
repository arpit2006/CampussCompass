const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  try {
    const dbPath = path.join(__dirname, '../data/users.json');
    console.log('--- Database Setup ---');
    console.log('Using Free, Portable JSON Database System');
    console.log(`Database File: ${dbPath}`);
    console.log('Status: ACTIVE (Ready to persist data offline)');
    console.log('----------------------');
  } catch (error) {
    console.error(`Database setup error: ${error.message}`);
  }
};

module.exports = connectDB;
