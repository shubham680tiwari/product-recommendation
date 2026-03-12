require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db')

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const { initializeQdrant } = require('./config/qdrant');

const app = express();

// Connect to MongoDB
connectDB();

// Intialize Qdrant DB
initializeQdrant()

// Middleware
app.use(cors());
app.use(express.json());

app.post('/test-embedding', async (req, res) => {
  const {generateEmbedding} = require('./utils/embeddingService');

  try {
    const embedding = await generateEmbedding('iphone 17 pro');
    res.json({
      success: true,
      dimension: embedding.length,
      sampleData: embedding.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes)


// Test route
app.get('/', (req, res) => {
    res.json({message: 'Welcome to E-commerce recommendation system'});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT} successfully`);
});
