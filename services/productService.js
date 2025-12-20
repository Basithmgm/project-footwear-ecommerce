const Product = require('../models/Product');

class ProductService {
  static async getAllProducts() {
    return await Product.find({ isActive: true });
  }
  
  static async createProduct(data) {
    return await Product.create(data);
  }
  
  static async updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = ProductService;