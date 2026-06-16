import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDonations } from '../services/donations';
import { analyzeClothingImage, getStyleRecommendations } from '../services/gemini';
import ClothingCard from '../components/ClothingCard';

export default function StyleSuggestions() {
    const { currentUser } = useAuth();
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target.result;
            setImagePreview(result);
            // Store full Data URL (needed for local Image object loading)
            setImageBase64(result);
        };
        reader.readAsDataURL(file);
    };

    const analyzeImage = async () => {
        if (!imageBase64) return;

        setLoading(true);
        setError('');
        setAnalysis(null);
        setRecommendations([]);

        try {
            // Analyze the image
            const result = await analyzeClothingImage(imageBase64);
            setAnalysis(result);

            // Get available items for matching
            const availableItems = await getDonations();

            // Get style recommendations
            const matches = getStyleRecommendations(result, availableItems);
            setRecommendations(matches);
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        setImagePreview(null);
        setImageBase64(null);
        setAnalysis(null);
        setRecommendations([]);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>AI <span className="gradient-text">Style Suggestions</span></h1>
                    <p>Upload a photo of your clothing and let AI find matching items from our donations</p>
                </div>

                <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
                    {/* Upload Section */}
                    {!imagePreview ? (
                        <div
                            className="image-uploader"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ maxWidth: '500px', margin: '0 auto' }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                                capture="environment"
                            />
                            <div className="image-uploader-icon">🤖</div>
                            <p className="image-uploader-text">
                                Upload or take a photo of your clothing item
                            </p>
                            <p className="image-uploader-hint">
                                Our AI will analyze the color, style, and suggest matching items
                            </p>
                        </div>
                    ) : (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {/* Image Preview */}
                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-6)',
                                marginBottom: 'var(--space-6)',
                                flexWrap: 'wrap',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{ flex: '0 0 auto' }}>
                                    <img
                                        src={imagePreview}
                                        alt="Uploaded clothing"
                                        style={{
                                            width: '200px',
                                            height: '250px',
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                    />
                                </div>

                                {/* Analysis Results */}
                                {analysis && (
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <h3 style={{ marginBottom: 'var(--space-4)' }}>
                                            🔍 Analysis Results
                                        </h3>

                                        {analysis.type === 'Error' ? (
                                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', border: '1px solid #ff4444', background: '#ffebeb', color: '#cc0000' }}>
                                                <strong>Analysis Failed:</strong> {analysis.description}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Type</span>
                                                    <p style={{ fontWeight: 500 }}>{analysis.type}</p>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Primary Color</span>
                                                    <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        <span
                                                            style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                borderRadius: '4px',
                                                                background: analysis.primaryColor?.toLowerCase() || 'gray',
                                                                border: '1px solid var(--glass-border)'
                                                            }}
                                                        />
                                                        {analysis.primaryColor}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Category</span>
                                                    <p style={{ fontWeight: 500 }}>{analysis.category}</p>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Style</span>
                                                    <p style={{ fontWeight: 500 }}>{analysis.style}</p>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Occasion</span>
                                                    <p style={{ fontWeight: 500 }}>{analysis.occasion}</p>
                                                </div>
                                            </div>
                                        )}

                                        {analysis.suggestedPairings && (
                                            <div style={{ marginTop: 'var(--space-4)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Suggested Pairings</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                                                    {analysis.suggestedPairings.map((item, i) => (
                                                        <span key={i} className="badge badge-primary">{item}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {analysis.colorPairings && (
                                            <div style={{ marginTop: 'var(--space-3)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Color Matches</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                                                    {analysis.colorPairings.map((color, i) => (
                                                        <span key={i} className="badge badge-secondary">{color}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                                {!analysis && (
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={analyzeImage}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            '🤖 Analyze & Find Matches'
                                        )}
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline"
                                    onClick={resetAnalysis}
                                >
                                    Try Another Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div>
                        <h2 style={{ marginBottom: 'var(--space-6)' }}>
                            ✨ Matching Items for You
                        </h2>
                        <div className="cards-grid">
                            {recommendations.map(item => (
                                <div key={item.id} style={{ position: 'relative' }}>
                                    <ClothingCard item={item} />
                                    {item.matchReason && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            left: '12px',
                                            right: '12px',
                                            background: 'var(--gradient-primary)',
                                            padding: 'var(--space-2) var(--space-3)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            color: 'white'
                                        }}>
                                            {item.matchReason}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State for No Matches */}
                {analysis && recommendations.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No matching items found</h3>
                        <p>
                            We couldn't find any items that match your clothing right now.
                            Check back later as new donations are added!
                        </p>
                    </div>
                )}

                {/* How It Works */}
                {!imagePreview && (
                    <div style={{ marginTop: 'var(--space-12)' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                            How It <span className="gradient-text">Works</span>
                        </h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">📸</div>
                                <h3>1. Upload Photo</h3>
                                <p>Take a photo or upload an image of clothing you own or want to match with.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🤖</div>
                                <h3>2. AI Analysis</h3>
                                <p>Our AI identifies the color, style, and category of your clothing.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">✨</div>
                                <h3>3. Get Matches</h3>
                                <p>See complementary items from our donations that would go great with your clothes.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
