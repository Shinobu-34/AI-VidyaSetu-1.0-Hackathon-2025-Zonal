import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model = null;
let isLoading = false;

// Map MobileNet classes to our clothing types
// These are some common ImageNet classes related to clothing
const CLOTHING_MAP = {
    'jersey': ['Shirt', 'T-Shirt', 'Jersey'],
    't-shirt': ['Shirt', 'T-Shirt'],
    'sweatshirt': ['Sweater', 'Hoodie', 'Jacket'],
    'cardigan': ['Sweater', 'Cardigan'],
    'jean': ['Pants', 'Jeans'],
    'jeans': ['Pants', 'Jeans'],
    'miniskirt': ['Skirt'],
    'overskirt': ['Skirt'],
    'trench coat': ['Jacket', 'Coat'],
    'suit': ['Jacket', 'Suit'],
    'bikini': ['Swimwear'],
    'maillot': ['Swimwear'],
    'swimming trunks': ['Swimwear', 'Shorts'],
    'bow tie': ['Accessories'],
    'tie': ['Accessories'],
    'shoe': ['Shoes'],
    'running shoe': ['Shoes'],
    'sandal': ['Shoes'],
    'boot': ['Shoes'],
    'cowboy boot': ['Shoes'],
    'sock': ['Accessories'],
    'gown': ['Dress'],
    'velvet': ['Dress', 'Shirt'],
    'wool': ['Sweater'],
    'cloak': ['Coat']
};

const DANGEROUS_ITEMS = [
    'revolver', 'assault rifle', 'rifle', 'shotgun', 'bow', 'sword', 'knife', 'cleaver', 'hatchet', 'gun', 'pistol'
];

export async function loadModel() {
    if (model) return model;
    if (isLoading) {
        // Simple polling if already loading
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (model) {
                    clearInterval(check);
                    resolve(model);
                }
            }, 100);
        });
    }

    try {
        isLoading = true;
        console.log('Loading MobileNet model...');
        model = await mobilenet.load({ version: 2, alpha: 1.0 }); // Using a slightly larger model for better accuracy
        console.log('MobileNet model loaded.');
        isLoading = false;
        return model;
    } catch (error) {
        console.error('Failed to load MobileNet:', error);
        isLoading = false;
        throw error;
    }
}

export async function classifyImage(imageElement) {
    try {
        const net = await loadModel();

        // Make predictions
        const predictions = await net.classify(imageElement);
        console.log('TF.js Predictions:', predictions);

        if (!predictions || predictions.length === 0) {
            return { isClothing: false, detectedType: 'unknown', confidence: 0 };
        }

        const topPrediction = predictions[0]; // { className: 'jersey, T-shirt, tee shirt', probability: 0.88 }
        const detectedClass = topPrediction.className.toLowerCase();

        // 1. Check for dangerous items
        if (DANGEROUS_ITEMS.some(item => detectedClass.includes(item))) {
            return {
                isClothing: false,
                detectedType: 'WEAPON/DANGEROUS',
                confidence: topPrediction.probability,
                rawClass: detectedClass
            };
        }

        // 2. Map to our clothing types
        let matchedType = 'Unknown Object';
        let isClothing = false;

        // Check if any keyword in the map matches the detected class
        for (const [key, values] of Object.entries(CLOTHING_MAP)) {
            if (detectedClass.includes(key)) {
                matchedType = values[0]; // Pick the primary mapping
                isClothing = true;
                break;
            }
        }

        // Fallback: If not explicitly mapped but might be clothing (simple heuristic)
        if (!isClothing && (
            detectedClass.includes('cloth') ||
            detectedClass.includes('wear') ||
            detectedClass.includes('vest') ||
            detectedClass.includes('coat') ||
            detectedClass.includes('cap')
        )) {
            isClothing = true;
            matchedType = 'Other Clothing';
        }

        return {
            isClothing,
            detectedType: matchedType,
            confidence: topPrediction.probability,
            rawClass: detectedClass
        };

    } catch (error) {
        console.error('Classification error:', error);
        return { isClothing: false, detectedType: 'error', confidence: 0 };
    }
}
