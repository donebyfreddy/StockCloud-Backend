import { DataTypes } from 'sequelize';
import sequelizeDB from '../db_middleware/user_db.js';
import LocationModel from './location_model.js';

const DeviceModel = sequelizeDB.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
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
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  warranty_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSONB,  // For PostgreSQL
    allowNull: true,
  },
}, {
  timestamps: false,  // Automatically adds createdAt and updatedAt
  tableName: 'Devices',  // Explicitly set the table name
});

// Create association to LocationModel
DeviceModel.belongsTo(LocationModel, { foreignKey: 'location', as: 'locationData' });

export default DeviceModel;
