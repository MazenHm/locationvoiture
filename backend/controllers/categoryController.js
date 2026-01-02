const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: "Catégorie introuvable" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!category) return res.status(404).json({ msg: "Catégorie introuvable" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ msg: "Catégorie introuvable" });
    res.json({ msg: "Catégorie supprimée" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
