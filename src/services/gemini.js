import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyImage } from './classification';
import { classifyWithHuggingFace } from './huggingface';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (API_KEY && API_KEY !== 'demo-api-key') {
    genAI = new GoogleGenerativeAI(API_KEY);
}

// Analyze clothing image using Gemini Vision
export async function analyzeClothingImage(imageBase64) {
    // If no API key, try offline analysis first
    if (!genAI) {
        console.log('Gemini Key missing. Falling back to offline analysis...');
        try {
            // Check Hugging Face first (if available for analysis too?)
            // Usually we use the same Classification model, but Analysis needs "Pairings"
            // So we use our generateOfflineAnalysis helper.
            // We can try HF for classification part

            const img = new Image();
            img.src = imageBase64;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // Try HF first for better detection
            let detectedType = null;
            try {
                const hfResult = await classifyWithHuggingFace(imageBase64);
                if (hfResult && hfResult.isClothing) {
                    detectedType = hfResult.detectedType;
                }
            } catch (hfErr) {
                console.warn('HF failed silently inside analyzeClothingImage:', hfErr);
            }

            if (!detectedType) {
                try {
                    const tfResult = await classifyImage(img);
                    detectedType = tfResult.detectedType;
                    if (detectedType === 'error') throw new Error('MobileNet returned error state');
                } catch (tfErr) {
                    throw new Error(`TensorFlow Fallback Failed: ${tfErr.message}`);
                }
            }

            const color = await extractDominantColor(img);

            return generateOfflineAnalysis(detectedType, color);
        } catch (error) {
            console.error('Offline analysis failed:', error);
            // Return an "Error" analysis so the user sees something went wrong, 
            // instead of a random "fake" result.
            return {
                primaryColor: "Unknown",
                secondaryColor: null,
                category: "Analysis Failed",
                type: "Error", // UI will show "Type: Error"
                style: "None",
                season: "None",
                description: `Could not analyze image. Reason: ${error.message || 'Unknown Error'}. Please check your connection or Refresh.`,
                suggestedPairings: [],
                colorPairings: [],
                occasion: "Error"
            };
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze this clothing image and return a JSON response with the following structure (return ONLY the JSON, no markdown):
{
  "primaryColor": "main color name (e.g., navy blue, burgundy, charcoal)",
  "secondaryColor": "accent color if any, or null",
  "category": "formal/casual/athletic/loungewear/business-casual",
  "type": "shirt/pants/dress/jacket/sweater/t-shirt/jeans/skirt/shorts/coat/other",
  "style": "modern/classic/vintage/sporty/minimalist/bohemian/preppy",
  "season": "spring/summer/fall/winter/all-season",
  "suggestedPairings": ["array", "of", "complementary", "item", "types"],
  "colorPairings": ["array", "of", "colors", "that", "would", "match"],
  "occasion": "casual outing/work/formal event/workout/date night/everyday",
  "description": "brief description of the garment"
}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return getDemoAnalysis();
    } catch (error) {
        console.error('Gemini API error:', error);
        return getDemoAnalysis();
    }
}

// Validate if the image matches the selected type
export async function validateClothingItem(imageBase64, selectedType) {
    if (!genAI) {
        console.log('Gemini Key missing. Trying Alternative AI services...');

        // 1. Try Hugging Face
        const hfResult = await classifyWithHuggingFace(imageBase64);

        if (hfResult) {
            console.log('Using Hugging Face Result');
            const isMatch = hfResult.detectedType.toLowerCase() === selectedType.toLowerCase() ||
                (hfResult.detectedType === 'Shoes' && ['Boots', 'Sandals', 'Sneakers'].includes(selectedType)) ||
                (hfResult.detectedType === 'DANGEROUS ITEM'); // Always catch this

            return {
                isValid: isMatch || (hfResult.detectedType.toLowerCase().includes(selectedType.toLowerCase())),
                isClothing: hfResult.isClothing,
                detectedType: hfResult.detectedType,
                confidence: hfResult.confidence > 0.4 ? 'high' : 'medium',
                reason: hfResult.isClothing
                    ? `AI identified: ${hfResult.rawClass} (${hfResult.detectedType})`
                    : `Flagged as Dangerous/Non-clothing: ${hfResult.rawClass}`,
                isDemo: false,
                isOfflineAI: false // It's cloud, but not Gemini
            };
        }

        console.log('Hugging Face skipped/failed. Falling back to TensorFlow.js...');

        try {
            // 2. Try TensorFlow.js
            const img = new Image();
            img.src = imageBase64;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const result = await classifyImage(img);

            const isMatch = result.detectedType.toLowerCase() === selectedType.toLowerCase() ||
                (result.detectedType === 'Shirt' && ['T-Shirt', 'Sweater'].includes(selectedType)) ||
                (result.detectedType === 'Shoes' && ['Boots', 'Sandals', 'Sneakers'].includes(selectedType));

            return {
                isValid: isMatch || result.detectedType === 'Other Clothing',
                isClothing: result.isClothing,
                detectedType: result.detectedType,
                confidence: result.confidence > 0.6 ? 'high' : 'medium',
                reason: result.isClothing
                    ? `AI identified: ${result.rawClass} (${result.detectedType})`
                    : `Flagged as non-clothing: ${result.rawClass}`,
                isDemo: false,
                isOfflineAI: true
            };

        } catch (err) {
            console.error('TF.js fallback failed:', err);
            return {
                isValid: true,
                isClothing: true,
                detectedType: 'Simulated (Error Fallback)',
                isDemo: true,
                confidence: 'high',
                reason: 'Validation skipped (Local AI failed)'
            };
        }
    }

    try {
        // Real Gemini Validation Logic
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Act as a strict clothing authenticator. 
        1. First, identify the MAIN object in this image. 
        2. Then, compare it to the expected type: "${selectedType}".
        3. Check for any dangerous items (weapons, guns, knives).
        
        Return ONLY a JSON response:
        {
          "isClothing": boolean, // false if weapon, garbage, or non-clothing
          "detectedType": "string", // Specific name of the item found (e.g. 'Sneakers', 'Revolver', 'Denim Shirt')
          "matchesSelectedType": boolean, // strict check. 'Shoes' != 'Shirt'.
          "confidence": "high/medium/low",
          "reason": "Explain the finding. e.g., 'Found a shoe but expected a shirt'."
        }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix if present
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                isValid: data.matchesSelectedType,
                isClothing: data.isClothing,
                detectedType: data.detectedType,
                confidence: data.confidence,
                reason: data.reason,
                isDemo: false
            };
        }

        return { isValid: false, isClothing: false, detectedType: 'unknown', reason: 'Could not verify image', isDemo: false };
    } catch (error) {
        console.error('Gemini verification error:', error);
        return {
            isValid: false,
            isClothing: false,
            detectedType: 'verification_failed',
            reason: 'AI Verification failed (Possible Safety Block)',
            isDemo: false
        };
    }
}


// --- Helper Functions ---

function getDemoAnalysis() {
    const analyses = [
        {
            primaryColor: "Navy Blue",
            secondaryColor: null,
            category: "casual",
            type: "shirt",
            style: "classic",
            season: "all-season",
            suggestedPairings: ["khaki pants", "white sneakers", "brown belt", "casual blazer"],
            colorPairings: ["white", "beige", "light gray", "burgundy"],
            occasion: "casual outing",
            description: "A classic navy blue casual shirt that's versatile and timeless."
        },
        {
            primaryColor: "Black",
            secondaryColor: "White",
            category: "casual",
            type: "t-shirt",
            style: "modern",
            season: "summer",
            suggestedPairings: ["blue jeans", "black joggers", "white sneakers", "denim jacket"],
            colorPairings: ["white", "gray", "red", "blue"],
            occasion: "everyday",
            description: "A modern black and white t-shirt, perfect for everyday wear."
        },
        {
            primaryColor: "Olive Green",
            secondaryColor: null,
            category: "casual",
            type: "jacket",
            style: "modern",
            season: "fall",
            suggestedPairings: ["dark jeans", "brown boots", "cream sweater", "white t-shirt"],
            colorPairings: ["brown", "cream", "navy", "black"],
            occasion: "casual outing",
            description: "A stylish olive green jacket perfect for autumn layering."
        }
    ];
    return analyses[Math.floor(Math.random() * analyses.length)];
}

export function getStyleRecommendations(analysis, availableItems) {
    const recommendations = [];
    availableItems.forEach(item => {
        let matchScore = 0;
        if (analysis.suggestedPairings?.some(p => p.toLowerCase().includes(item.type?.toLowerCase()))) {
            matchScore += 3;
        }
        if (analysis.colorPairings?.some(c => c.toLowerCase().includes(item.color?.toLowerCase()))) {
            matchScore += 2;
        }
        if (item.category === analysis.category) {
            matchScore += 1;
        }
        if (matchScore > 0) {
            recommendations.push({
                ...item,
                matchScore,
                matchReason: getMatchReason(analysis, item)
            });
        }
    });
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    return recommendations.slice(0, 6);
}

function getMatchReason(analysis, item) {
    const reasons = [];
    if (analysis.suggestedPairings?.some(p => p.toLowerCase().includes(item.type?.toLowerCase()))) {
        reasons.push(`Great pairing with your ${analysis.type}`);
    }
    if (analysis.colorPairings?.some(c => c.toLowerCase().includes(item.color?.toLowerCase()))) {
        reasons.push(`${item.color} complements ${analysis.primaryColor}`);
    }
    return reasons.join(' • ') || 'Matches your style';
}

function generateOfflineAnalysis(detectedType, color) {
    const base = {
        primaryColor: color,
        secondaryColor: null,
        category: 'Simulated (Offline)',
        type: detectedType || 'Unknown',
        style: 'Modern',
        season: 'All-Season',
        description: `An offline-analyzed ${color.toLowerCase()} ${detectedType.toLowerCase()}.`,
        suggestedPairings: [],
        colorPairings: []
    };

    const typeLower = detectedType.toLowerCase();
    if (typeLower.includes('shirt') || typeLower.includes('top')) {
        base.suggestedPairings = ['Jeans', 'Chinos', 'Shorts', 'Jacket'];
        base.occasion = 'Casual / Everyday';
    } else if (typeLower.includes('pant') || typeLower.includes('jean')) {
        base.suggestedPairings = ['T-Shirt', 'Button-down', 'Sweater', 'Sneakers'];
        base.occasion = 'Casual / Work';
    } else if (typeLower.includes('shoe')) {
        base.suggestedPairings = ['Jeans', 'Shorts', 'Socks'];
        base.occasion = 'Everyday';
    } else if (typeLower.includes('jacket') || typeLower.includes('coat')) {
        base.suggestedPairings = ['T-Shirt', 'Scarf', 'Jeans'];
        base.occasion = 'Outdoor / Cold';
    } else {
        base.suggestedPairings = ['Accessories', 'Matching Set'];
        base.occasion = 'Casual';
    }

    const colorLower = color.toLowerCase();
    if (colorLower.includes('black') || colorLower.includes('white') || colorLower.includes('gray')) {
        base.colorPairings = ['Red', 'Blue', 'Green', 'Any Color'];
    } else if (colorLower.includes('blue')) {
        base.colorPairings = ['White', 'Gray', 'Tan'];
    } else {
        base.colorPairings = ['Black', 'White', 'Denim'];
    }

    return base;
}

async function extractDominantColor(imgElement) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(imgElement, 0, 0, 100, 100);

        const imageData = ctx.getImageData(25, 25, 50, 50);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        if (r < 60 && g < 60 && b < 60) return 'Black';
        if (r > 200 && g > 200 && b > 200) return 'White';
        if (Math.abs(r - g) < 20 && Math.abs(r - b) < 20) return 'Gray';
        if (r > g && r > b) return 'Red/Brown';
        if (g > r && g > b) return 'Green';
        if (b > r && b > g) return 'Blue';
        if (r > b && g > b) return 'Yellow/Orange';

        return `rgb(${r},${g},${b})`;
    } catch (e) {
        return 'Unknown';
    }
}
