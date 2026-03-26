const mongoose = require('mongoose');
const Product = require('./models/Product');
const db = require('./config/db');

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    short_description: 'Comfortable over-ear wireless headphones',
    long_description: 'Experience high-fidelity sound with these wireless Bluetooth headphones. Features noise cancellation, 30-hour battery life, and a comfortable fit for all-day use.',
    price: 89.99,
    category: 'Electronics',
    stock: 50
  },
  {
    name: 'Smart Fitness Tracker',
    short_description: 'Track your health and activity',
    long_description: 'Monitor your heart rate, steps, sleep, and more with this smart fitness tracker. Waterproof and compatible with iOS and Android.',
    price: 39.99,
    category: 'Wearables',
    stock: 100
  },
  {
    name: 'Eco-Friendly Water Bottle',
    short_description: 'Reusable stainless steel bottle',
    long_description: 'Keep your drinks cold for 24 hours or hot for 12 hours. Made from BPA-free stainless steel and available in multiple colors.',
    price: 19.99,
    category: 'Home & Kitchen',
    stock: 200
  },
  {
    name: 'Portable Phone Charger',
    short_description: '10000mAh power bank',
    long_description: 'Charge your devices on the go with this compact 10000mAh portable charger. Dual USB output and fast charging supported.',
    price: 25.99,
    category: 'Electronics',
    stock: 75
  },
  {
    name: 'Yoga Mat',
    short_description: 'Non-slip exercise mat',
    long_description: 'Perfect for yoga, pilates, and stretching. Non-slip surface, lightweight, and easy to carry.',
    price: 29.99,
    category: 'Sports & Outdoors',
    stock: 120
  },
  {
    name: 'LED Desk Lamp',
    short_description: 'Adjustable brightness desk lamp',
    long_description: 'Modern LED desk lamp with touch controls, adjustable brightness, and USB charging port. Ideal for home or office.',
    price: 34.99,
    category: 'Home & Kitchen',
    stock: 60
  },
  {
    name: 'Stainless Steel Cookware Set',
    short_description: '10-piece kitchen cookware set',
    long_description: 'Premium 10-piece stainless steel cookware set. Includes pots, pans, and lids. Dishwasher safe and oven safe.',
    price: 129.99,
    category: 'Home & Kitchen',
    stock: 30
  },
  {
    name: 'Noise Cancelling Earbuds',
    short_description: 'Wireless in-ear earbuds',
    long_description: 'Enjoy music and calls with these wireless noise-cancelling earbuds. Up to 8 hours of playtime and sweat-resistant.',
    price: 59.99,
    category: 'Electronics',
    stock: 90
  },
  {
    name: 'Classic Leather Wallet',
    short_description: 'Genuine leather men’s wallet',
    long_description: 'Slim and stylish genuine leather wallet with RFID blocking. Multiple card slots and a coin pocket.',
    price: 24.99,
    category: 'Fashion',
    stock: 150
  },
  {
    name: 'Ceramic Coffee Mug Set',
    short_description: 'Set of 4 ceramic mugs',
    long_description: 'Enjoy your favorite beverages with this set of 4 ceramic coffee mugs. Microwave and dishwasher safe.',
    price: 22.99,
    category: 'Home & Kitchen',
    stock: 80
  }
];

async function seedProducts() {
  try {
    await db();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
