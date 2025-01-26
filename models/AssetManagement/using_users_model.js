import { DataTypes } from 'sequelize';
import sequelizeDB from '../../db_middleware/user_db.js';
import UserModel from '../user_model.js';
import DeviceModel from '../device_model.js';

const UsingUsersModel = sequelizeDB.define('Using_Users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id',
    },
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DeviceModel,
      key: 'id',
    },
  },
}, {
  timestamps: false,  // Enables createdAt and updatedAt timestamps
  tableName: 'Using_Users',
});

UsingUsersModel.belongsTo(UserModel, { foreignKey: 'user_id'});
UsingUsersModel.belongsTo(DeviceModel, { foreignKey: 'device_id'});


export default UsingUsersModel;
