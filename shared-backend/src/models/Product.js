const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'Out of Stock'
  },
  features: [{
    type: String
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update status based on stock
productSchema.pre('save', function(next) {
  this.status = this.stock > 0 ? 'In Stock' : 'Out of Stock';
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }
  
  const totalRating = this.ratings.reduce((sum, item) => sum + item.rating, 0);
  this.averageRating = totalRating / this.ratings.length;
  this.totalReviews = this.ratings.length;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 