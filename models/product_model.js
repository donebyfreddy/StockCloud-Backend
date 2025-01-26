import { DataTypes } from 'sequelize';
import sequelizeDB from '../db_middleware/user_db.js';  // Your Sequelize instance
import UserModel from './user_model.js';  // Assuming you have a User model

const ProductModel = sequelizeDB.define('Product', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serialNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Assuming serialNo should be unique
  },
  createdBy: {
    type: DataTypes.INTEGER,  // Assuming the User model's primary key is an integer
    references: {
      model: UserModel,
      key: 'id',
    },
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,  // Default to the current date/time
  },
  rackMountable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfPurchase: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  warrantyMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user: {
    type: DataTypes.ENUM('normal user', 'department', 'admin'),
    defaultValue: 'normal user',
    allowNull: false,
  },
  history: {
    type: DataTypes.JSONB,  // Alternatively, use a JOIN table if necessary
    allowNull: true,  // Assuming this is an optional field
  },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  tableName: 'Products',  // Explicitly set the table name if needed
});

// Define relationships
ProductModel.belongsTo(UserModel, { foreignKey: 'createdBy', as: 'creator' });

export default ProductModel;
