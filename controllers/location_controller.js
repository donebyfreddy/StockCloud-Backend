import LocationModel from "../models/location_model.js"; // Sequelize model
import UserModel from "../models/user_model.js"; // Assuming UserModel model is imported

export const getAllLocations = async (req, res) => {
  try {
    const locations = await LocationModel.findAll({
      include: [
        {
          model: UserModel,
          as: 'creator',
          attributes: ['id', 'name', 'email'],  // Add 'email' here
        },
        {
          model: UserModel,
          as: 'editor',
          attributes: ['id', 'name', 'email'],  // Add 'email' here
        },
      ],
    });
    return res.status(200).json(locations || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getLocationById = async (req, res) => {
  try {
    const location = await LocationModel.findByPk(req.params.id, {
      include: [
        { model: UserModel, as: "creator" },
        { model: UserModel, as: "editor" },
      ],
    });
    return res.status(200).json(location || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { name, description } = req.body;
    const editedBy = req.user.id;
    await LocationModel.update(
      { name, description, editedBy },
      { where: { id: req.params.id } }
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = parseInt(req.user.id, 10); // Ensure `createdBy` is an integer

    const location = await LocationModel.create({
      name,
      description,
      createdBy,
    });


    return res.status(200).json({ message: "Success", location });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
