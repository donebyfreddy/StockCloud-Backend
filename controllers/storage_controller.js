import StorageModel from "../models/storage_model.js";
import LocationModel from "../models/location_model.js"; // Import location model


// Fetch all storage units with optional search, filtering, and pagination
export const getAllStorages = async (req, res) => {
  try {
    const storages = await StorageModel.findAll({
      include: [
        {
          model: LocationModel,
          as: 'locationData',  // Alias used for the relationship in the model
          attributes: ['name'], // Only fetch the 'name' of the location
        },
      ],
    });

    // Check if there are any storages found
    if (!storages || storages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No storages found",
      });
    }

    // Respond with the storages data
    res.status(200).json({
      success: true,
      storages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getNamesStorages = async (req, res) => {
  try {
    const storages = await StorageModel.find().select('name');
    
    res.json(storages); // Send only the names as a response
  } catch (error) {
    res.status(500).json({ message: "Error fetching storages" });
  }
};



// Fetch a specific storage unit by ID
export const getStorageById = async (req, res) => {
  try {
    const storage = await StorageModel.findByPk(req.params.id);

    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage unit not found",
      });
    }

    res.status(200).json({
      success: true,
      storage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Create a new storage unit
export const createStorage = async (req, res) => {
  try {
    const { name, location, description, status } = req.body;

    // Fetch the location by its name
    const locationDoc = await LocationModel.findOne({ where: { name: location } });

    if (!locationDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid location name provided",
      });
    }

    // Use locationDoc.id directly (no need to access it from req)
    const locationPk = parseInt(locationDoc.id, 10);

    // Create the storage unit with the location's primary key
    const storage = await StorageModel.create({
      name,
      location: locationPk, // Use the primary key from the location
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Storage unit created successfully",
      storage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};




// Update a storage unit by ID
export const updateStorage = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Find the storage unit by primary key
    const storage = await StorageModel.findByPk(id);

    // If the storage unit is not found
    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage unit not found",
      });
    }

    // Update the storage unit
    await storage.update(updatedData);

    res.status(200).json({
      success: true,
      message: "Storage unit updated successfully",
      storage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};


// Delete a storage unit by ID
export const deleteStorage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the storage unit by primary key
    const storage = await StorageModel.findByPk(id);

    // If the storage unit is not found
    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage unit not found",
      });
    }

    // Delete the storage unit
    await storage.destroy();

    res.status(200).json({
      success: true,
      message: "Storage unit deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Fetch the count of storages for each location and include the location name
export const getStorageLocationCount = async (req, res) => {
  try {
    console.log('Counting storages by location...');

    // Assuming you have a LocationModel to map location_id to name
    const storageLocationCount = await StorageModel.count({
      attributes: ['location'],
      group: ['location'],
    });

    // Now you need to map location IDs to location names
    const locations = await LocationModel.findAll({
      attributes: ['id', 'name'],
    });

    // Map location ID to name in the storageLocationCount array
    const storageWithNames = storageLocationCount.map(item => {
      const location = locations.find(loc => loc.id === item.location);  // Match the location by ID
      return {
        ...item,
        locationName: location ? location.name : 'Unknown',  // Assign name or 'Unknown' if not found
      };
    });

    console.log('Storage location count:', storageWithNames);

    if (!storageWithNames || storageWithNames.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No storage location counts found',
      });
    }

    res.status(200).json({
      success: true,
      storages: storageWithNames, // Return data with location names
    });
    
  } catch (error) {
    console.error('Error fetching storage location count:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};




