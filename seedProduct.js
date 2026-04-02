require('dotenv').config();
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
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1628329567705-f8f7150c3cff?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Smart Fitness Tracker',
    short_description: 'Track your health and activity',
    long_description: 'Monitor your heart rate, steps, sleep, and more with this smart fitness tracker. Waterproof and compatible with iOS and Android.',
    price: 39.99,
    category: 'Electronics',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1767903622384-cfd81e2be7ba?q=80&w=1576&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Eco-Friendly Water Bottle',
    short_description: 'Reusable stainless steel bottle',
    long_description: 'Keep your drinks cold for 24 hours or hot for 12 hours. Made from BPA-free stainless steel and available in multiple colors.',
    price: 19.99,
    category: 'Electronics',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Portable Phone Charger',
    short_description: '10000mAh power bank',
    long_description: 'Charge your devices on the go with this compact 10000mAh portable charger. Dual USB output and fast charging supported.',
    price: 25.99,
    category: 'Electronics',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1594843665794-446ce915d840?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Yoga Mat',
    short_description: 'Non-slip exercise mat',
    long_description: 'Perfect for yoga, pilates, and stretching. Non-slip surface, lightweight, and easy to carry.',
    price: 29.99,
    category: 'Sports',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1624651208388-f8726eace8f2?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'LED Desk Lamp',
    short_description: 'Adjustable brightness desk lamp',
    long_description: 'Modern LED desk lamp with touch controls, adjustable brightness, and USB charging port. Ideal for home or office.',
    price: 34.99,
    category: 'Electronics',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1571406487954-dc11b0c0767d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Stainless Steel Cookware Set',
    short_description: '10-piece kitchen cookware set',
    long_description: 'Premium 10-piece stainless steel cookware set. Includes pots, pans, and lids. Dishwasher safe and oven safe.',
    price: 129.99,
    category: 'Electronics',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1604414499020-f9ac575bc5ec?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Noise Cancelling Earbuds',
    short_description: 'Wireless in-ear earbuds',
    long_description: 'Enjoy music and calls with these wireless noise-cancelling earbuds. Up to 8 hours of playtime and sweat-resistant.',
    price: 59.99,
    category: 'Electronics',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Classic Leather Wallet',
    short_description: 'Genuine leather men’s wallet',
    long_description: 'Slim and stylish genuine leather wallet with RFID blocking. Multiple card slots and a coin pocket.',
    price: 24.99,
    category: 'Clothing',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1612023395494-1c4050b68647?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Ceramic Coffee Mug Set',
    short_description: 'Set of 4 ceramic mugs',
    long_description: 'Enjoy your favorite beverages with this set of 4 ceramic coffee mugs. Microwave and dishwasher safe.',
    price: 22.99,
    category: 'Electronics',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1669329597053-993120e439ed?q=80&w=1769&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  // 10 more products
  {
    name: 'Digital Alarm Clock',
    short_description: 'LED display alarm clock',
    long_description: 'Wake up on time with this digital alarm clock featuring a large LED display, snooze function, and USB charging port.',
    price: 18.99,
      category: 'Electronics',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1639224130396-74c8376ea825?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Running Shoes',
    short_description: 'Lightweight running shoes',
    long_description: 'Breathable and lightweight running shoes designed for comfort and performance. Suitable for all terrains.',
    price: 59.99,
    category: 'Sports',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1611080027147-a1a0b6e05168?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Bluetooth Speaker',
    short_description: 'Portable wireless speaker',
    long_description: 'Enjoy your music anywhere with this portable Bluetooth speaker. Waterproof and up to 12 hours of playtime.',
    price: 44.99,
    category: 'Electronics',
    stock: 95,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Cotton T-Shirt',
    short_description: '100% cotton unisex t-shirt',
    long_description: 'Soft and comfortable 100% cotton t-shirt. Available in multiple colors and sizes.',
    price: 14.99,
    category: 'Clothing',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1759572095317-3a96f9a98e2b?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Wireless Mouse',
    short_description: 'Ergonomic wireless mouse',
    long_description: 'Ergonomic design wireless mouse with adjustable DPI and long battery life. Compatible with Windows and Mac.',
    price: 21.99,
    category: 'Electronics',
    stock: 130,
    imageUrl: 'https://images.unsplash.com/photo-1722682810969-06dfc9c9d517?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Backpack',
    short_description: 'Water-resistant travel backpack',
    long_description: 'Spacious and water-resistant backpack with multiple compartments. Perfect for travel, school, or work.',
    price: 49.99,
    category: 'Clothing',
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Electric Kettle',
    short_description: '1.7L stainless steel kettle',
    long_description: 'Boil water quickly with this 1.7L electric kettle. Features auto shut-off and boil-dry protection.',
    price: 27.99,
    category: 'Electronics',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1738520420652-0c47cea3922b?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Adjustable Dumbbells',
    short_description: 'Pair of adjustable dumbbells',
    long_description: 'Save space and customize your workout with these adjustable dumbbells. Weight range: 5-52 lbs.',
    price: 159.99,
    category: 'Sports',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1725289767188-70ad80824048?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Wireless Keyboard',
    short_description: 'Slim wireless keyboard',
    long_description: 'Ultra-slim wireless keyboard with quiet keys and long battery life. Compatible with multiple devices.',
    price: 29.99,
    category: 'Electronics',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1662830857519-2f9b28e3b4ac?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Scented Candle Set',
    short_description: 'Set of 3 scented candles',
    long_description: 'Relax with this set of 3 scented candles. Made from natural soy wax and essential oils.',
    price: 17.99,
      category: 'Electronics',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1625791707104-bc1f50ef22c9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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
