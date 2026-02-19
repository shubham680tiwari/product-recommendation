require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db')

const productRoutes = require('./routes/productRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);


// Test route
app.get('/', (req, res) => {
    res.json({message: 'Welcome to E-commerce recommendation system'});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT} successfully`);
});
