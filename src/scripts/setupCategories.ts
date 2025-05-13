import mongoose from 'mongoose';
import { Category } from '../db/models/category';
// import { Product } from '../db/models/product';
import Product from '../db/models/product';
import dotenv from 'dotenv';
//import { setupInitialData } from "../scripts/setupCategories";
dotenv.config();

export async function setupInitialData() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('📦 Connected to MongoDB');

    // 2. Clear existing data (optional)
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Cleared existing categories and products');

    // 3. Create main categories
    const mainCategories = await Category.insertMany([
      { name: 'Electronics', isMainCategory: true },
      { name: 'Fashion', isMainCategory: true },
      { name: 'Furniture', isMainCategory: true },
      { name: 'Property', isMainCategory: true }
    ]);
    console.log('🏷️  Created main categories');

    // 4. Create subcategories
    const electronicsSubs = [
      'Computers & Laptops', 'Monitors', 'Computer Accessories',
      'TV & Home Theater', 'Audio Equipment', 'Headphones',
      'Cameras', 'Networking', 'Printers & Scanners'
    ].map(name => ({
      name,
      parent: mainCategories[0]._id
    }));

    const fashionSubs = [
      'Bags', 'Clothing', 'Jewelry', 'Shoes', 'Watches'
    ].map(name => ({
      name,
      parent: mainCategories[1]._id
    }));

    await Category.insertMany([...electronicsSubs, ...fashionSubs]);
    console.log('📌 Created subcategories');

    // 5. Create sample products (optional)
    const electronicsCategory = await Category.findOne({ name: 'Computers & Laptops' });
    const fashionCategory = await Category.findOne({ name: 'Shoes' });

    if (electronicsCategory && fashionCategory) {
      await Product.insertMany([
        {
          name: 'MacBook Pro 16"',
          description: 'Apple M1 Pro chip, 16GB RAM, 1TB SSD',
          price: 2499.99,
          categories: [electronicsCategory._id],
          stock: 50,
          images: [{ url: '/images/macbook-pro.jpg', isPrimary: true }]
        },
        {
          name: 'Running Shoes',
          description: 'Premium running shoes with cushion technology',
          price: 129.99,
          categories: [fashionCategory._id],
          stock: 100,
          images: [{ url: '/images/running-shoes.jpg', isPrimary: true }]
        }
      ]);
      console.log('🛍️  Created sample products');
    }

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during database setup:', error);
  } finally {
    await mongoose.disconnect();
    // Do not call process.exit here; let the caller handle it if needed
  }
}