const Category = require('../models/Category');
const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');
const { paginate, sort } = require('../middleware/validate');
const fileUpload = require('../utils/fileUpload');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const query = Category.find();

    // Apply search if provided
    if (req.query.search) {
      query.or([
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]);
    }

    // Apply parent category filter
    if (req.query.parent) {
      query.where('parentCategory', req.query.parent);
    }

    // Apply status filter
    if (req.query.status) {
      query.where('status', req.query.status);
    }

    // Apply featured filter
    if (req.query.featured) {
      query.where('featured', req.query.featured === 'true');
    }

    // Apply sorting
    if (req.query.sort) {
      sort(query, req.query.sort);
    } else {
      query.sort('name');
    }

    // Apply pagination
    const { query: paginatedQuery, skip, limit } = paginate(query, {
      page: parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10)
    });

    // Execute query
    const [categories, total] = await Promise.all([
      paginatedQuery.populate('parentCategory', 'name'),
      Category.countDocuments(query.getQuery())
    ]);

    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total
      },
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name');

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    // Handle file upload
    if (req.files && req.files.image) {
      const uploadedFile = await fileUpload.upload.single('image')(req.files.image);
      req.body.image = fileUpload.getFileUrl(uploadedFile.filename);
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // Handle file upload
    if (req.files && req.files.image) {
      // Delete old image
      await fileUpload.deleteFile(category.image);

      // Upload new image
      const uploadedFile = await fileUpload.upload.single('image')(req.files.image);
      req.body.image = fileUpload.getFileUrl(uploadedFile.filename);
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // Check if category has products
    const products = await Product.countDocuments({ category: req.params.id });
    if (products > 0) {
      return next(
        new ErrorResponse(
          'Cannot delete category because it has associated products',
          400
        )
      );
    }

    // Check if category has subcategories
    const subcategories = await Category.countDocuments({
      parentCategory: req.params.id
    });
    if (subcategories > 0) {
      return next(
        new ErrorResponse(
          'Cannot delete category because it has subcategories',
          400
        )
      );
    }

    // Delete category image
    await fileUpload.deleteFile(category.image);

    await category.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree
// @route   GET /api/v1/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .sort('name');

    // Build category tree
    const categoryTree = categories
      .filter((category) => !category.parentCategory)
      .map((category) => ({
        ...category.toObject(),
        children: buildCategoryTree(categories, category._id)
      }));

    res.status(200).json({
      success: true,
      data: categoryTree
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to build category tree
const buildCategoryTree = (categories, parentId) => {
  return categories
    .filter((category) => category.parentCategory?._id.toString() === parentId.toString())
    .map((category) => ({
      ...category.toObject(),
      children: buildCategoryTree(categories, category._id)
    }));
}; 