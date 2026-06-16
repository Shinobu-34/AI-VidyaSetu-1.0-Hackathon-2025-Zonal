import { HfInference } from '@huggingface/inference';

const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

// Initialize Client only if key exists
const hf = API_KEY ? new HfInference(API_KEY) : null;

// Candidate labels for Zero-Shot Classification
// These are the "concepts" we want the AI to look for.
// We include specific clothing types and dangerous items.
const CANDIDATE_LABELS = [
    'shirt', 't-shirt', 'pants', 'jeans', 'dress', 'shoe', 'sneaker', 'jacket', 'coat', 'sweater', 'skirt', 'shorts', 'hat', 'bag',
    'gun', 'weapon', 'knife', 'sword', 'rifle'
];

export async function classifyWithHuggingFace(imageBase64) {
    if (!hf) {
        console.warn('Hugging Face API Key missing.');
        return null;
    }

    try {
        // Convert Base64 to Blob for the API
        const base64Response = await fetch(imageBase64);
        const blob = await base64Response.blob();

        console.log('Calling Hugging Face Zero-Shot Classification...');

        // Use a fast, accurate Zero-Shot Image Classification model
        // openai/clip-vit-base-patch32 is the industry standard for this.
        const result = await hf.zeroShotImageClassification({
            model: 'openai/clip-vit-base-patch32',
            data: blob,
            parameters: {
                candidate_labels: CANDIDATE_LABELS
            }
        });

        console.log('HF Prediction:', result);

        if (!result || result.length === 0) return null;

        // Result is array of { label: string, score: number } sorted by score
        const topPrediction = result[0];

        let isClothing = true;
        let detectedType = topPrediction.label;
        const score = topPrediction.score;

        // Check for weapons
        if (['gun', 'weapon', 'knife', 'sword', 'rifle'].includes(detectedType)) {
            isClothing = false;
            detectedType = 'DANGEROUS ITEM';
        }

        // Map broad terms
        if (detectedType === 'sneaker') detectedType = 'Shoes';
        if (detectedType === 'shoe') detectedType = 'Shoes';

        // Capitalize
        detectedType = detectedType.charAt(0).toUpperCase() + detectedType.slice(1);

        return {
            isClothing,
            detectedType,
            confidence: score,
            rawClass: topPrediction.label
        };

    } catch (error) {
        console.error('Hugging Face API Error:', error);
        return null; // Return null to trigger fallback to TF.js
    }
}
