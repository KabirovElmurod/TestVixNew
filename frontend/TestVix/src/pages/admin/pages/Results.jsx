import { useMemo, useState } from 'react';
import { mockTests, mockUsers, mockResults } from '../data/mockData';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

export default function Results() {
    const [results, setResults] = useState(mockResults);
    const [search, setSearch] = useState('');
    const [testFilter, setTestFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const testById = useMemo(
        () => Object.fromEntries(mockTests.map((t) => [t.id, t])),
        []
    );

    const userById = useMemo(
        () => Object.fromEntries(mockUsers.map((u) => [u.id, u])),
        []
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return results.filter((result) => {
            const matchQ =
                !q ||
                userById[result.user_id]?.username.toLowerCase().includes(q) ||
                userById[result.user_id]?.email.toLowerCase().includes(q) ||
                testById[result.test_id]?.nom.toLowerCase().includes(q) ||
                String(result.id).includes(q);
            const matchTest = testFilter === 'all' || result.test_id === Number(testFilter);
            const matchUser = userFilter === 'all' || result.user_id === Number(userFilter);
            const matchStatus =
                statusFilter === 'all' ||
                (statusFilter === 'finished' && result.isfinish) ||
                (statusFilter === 'unfinished' && !result.isfinish);
            return matchQ && matchTest && matchUser && matchStatus;
        });
    }, [results, search, testFilter, userFilter, statusFilter, testById, userById]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const calculatePercentage = (trueCount, totalCount) => {
        if (totalCount === 0) return 0;
        return Math.round((trueCount / totalCount) * 100);
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'badge--green';
        if (percentage >= 60) return 'badge--blue';
        if (percentage >= 40) return 'badge--gray';
        return 'badge--gray'; // red could be added for low scores
    };

    return (
        <div className="page">
            <div className="page__toolbar">
                <div className="search-box">
                    <span className="search-box__icon">🔍</span>
                    <input
                        className="search-box__input"
                        placeholder="Qidirish: foydalanuvchi, test..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <select
                    className="select"
                    value={testFilter}
                    onChange={(e) => {
                        setTestFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">Barcha testlar</option>
                    {mockTests.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.nom}
                        </option>
                    ))}
                </select>
                <select
                    className="select"
                    value={userFilter}
                    onChange={(e) => {
                        setUserFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">Barcha foydalanuvchilar</option>
                    {mockUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                            @{u.username}
                        </option>
                    ))}
                </select>
                <select
                    className="select"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">Barcha holatlar</option>
                    <option value="finished">Tugatilgan</option>
                    <option value="unfinished">Tugatilmagan</option>
                </select>
            </div>

            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Foydalanuvchi</th>
                                <th>Test</th>
                                <th>Natija</th>
                                <th>Foiz</th>
                                <th>Holat</th>
                                <th>Sana</th>
                                <th className="table__actions-col">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((r) => {
                                const percentage = calculatePercentage(r.true_son, r.sum_son);
                                return (
                                    <tr key={r.id}>
                                        <td>
                                            <p className="test-cell__name">{userById[r.user_id]?.username ?? '—'}</p>
                                            <p className="test-cell__desc">{userById[r.user_id]?.email ?? ''}</p>
                                        </td>
                                        <td>{testById[r.test_id]?.nom ?? '—'}</td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>
                                                {r.true_son}/{r.sum_son}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getScoreColor(percentage)}`}>
                                                {percentage}%
                                            </span>
                                        </td>
                                        <td>
                                            {r.isfinish ? (
                                                <span className="badge badge--green">Tugatilgan</span>
                                            ) : (
                                                <span className="badge badge--gray">Tugatilmagan</span>
                                            )}
                                        </td>
                                        <td>{r.created}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="row-actions__btn" onClick={() => setViewing(r)} title="Ko'rish">
                                                    👁️
                                                </button>
                                                <button
                                                    className="row-actions__btn row-actions__btn--danger"
                                                    onClick={() => setDeleting(r)}
                                                    title="O'chirish"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {pageItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="table__empty">
                                        Hech narsa topilmadi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="panel__footer">
                    <span className="panel__count">{filtered.length} ta natija</span>
                    <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
                </div>
            </div>

            {viewing && (
                <Modal title="Natija tafsilotlari" onClose={() => setViewing(null)}>
                    <div className="detail">
                        <div className="detail__row">
                            <span className="detail__label">Foydalanuvchi</span>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600 }}>
                                    {userById[viewing.user_id]?.username ?? '—'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {userById[viewing.user_id]?.email ?? ''}
                                </p>
                            </div>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Test</span>
                            <span>{testById[viewing.test_id]?.nom ?? '—'}</span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Jami savollar</span>
                            <span>{viewing.sum_son}</span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">To\'g\'ri javoblar</span>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>{viewing.true_son}</span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Noto\'g\'ri javoblar</span>
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>{viewing.false_son}</span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Foiz</span>
                            <span className={`badge ${getScoreColor(calculatePercentage(viewing.true_son, viewing.sum_son))}`}>
                                {calculatePercentage(viewing.true_son, viewing.sum_son)}%
                            </span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Holat</span>
                            {viewing.isfinish ? (
                                <span className="badge badge--green">Tugatilgan</span>
                            ) : (
                                <span className="badge badge--gray">Tugatilmagan</span>
                            )}
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Sana</span>
                            <span>{viewing.created}</span>
                        </div>
                        {viewing.answer && Object.keys(viewing.answer).length > 0 && (
                            <div className="detail__row detail__row--column">
                                <span className="detail__label">Javoblar (JSON)</span>
                                <pre style={{ 
                                    background: 'rgba(0,0,0,0.2)', 
                                    padding: '12px', 
                                    borderRadius: '8px',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    maxHeight: '200px'
                                }}>
                                    {JSON.stringify(viewing.answer, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title="Natijani o'chirish"
                    message="Bu natijani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => {
                        setResults(results.filter((r) => r.id !== deleting.id));
                        setDeleting(null);
                    }}
                />
            )}
        </div>
    );
}