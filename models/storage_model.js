import { DataTypes } from 'sequelize';
import sequelizeDB from '../db_middleware/user_db.js';  // Your Sequelize instance

import LocationModel from './location_model.js';  // Assuming you have a Location model

const StorageModel = sequelizeDB.define('Storage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  // Ensures the `id` is auto-incremented
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.INTEGER,  // Assuming the Location model's primary key is an integer
    references: {
      model: LocationModel,  // Refers to the Location model
      key: 'id',  // Assuming the Location model's primary key is 'id'
    },
    allowNull: false,  // Required field
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,  // Optional field
  },
  status: {
    type: DataTypes.ENUM('OK', 'PENDING', 'ERROR'),
    defaultValue: 'OK',
  },
}, {
  timestamps: false,  // Automatically adds createdAt and updatedAt
  tableName: 'Storages',  // Explicitly set the table name if needed
});

// Define relationship with Location
StorageModel.belongsTo(LocationModel, { foreignKey: 'location', as: 'locationData' });

export default StorageModel;
