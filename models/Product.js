const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            maxlength: [200, 'Product name cannot exceed 200 characters']
        },

        short_description: {
            type: String,
            required: [true, 'Short description is required'],
            maxlength: [500, 'Short description cannot exceed 500 characters']
        },

        long_description: {
            type: String,
            required: [true, 'Long description is required']
        },

        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },

        stock: {
            type: Number,
            min: [0, 'Product out of stock']
        },

        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: ['Electronics', 'Clothing', 'Book', 'Sports'],
                message: '{VALUE} is not a valid cateogry'
            }
        },

        qdrantId: {
            type: String,
            default: null
        }, 

        

    },
    {
        timestamps: true
    }
);

productSchema.index({name: 'text', short_description: 'text'});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;