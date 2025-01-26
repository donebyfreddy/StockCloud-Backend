import UsingUsersModel from '../models/AssetManagement/using_users_model.js'; 
import UsingStoragesModel from '../models/AssetManagement/using_storages_model.js'; 

import UserModel from '../models/user_model.js'; 
import DeviceModel from '../models/device_model.js'; 
import StorageModel from '../models/storage_model.js'; 
import LocationModel from '../models/location_model.js'; 

export const getAllAssetsUsers = async (req, res) => {
  try {
    const users = await UsingUsersModel.findAll({
      include: [
        {
          model: UserModel, // Include user details
          attributes: ['id', 'name', 'email'], // User attributes to fetch
        },
        {
          model: DeviceModel, // Include device details
          attributes: ['id', 'serial_number', 'type', 'manufacturer', 'model'], // Exclude location ID here
          include: [
            {
              model: LocationModel, // Include the LocationModel
              as: 'locationData',
              attributes: ['id', 'name'], // Fetch the location name
            },
          ],
        },
      ],
    });

    // Respond with the users and related data
    res.status(200).json({
      success: true,
      data: users, // Return the users with related information
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



export const getAllAssetsStorages = async (req, res) => {
  try {
    const storages = await UsingStoragesModel.findAll({
      include: [
        {
          model: StorageModel, // Include storage details
          attributes: ['id', 'name'], // Storage attributes to fetch
        },
        {
          model: DeviceModel, // Include device details
          attributes: ['id', 'serial_number', 'type', 'manufacturer', 'model'], // Exclude location ID here
          include: [
            {
              model: LocationModel, // Include the LocationModel
              as: 'locationData',
              attributes: ['id', 'name'], // Fetch the location name
            },
          ],
        },
      ],
    });

    // Respond with the storages and related data
    res.status(200).json({
      success: true,
      data: storages, // Return the storages with related information
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



export const createNewAssetUsers = async (req, res) => {
  try {
    const { user_id, device_id} = req.body;

    if (!user_id || !device_id) {
      return res.status(400).json({
        success: false,
        message: "All fields (user, device) are required.",
      });
    }

    const newAssetUser = await UsingUsersModel.create({
      user_id,
      device_id,
    });

    console.log('NewAssetUser', newAssetUser)


    res.status(201).json({
      success: true,
      data: newAssetUser,
      message: "New asset user record created successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createNewAssetStorages = async (req, res) => {
  try {
    const { storage_id, device_id } = req.body;

    if (!storage_id || !device_id) {
      return res.status(400).json({
        success: false,
        message: "All fields (storageId, device) are required.",
      });
    }

    const newAssetStorage = await UsingStoragesModel.create({
      storage_id,
      device_id,
    });

    console.log('NewAssetStorage', newAssetStorage)


    res.status(201).json({
      success: true,
      data: newAssetStorage,
      message: "New asset storage record created successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};