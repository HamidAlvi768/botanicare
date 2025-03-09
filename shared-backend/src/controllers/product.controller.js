const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');
const { paginate, sort } = require('../middleware/validate');
const fileUpload = require('../utils/fileUpload');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const query = Product.find();

    // Apply search if provided
    if (req.query.search) {
      query.or([
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]);
    }

    // Apply category filter
    if (req.query.category) {
      query.where('category', req.query.category);
    }

    // Apply status filter
    if (req.query.status) {
      query.where('status', req.query.status);
    }

    // Apply price range filter
    if (req.query.minPrice) {
      query.where('price').gte(parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query.where('price').lte(parseFloat(req.query.maxPrice));
    }

    // Apply sorting
    if (req.query.sort) {
      sort(query, req.query.sort);
    } else {
      query.sort('-createdAt');
    }

    // Apply pagination
    const { query: paginatedQuery, skip, limit } = paginate(query, {
      page: parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10)
    });

    // Execute query
    const [products, total] = await Promise.all([
      paginatedQuery.populate('category', 'name'),
      Product.countDocuments(query.getQuery())
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('ratings.user', 'firstName lastName');

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    // Handle file uploads
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const uploadedFile = await fileUpload.upload.single('image')(image);
          return fileUpload.getFileUrl(uploadedFile.filename);
        })
      );

      req.body.images = uploadedImages;
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Handle file uploads
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      // Delete old images
      await Promise.all(
        product.images.map(async (image) => {
          await fileUpload.deleteFile(image);
        })
      );

      // Upload new images
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const uploadedFile = await fileUpload.upload.single('image')(image);
          return fileUpload.getFileUrl(uploadedFile.filename);
        })
      );

      req.body.images = uploadedImages;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Delete product images
    await Promise.all(
      product.images.map(async (image) => {
        await fileUpload.deleteFile(image);
      })
    );

    await product.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product rating
// @route   POST /api/v1/products/:id/ratings
// @access  Private
exports.addProductRating = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Check if user has already rated
    const existingRating = product.ratings.find(
      (rating) => rating.user.toString() === req.user.id
    );

    if (existingRating) {
      return next(new ErrorResponse('You have already rated this product', 400));
    }

    // Add rating
    product.ratings.push({
      user: req.user.id,
      rating: req.body.rating,
      review: req.body.review
    });

    // Calculate average rating
    product.calculateAverageRating();

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product rating
// @route   PUT /api/v1/products/:id/ratings/:ratingId
// @access  Private
exports.updateProductRating = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Find rating
    const rating = product.ratings.id(req.params.ratingId);

    if (!rating) {
      return next(new ErrorResponse('Rating not found', 404));
    }

    // Check if user owns the rating
    if (rating.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this rating', 401));
    }

    // Update rating
    rating.rating = req.body.rating;
    rating.review = req.body.review;

    // Calculate average rating
    product.calculateAverageRating();

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product rating
// @route   DELETE /api/v1/products/:id/ratings/:ratingId
// @access  Private
exports.deleteProductRating = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Find rating
    const rating = product.ratings.id(req.params.ratingId);

    if (!rating) {
      return next(new ErrorResponse('Rating not found', 404));
    }

    // Check if user owns the rating
    if (rating.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this rating', 401));
    }

    // Remove rating
    rating.remove();

    // Calculate average rating
    product.calculateAverageRating();

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
}; 