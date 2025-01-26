import { DataTypes } from 'sequelize';
import sequelizeDB from '../db_middleware/user_db.js';  // Your Sequelize instance
import LocationModel from './location_model.js';  // Ensure this import is before using LocationModel

const userLogo = '../../Frontend/src/assets/user-logo.webp'; // Default image path

const UserModel = sequelizeDB.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    select: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: userLogo,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
  },
}, {
  timestamps: true,
  tableName: 'Users',
});



export default UserModel;
