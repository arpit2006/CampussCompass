const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Mimic Mongoose instance password matching method
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // --- Static Mongoose-like Wrapper Methods for Backwards Compatibility ---

  // Mimic User.findOne({ email })
  static async findOne(query) {
    if (!query) return null;

    // If it's already a standard Sequelize options object
    if (query.where) {
      return await super.findOne(query);
    }

    // Fallback: it's a legacy simple query object (e.g., { email })
    return await super.findOne({ where: query });
  }

  // Mimic User.findById(id)
  static async findById(id) {
    if (!id) return null;
    return await super.findByPk(id);
  }

  // Mimic User.getAll() as an async method
  static async getAll() {
    return await super.findAll();
  }
}

User.init(
  {
    _id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => Date.now().toString(),
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isProfileComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    profile: {
      type: DataTypes.JSON,
      defaultValue: {},
      get() {
        const rawValue = this.getDataValue('profile');
        const val = rawValue
          ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue)
          : {};

        // Ensure default properties exist to prevent EJS rendering crashes
        return {
          fullName: val.fullName || '',
          collegeName: val.collegeName || '',
          branch: val.branch || '',
          currentYear: val.currentYear || '',
          cgpa: val.cgpa !== undefined ? val.cgpa : null,
          careerGoal: val.careerGoal || '',
          skills: val.skills || [],
          interests: val.interests || [],
          dailyStudyHours: val.dailyStudyHours !== undefined ? val.dailyStudyHours : null,
          githubUsername: val.githubUsername || '',
          leetcodeUsername: val.leetcodeUsername || '',
          ...val
        };
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    hooks: {
      beforeSave: async (user) => {
        // Hash password if created or changed
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        // Force mark JSON profile field as changed so nested properties are persisted
        user.changed('profile', true);
      }
    }
  }
);

module.exports = User;
