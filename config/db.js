const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Force Vercel's bundler to include the PostgreSQL driver ('pg') and helper ('pg-hstore')
// since Sequelize loads dialects dynamically, which Vercel's static file tracing (nft) misses.
try {
  require('pg');
  require('pg-hstore');
} catch (e) {
  // Ignore local resolution errors if they occur
}

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
} else if (process.env.VERCEL) {
  console.log('--- Database Setup ---');
  console.log('Vercel environment detected but DATABASE_URL is missing. Using PostgreSQL placeholder connection.');

  // Use postgres dialect placeholder to avoid sqlite3 compilation/load error on Vercel
  sequelize = new Sequelize('postgres://localhost:5432/placeholder', {
    dialect: 'postgres',
    logging: false
  });
} else {
  console.log('--- Database Setup ---');
  console.log('Using Free, Portable SQLite Database (Local Mode)');

  // Ensure the data directory exists locally
  const dbDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'database.sqlite');
  console.log(`Database File: ${dbPath}`);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

const connectDB = async () => {
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing. Please configure your remote PostgreSQL database connection string in your Vercel Project settings.');
  }

  try {
    await sequelize.authenticate();
    console.log('Database Status: ACTIVE (Connection established successfully)');
    console.log('----------------------');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('----------------------');
    if (process.env.VERCEL) {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = {
  sequelize,
  connectDB
};
