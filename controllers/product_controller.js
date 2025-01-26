// controllers/productController.js

import HistoryModel from "../models/history_model.js"; 
import ProductModel from "../models/product_model.js"; 
import UserModel from "../models/user_model.js"; 



export const createProduct = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "not authorized" });
  }
  try {
    const {
      locationId,
      status,
      title,
      description,
      serialNo,
      rackMountable,
      isPart,
      manufacturer,
      model,
      warrantyMonths,
      dateOfPurchase,
      user,
    } = req.body;

    const history = await HistoryModel.create({
      locationId: locationId,
      status: JSON.stringify([
        { name: status },
      ]),
    });

    const product = await ProductModel.create({
      title,
      description,
      serialNo,
      dateOfPurchase,
      createdBy: req.user._id,
      rackMountable,
      isPart,
      manufacturer,
      model,
      warrantyMonths,
      user,
      historyId: history.id,  // Storing historyId for the relation
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      itemsperpage = 10,
      search = "",
      manufacturer,
    } = req.query;

    let regex = new RegExp(search, "i");

    const query = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { serialNo: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
      ],
    };

    if (manufacturer) {
      query.manufacturer = manufacturer;
    }

    const skipItems = (page - 1) * itemsperpage;

    const { count, rows: products } = await ProductModel.findAndCountAll({
      where: query,
      limit: itemsperpage,
      offset: skipItems,
      include: [
        {
          model: HistoryModel,
          as: "history",
          include: {
            model: LocationModel,
            as: "location",
          },
        },
        {
          model: ManufacturerModel,
          as: "manufacturer",
        },
      ],
    });

    const pages_count = Math.ceil(count / itemsperpage);

    res.status(200).json({
      data: products,
      pages_count,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findByPk(req.params.id, {
      include: [
        { model: User, as: "createdBy" },
        {
          model: HistoryModel,
          as: "history",
          include: {
            model: LocationModel,
            as: "location",
          },
        },
        { model: ManufacturerModel, as: "manufacturer" },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductHistory = async (req, res) => {
  try {
    const product = await ProductModel.findByPk(req.params.id, {
      include: [
        { model: UserModel, as: "createdBy" },
        {
          model: HistoryModel,
          as: "history",
          include: {
            model: LocationModel,
            as: "location",
          },
        },
        { model: ManufacturerModel, as: "manufacturer" },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const {
      locationId,
      status,
      title,
      description,
      serialNo,
      createdBy,
      rackMountable,
      isPart,
      manufacturer,
      model,
      warrantyMonths,
      user,
    } = req.body;

    if (locationId) {
      const history = await HistoryModel.create({
        locationId: locationId,
        status: JSON.stringify([{ name: status }]),
      });

      await ProductModel.update(
        {
          title,
          description,
          serialNo,
          createdBy,
          rackMountable,
          isPart,
          manufacturer,
          model,
          warrantyMonths,
          user,
        },
        { where: { id: productId } }
      );

      await ProductModel.update(
        { historyId: history.id },
        { where: { id: productId } }
      );
    } else if (status) {
      const productRes = await ProductModel.findByPk(productId);
      if (!productRes) {
        return res.status(404).json({ error: "Product not found" });
      }

      const history = await HistoryModel.findByPk(productRes.historyId);

      const historyUpdated = history;
      historyUpdated.status.push({ name: status });
      await historyUpdated.save();
    } else {
      console.log("Unhandled condition");
    }

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const product = await ProductModel.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
