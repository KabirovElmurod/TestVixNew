// import '../../style/admin.css';

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    return (
        <div className="pagination">
            <button
                className="pagination__btn"
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
            >
                ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                    key={p}
                    className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
                    onClick={() => onChange(p)}
                >
                    {p}
                </button>
            ))}
            <button
                className="pagination__btn"
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
            >
                ›
            </button>
        </div>
    );
}