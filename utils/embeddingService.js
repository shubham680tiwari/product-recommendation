const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-embedding-2-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:embedContent?key=${API_KEY}`;

// Generate embedding
const generateEmbedding = async (text) => {
    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: {
                parts: [{ text: text }]
                },
                output_dimensionality: 768
            })
        });
        
        const data = await response.json();
        console.log('Data', data);

        if (!response.ok) {
            throw new Error(data.error?.message || 'API Error');
        }

        response.json({
            embedding: data.embedding.values
        });

    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const generateProductEmbedding = async (product) => {
    const text = `${product.name}, ${product.short_description}, ${product.category}`;
    return await generateEmbedding(text);
};

module.exports ={
    generateEmbedding,
    generateProductEmbedding
};