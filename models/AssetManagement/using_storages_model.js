import { DataTypes } from 'sequelize';
import sequelizeDB from '../../db_middleware/user_db.js';
import StorageModel from '../storage_model.js';
import DeviceModel from '../device_model.js';

const UsingStoragesModel = sequelizeDB.define('Using_Storages', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  storage_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: StorageModel,
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
  tableName: 'Using_Storages',
});

UsingStoragesModel.belongsTo(StorageModel, { foreignKey: 'storage_id' });
UsingStoragesModel.belongsTo(DeviceModel, { foreignKey: 'device_id' });


export default UsingStoragesModel;
