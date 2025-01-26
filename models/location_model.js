import { DataTypes } from 'sequelize';
import sequelizeDB from '../db_middleware/user_db.js';  // Your Sequelize instance
import UserModel from './user_model.js';  // Assuming you have a User model

const LocationModel = sequelizeDB.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  // Ensures the `id` is auto-incremented
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,  // Required field
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,  // Optional field
  },

  createdBy: {
    type: DataTypes.INTEGER,  // Assuming the User model's primary key is an integer
    references: {
      model: UserModel,  // Refers to the User model
      key: 'id',  // Assuming the User model's primary key is 'id'
    },
    allowNull: false,  // Optional: Set to true if it can be null
  },
  editedBy: {
    type: DataTypes.INTEGER,  // Assuming the User model's primary key is an integer
    references: {
      model: UserModel,  // Refers to the User model
      key: 'id',  // Assuming the User model's primary key is 'id'
    },
    allowNull: true,  // Optional: Set to true if it can be null
  },

}, {
  timestamps: false,  // Automatically adds createdAt and updatedAt
  tableName: 'Locations',  // Explicitly set the table name if needed
});

LocationModel.belongsTo(UserModel, { foreignKey: 'createdBy', as: 'creator' });  // Define relationship for createdBy
LocationModel.belongsTo(UserModel, { foreignKey: 'editedBy', as: 'editor' });    // Define relationship for editedBy

// Define the inverse relationship (LocationModel has many Users)
LocationModel.hasMany(UserModel, {
  foreignKey: 'location',  // Foreign key in UserModel pointing to LocationModel
  as: 'users',             // Alias for the relationship
});

export default LocationModel;
