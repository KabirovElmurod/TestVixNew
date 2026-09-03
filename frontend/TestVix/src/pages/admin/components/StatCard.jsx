// import '../../style/admin.css';

export default function StatCard({ icon, label, value, trend, accent }) {
    return (
        <div className={`stat-card stat-card--${accent}`}>
            <div className="stat-card__icon">{icon}</div>
            <div className="stat-card__info">
                <p className="stat-card__label">{label}</p>
                <p className="stat-card__value">{value}</p>
                {trend && <p className="stat-card__trend">{trend}</p>}
            </div>
        </div>
    );
}