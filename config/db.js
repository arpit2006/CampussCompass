const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

let sequelize;

if (process.env.DATABASE_URL) {
  console.log('--- Database Setup ---');
  console.log('Connecting to SQL Database (Production Mode)');
  
  const options = {
    dialect: 'postgres',
    logging: false,
  };

  // Enable SSL config for Heroku/Render/Supabase PostgreSQL
  if (process.env.DATABASE_URL.startsWith('postgres')) {
    options.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  }

  sequelize = new Sequelize(process.env.DATABASE_URL, options);
} else {
  console.log('--- Database Setup ---');
  console.log('Using Free, Portable SQLite Database (Local Mode)');
  
  let dbPath;
  if (process.env.VERCEL) {
    // Vercel serverless environment is read-only, write SQLite DB to /tmp
    dbPath = '/tmp/database.sqlite';
    console.log('Serverless environment detected (Vercel). Writing SQLite database to /tmp.');
  } else {
    // Ensure the data directory exists locally
    const dbDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'database.sqlite');
  }

  console.log(`Database File: ${dbPath}`);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database Status: ACTIVE (Connection established successfully)');
    console.log('----------------------');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('----------------------');
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};
