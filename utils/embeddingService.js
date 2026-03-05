const axios = require('axios');

// Generate embedding

const generateEmbedding = async (text) => {
    try {
        // validate the input
        if (!text || typeof text !== 'string') {
            throw new Error('Text should be non empty string');
        }

        // Call OpenAI embedding API
        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                model: 'text-embedding-3-large',
                input: text,
                encoding_format: "float",
            },
            {
                headers: {
                    'Content-Type': 'aaplication/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        )

        const embedding = response.data.data[0].embedding;

        return embedding;


    } catch (error) {
        throw new Error('Failed to generate embedding')
    }
}