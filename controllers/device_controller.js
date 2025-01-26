import DeviceModel from "../models/device_model.js";
import LocationModel from "../models/location_model.js";
import { Op } from "sequelize";
import moment from 'moment'; // Import moment.js



// Fetch all devices with optional search, filtering, and pagination
export const getAllDevices = async (req, res) => {
  try {
    const devices = await DeviceModel.findAll({
      include: [
        {
          model: LocationModel,
          as: 'locationData',  // Alias used for the relationship in the model
          attributes: ['name'], // Only fetch the 'name' of the location
        },
      ],
    });


    // Respond with the storages data
    res.status(200).json({
      success: true,
      devices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getDevicesWithWarrantyBelowSixMonths = async (req, res) => {
  try {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    // Format the date to match SQL date format (YYYY-MM-DD)
    const formattedDate = sixMonthsFromNow.toISOString().slice(0, 10); // Slice only the date part (YYYY-MM-DD)

    const devices = await DeviceModel.findAll({
      where: {
        warranty_date: {
          [Op.lt]: formattedDate, // Use Op.lt for less than
        },
      },
    });

    res.status(200).json({
      success: true,
      devices,
      message: devices.length
        ? "Devices with warranty below 6 months found"
        : "No devices with warranty below 6 months found",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Count the total number of devices
export const countDevices = async (req, res) => {
  try {
    console.log('Counting devices...');
    const deviceCount = await DeviceModel.count();
    console.log(`Device count: ${deviceCount}`);

    res.status(200).json({
      success: true,
      totalDevices: deviceCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Fetch a specific device by ID
export const getDeviceById = async (req, res) => {
  try {
    const device = await DeviceModel.findByPk(req.params.id); // Sequelize method to find by primary key

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      device,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Create a new device
export const createDevice = async (req, res) => {
  try {
    const { serial_number, type, manufacturer, model, 
      location, purchase_date, warranty_date, status, description, details } = req.body;

    const locationDoc = await LocationModel.findOne({ where: { name: location } });

    if (!locationDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid location name provided",
      });
    }
    const locationPk = parseInt(locationDoc.id, 10);

    console.log('PurchaseDateFormatted:', purchase_date);
    console.log('WarrantyDateFormatted:', warranty_date);

    const deviceData = {
      serial_number,
      type,
      manufacturer,
      model,
      location: locationPk,
      status,
      purchase_date,
      warranty_date,
      description,
      details
    };

    const device = await DeviceModel.create(deviceData);

    console.log('Device created:', device);

    res.status(201).json({
      success: true,
      message: "Device created successfully",
      device,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};


// Update a device by ID
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const device = await DeviceModel.findByPk(id); // Sequelize method to find by primary key
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Update the device
    await device.update(updatedData);

    res.status(200).json({
      success: true,
      message: "Device updated successfully",
      device,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a device by ID
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await DeviceModel.findByPk(id); // Sequelize method to find by primary key
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    await device.destroy(); // Delete the device

    res.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch distinct device manufacturers
export const getDeviceManufacturers = async (req, res) => {
  try {
    const manufacturers = await DeviceModel.findAll({
      attributes: ['manufacturer'],
      group: ['manufacturer'],
    });

    res.status(200).json({
      success: true,
      manufacturers: manufacturers.map(manufacturer => manufacturer.manufacturer),
    });
  } catch (error) {
    console.error("Error fetching device manufacturers:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Fetch distinct device locations
export const getDeviceLocations = async (req, res) => {
  try {
    const locations = await DeviceModel.findAll({
      attributes: ['location'],
      group: ['location'],
    });

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No locations found",
      });
    }

    // Extracting the locations to a simple array
    const locationList = locations.map(location => location.location);

    res.status(200).json({
      success: true,
      locations: locationList,
    });
  } catch (error) {
    console.error("Error fetching device locations:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Fetch distinct device types
export const getDeviceTypes = async (req, res) => {
  try {
    const types = await DeviceModel.findAll({
      attributes: ['type'],
      group: ['type'],
    });

    console.log(types); // Log the raw result to check what is being returned.


    // Extracting the types to a simple array
    const typeList = types.map(type => type.type);

    console.log('TypesList:', typeList); // Log the raw result to check what is being returned.


    res.status(200).json({
      success: true,
      types: typeList,
    });

  } catch (error) {
    console.error("Error fetching device types:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Count the number of devices for each type and include the location name
export const getDeviceTypeCount = async (req, res) => {
  try {
    console.log('Counting devices by type and location...');

    // Count devices by type and location using .count() and grouping by 'type' and 'location_id'
    const deviceTypeCount = await DeviceModel.count({
      attributes: ['type', 'location'], // Group by 'type' and 'location_id'
      group: ['type', 'location'], // Group by these attributes to get counts per type and location
      include: [
        {
          model: LocationModel,
          as: 'locationData', // Alias for the location relationship
          attributes: ['id','name'], // Include location name in the result
        },
      ],
      raw: true, // Return raw data
    });

    console.log('Device type count:', deviceTypeCount);

    if (!deviceTypeCount || deviceTypeCount.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No device type counts found',
      });
    }

    res.status(200).json({
      success: true,
      devices: deviceTypeCount, // Include device type count with location name
    });

  } catch (error) {
    console.error('Error fetching device type count:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



