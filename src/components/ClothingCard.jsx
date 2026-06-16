export default function ClothingCard({ item, onClaim, selectable = false, selected = false, onSelect }) {
    const conditionClass = {
        'Like New': 'condition-new',
        'Good': 'condition-good',
        'Fair': 'condition-fair'
    }[item.condition] || '';

    const handleClick = () => {
        if (selectable && onSelect) {
            onSelect(item.id);
        }
    };

    return (
        <div
            className={`clothing-card ${selectable ? 'selectable' : ''} ${selected ? 'selected' : ''}`}
            onClick={handleClick}
            style={selectable ? { cursor: 'pointer' } : {}}
        >
            {selectable && (
                <div
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: selected ? 'var(--primary)' : 'var(--surface)',
                        border: '2px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        zIndex: 10
                    }}
                >
                    {selected && '✓'}
                </div>
            )}

            <img
                src={item.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.type || 'Clothing')}`}
                alt={item.title}
                className="clothing-card-image"
                onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.type || 'Clothing')}`;
                }}
            />

            <div className="clothing-card-body">
                <h4 className="clothing-card-title">{item.title}</h4>

                <div className="clothing-card-meta">
                    <span className="clothing-card-tag">{item.type}</span>
                    <span className="clothing-card-tag">{item.size}</span>
                    <span className="clothing-card-tag">{item.gender}</span>
                    <span className={`clothing-card-tag ${conditionClass}`}>{item.condition}</span>
                </div>

                {item.validationWarning && (
                    <div style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-2)',
                        background: '#fff7ed', // Orange-50
                        border: '1px solid #fdba74', // Orange-300
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: '#c2410c', // Orange-700
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)'
                    }}>
                        <span>⚠️</span>
                        {item.validationWarning}
                    </div>
                )}

                {item.description && (
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-3)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {item.description}
                    </p>
                )}

                <div className="clothing-card-footer">
                    <div className="clothing-card-donor">
                        <div className="clothing-card-donor-avatar">
                            {item.donorName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span>{item.donorName || 'Anonymous'}</span>
                    </div>

                    {!selectable && onClaim && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClaim(item);
                            }}
                        >
                            Claim
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
