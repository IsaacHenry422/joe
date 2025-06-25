// import mongoose from 'mongoose';
// import { Category } from '../db/models/category';
// // import { Product } from '../db/models/product';
// import Product from '../db/models/product';
// import dotenv from 'dotenv';
// //import { setupInitialData } from "../scripts/setupCategories";
// dotenv.config();

// export async function setupInitialData() {
//   try {
//     // 1. Connect to MongoDB
//     await mongoose.connect(process.env.MONGODB_URI!);
//     console.log('📦 Connected to MongoDB');

//     // 2. Clear existing data (optional)
//     await Category.deleteMany({});
//     await Product.deleteMany({});
//     console.log('🧹 Cleared existing categories and products');

//     // 3. Create main categories
//     const mainCategories = await Category.insertMany([
//       { name: 'Electronics', isMainCategory: true },
//       { name: 'Fashion', isMainCategory: true },
//       { name: 'Furniture', isMainCategory: true },
//       { name: 'Property', isMainCategory: true }
//     ]);
//     console.log('🏷️  Created main categories');

//     // 4. Create subcategories
//     const electronicsSubs = [
//       'Computers & Laptops', 'Monitors', 'Computer Accessories',
//       'TV & Home Theater', 'Audio Equipment', 'Headphones',
//       'Cameras', 'Networking', 'Printers & Scanners'
//     ].map(name => ({
//       name,
//       parent: mainCategories[0]._id
//     }));

//     const fashionSubs = [
//       'Bags', 'Clothing', 'Jewelry', 'Shoes', 'Watches'
//     ].map(name => ({
//       name,
//       parent: mainCategories[1]._id
//     }));

//     await Category.insertMany([...electronicsSubs, ...fashionSubs]);
//     console.log('📌 Created subcategories');

//     // 5. Create sample products (optional)
//     const electronicsCategory = await Category.findOne({ name: 'Computers & Laptops' });
//     const fashionCategory = await Category.findOne({ name: 'Shoes' });

//     if (electronicsCategory && fashionCategory) {
//       await Product.insertMany([
//         {
//           name: 'MacBook Pro 16"',
//           description: 'Apple M1 Pro chip, 16GB RAM, 1TB SSD',
//           price: 2499.99,
//           categories: [electronicsCategory._id],
//           stock: 50,
//           images: [{ url: '/images/macbook-pro.jpg', isPrimary: true }]
//         },
//         {
//           name: 'Running Shoes',
//           description: 'Premium running shoes with cushion technology',
//           price: 129.99,
//           categories: [fashionCategory._id],
//           stock: 100,
//           images: [{ url: '/images/running-shoes.jpg', isPrimary: true }]
//         }
//       ]);
//       console.log('🛍️  Created sample products');
//     }

//     console.log('✅ Database setup completed successfully!');
//   } catch (error) {
//     console.error('❌ Error during database setup:', error);
//   } finally {
//     await mongoose.disconnect();
//     // Do not call process.exit here; let the caller handle it if needed
//   }
// }
// setupInitialData();
 

import mongoose from 'mongoose';
import { Category } from '../db/models/category';
import Product from '../db/models/product';
import dotenv from 'dotenv';
dotenv.config();

// Utility to create a slug from a name
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[\s&]+/g, '-')
    .replace(/[^\w-]+/g, '');
}

async function upsertCategory({ name, parent = null, isMainCategory = false }: { name: string, parent?: any, isMainCategory?: boolean }) {
  const slug = slugify(name);
  return Category.findOneAndUpdate(
    { slug },
    { $setOnInsert: { name, parent, isMainCategory, slug } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function setupInitialData() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('📦 Connected to MongoDB');

    // 2. Create main categories (idempotent)
    const mainCategoryNames = ['Electronics', 'Fashion', 'Furniture', 'Property'];
    const mainCategories = await Promise.all(
      mainCategoryNames.map(name =>
        upsertCategory({ name, isMainCategory: true })
      )
    );
    console.log('🏷️  Main categories ensured');

    // 3. Create subcategories (idempotent)
    const subcategories = [
      { name: 'Computers & Laptops', parent: mainCategories[0]._id },
      { name: 'Monitors', parent: mainCategories[0]._id },
      { name: 'Computer Accessories', parent: mainCategories[0]._id },
      { name: 'TV & Home Theater', parent: mainCategories[0]._id },
      { name: 'Audio Equipment', parent: mainCategories[0]._id },
      { name: 'Headphones', parent: mainCategories[0]._id },
      { name: 'Cameras', parent: mainCategories[0]._id },
      { name: 'Networking', parent: mainCategories[0]._id },
      { name: 'Printers & Scanners', parent: mainCategories[0]._id },
      { name: 'Bags', parent: mainCategories[1]._id },
      { name: 'Clothing', parent: mainCategories[1]._id },
      { name: 'Jewelry', parent: mainCategories[1]._id },
      { name: 'Shoes', parent: mainCategories[1]._id },
      { name: 'Watches', parent: mainCategories[1]._id }
    ];
    await Promise.all(subcategories.map(sub => upsertCategory(sub)));
    console.log('📌 Subcategories ensured');

    // 4. Create sample products (optional, idempotent by name)
    const electronicsCategory = await Category.findOne({ slug: slugify('Computers & Laptops') });
    const fashionCategory = await Category.findOne({ slug: slugify('Shoes') });

    if (electronicsCategory && fashionCategory) {
      await Product.updateOne(
        { name: 'MacBook Pro 16"' },
        {
          $setOnInsert: {
            name: 'MacBook Pro 16"',
            description: 'Apple M1 Pro chip, 16GB RAM, 1TB SSD',
            price: 2499.99,
            categories: [electronicsCategory._id],
            stock: 50,
            images: [{ url: '/images/macbook-pro.jpg', isPrimary: true }]
          }
        },
        { upsert: true }
      );
      await Product.updateOne(
        { name: 'Running Shoes' },
        {
          $setOnInsert: {
            name: 'Running Shoes',
            description: 'Premium running shoes with cushion technology',
            price: 129.99,
            categories: [fashionCategory._id],
            stock: 100,
            images: [{ url: '/images/running-shoes.jpg', isPrimary: true }]
          }
        },
        { upsert: true }
      );
      console.log('🛍️  Sample products ensured');
    }

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during database setup:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupInitialData();