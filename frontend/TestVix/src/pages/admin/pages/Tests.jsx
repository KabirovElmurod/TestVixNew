import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminGetAllTests, adminCreateTest, adminUpdateTest, adminDeleteTest, adminGetTestHashtags } from '../../../api/request_testlar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

// const PAGE_SIZE = 6;

const EMPTY_FORM = {
    nom: '',
    fan: '',
    tavsif: '',
    ispublic: true,
};

export default function Tests() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userIdFromUrl = searchParams.get('user_id');
    
    const [tests, setTests] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [fanFilter, setFanFilter] = useState('all');
    const [publicFilter, setPublicFilter] = useState('all');
    const [userFilter, setUserFilter] = useState(userIdFromUrl ? parseInt(userIdFromUrl) : 0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(3)
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleting, setDeleting] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [viewingHashtags, setViewingHashtags] = useState([]);

    // API dan testlarni yuklash
    const fetchTests = async () => {
        try {
            setLoading(true);
            const params = {
                search: search || undefined,
                fan: fanFilter !== 'all' ? fanFilter : undefined,
                ispublic: publicFilter !== 'all' ? publicFilter === 'public' : undefined,
                user_id: userFilter,
                skip: (page - 1)
            };
            console.log('params', params)
            const data = await adminGetAllTests(params);
            console.log('data=>', data)
            if (data && data.tests && Array.isArray(data.tests)) {
                setTests(data.tests);
                setTotalCount(data.total_count || 0);
                setPages(data.pages || 1);
            } else if (data && data.status === false) {
                setError(data.message || 'Testlarni yuklashda xatolik');
            } else {
                setTests([]);
                setTotalCount(0);
            }
        } catch (err) {
            setError('Server bilan bog\'lanishda xatolik');
            console.error('Error fetching tests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [fanFilter, publicFilter, userFilter, page]);

    const fans = useMemo(() => [...new Set(tests.map((t) => t.fan))].sort(), [tests]);

    // Pagination logic - backend skip/limit ishlatadi
    const totalPages = pages;
    const safePage = Math.min(page, totalPages);
    const pageItems = tests;

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditing('new');
    };

    const openEdit = (test) => {
        setForm({ ...test });
        setEditing(test.id);
    };

    const saveForm = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing === 'new') {
                const result = await adminCreateTest(form);
                if (result.status === true || result.status === undefined) {
                    // Success
                    await fetchTests();
                    setEditing(null);
                } else {
                    alert(result.message || 'Test yaratishda xatolik');
                }
            } else {
                const result = await adminUpdateTest(editing, form);
                if (result.status === true) {
                    // Success
                    await fetchTests();
                    setEditing(null);
                } else {
                    alert(result.message || 'Testni yangilashda xatolik');
                }
            }
        } catch (err) {
            alert('Server bilan bog\'lanishda xatolik');
            console.error('Error saving test:', err);
        } finally {
            setSaving(false);
        }
    };

    const togglePublic = async (id) => {
        try {
            const test = tests.find(t => t.id === id);
            if (test) {
                const result = await adminUpdateTest(id, { ispublic: !test.ispublic });
                if (result.status === true) {
                    await fetchTests();
                } else {
                    alert(result.message || 'Test holatini o\'zgartirishda xatolik');
                }
            }
        } catch (err) {
            alert('Server bilan bog\'lanishda xatolik');
            console.error('Error toggling public:', err);
        }
    };

    const openViewModal = async (test) => {
        setViewing(test);
        try {
            const hashtags = await adminGetTestHashtags(test.id);
            if (Array.isArray(hashtags)) {
                setViewingHashtags(hashtags);
            } else {
                setViewingHashtags([]);
            }
        } catch (err) {
            console.error('Error fetching test hashtags:', err);
            setViewingHashtags([]);
        }
    };

    return (
        <div className="page">
            {error && (
                <div style={{ 
                    padding: '16px', 
                    background: 'var(--admin-badge-red-bg)', 
                    color: 'var(--admin-badge-red-text)', 
                    borderRadius: '8px', 
                    marginBottom: '16px' 
                }}>
                    {error}
                </div>
            )}
            
            <div className="page__toolbar">
                <form className="search-box" onSubmit={(e) => {
                    e.preventDefault();
                    setPage(1);
                    fetchTests();
                }}>
                    <span className="search-box__icon">🔍</span>
                    <input
                        className="search-box__input"
                        placeholder="Qidirish: nom, fan, test ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        disabled={loading}
                    />
                </form>
                <select
                    className="select"
                    value={fanFilter}
                    onChange={(e) => {
                        setFanFilter(e.target.value);
                        setPage(1);
                        fetchTests();
                    }}
                    disabled={loading}
                >
                    <option value="all">Barcha fanlar</option>
                    {fans.map((f) => (
                        <option key={f} value={f}>
                            {f}
                        </option>
                    ))}
                </select>
                <select
                    className="select"
                    value={publicFilter}
                    onChange={(e) => {
                        setPublicFilter(e.target.value);
                        setPage(1);
                        fetchTests();
                    }}
                    disabled={loading}
                >
                    <option value="all">Barchasi</option>
                    <option value="public">Ochiq</option>
                    <option value="private">Yopiq</option>
                </select>
                <button className="btn btn--primary" onClick={openCreate} disabled={loading}>
                    + Yangi test
                </button>
            </div>

            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Test</th>
                                <th>Test ID</th>
                                <th>Fan</th>
                                <th>Muallif</th>
                                <th>Holat</th>
                                <th>Yaratilgan</th>
                                <th className="table__actions-col">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        <p className="test-cell__name">{t.nom}</p>
                                        <p className="test-cell__desc">{t.tavsif}</p>
                                    </td>
                                    <td>
                                        <code className="code-badge">{t.test_id}</code>
                                    </td>
                                    <td>{t.fan}</td>
                                    <td>{t.username || `User ID: ${t.user_id}`}</td>
                                    <td>
                                        <button
                                            className={`badge badge--clickable ${t.ispublic ? 'badge--green' : 'badge--gray'}`}
                                            onClick={() => togglePublic(t.id)}
                                            title="Holatni ozgartirish"
                                        >
                                            {t.ispublic ? 'Ochiq' : 'Yopiq'}
                                        </button>
                                    </td>
                                    <td>{t.created}</td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="row-actions__btn" onClick={() => openViewModal(t)} title="Ko'rish">
                                                👁️
                                            </button>
                                            <button className="row-actions__btn" onClick={() => navigate(`/admin/tests/${t.id}/questions`)} title="Savollar">
                                                ❓
                                            </button>
                                            <button className="row-actions__btn" onClick={() => openEdit(t)} title="Tahrirlash">
                                                ✏️
                                            </button>
                                            <button
                                                className="row-actions__btn row-actions__btn--danger"
                                                onClick={() => setDeleting(t)}
                                                title="O'chirish"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                    <span className="panel__count">{totalCount} ta natija</span>
                    <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
                </div>
            </div>

            {editing !== null && (
                <Modal
                    title={editing === 'new' ? 'Yangi test' : 'Testni tahrirlash'}
                    onClose={() => setEditing(null)}
                >
                    <form className="form" onSubmit={saveForm}>
                        <label className="form__field">
                            <span>Nomi *</span>
                            <input
                                required
                                value={form.nom}
                                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                            />
                        </label>
                        <label className="form__field">
                            <span>Fan *</span>
                            <input
                                required
                                value={form.fan}
                                onChange={(e) => setForm({ ...form, fan: e.target.value })}
                            />
                        </label>
                        <label className="form__field">
                            <span>Tavsif</span>
                            <textarea
                                rows={3}
                                value={form.tavsif}
                                onChange={(e) => setForm({ ...form, tavsif: e.target.value })}
                            />
                        </label>
                        <label className="form__check">
                            <input
                                type="checkbox"
                                checked={form.ispublic}
                                onChange={(e) => setForm({ ...form, ispublic: e.target.checked })}
                            />
                            <span>Ochiq (public)</span>
                        </label>
                        <div className="form__footer">
                            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)} disabled={saving}>
                                Bekor qilish
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={saving}>
                                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {viewing && (
                <Modal title={viewing.nom} onClose={() => setViewing(null)}>
                    <div className="detail">
                        <div className="detail__row">
                            <span className="detail__label">Test ID</span>
                            <code className="code-badge">{viewing.test_id}</code>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Fan</span>
                            <span>{viewing.fan}</span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Muallif</span>
                            <span>{viewing.username || `User ID: ${viewing.user_id}`}</span>
                        </div>
                        <div className="detail__row">
                            <span className="detail__label">Holat</span>
                            <span className={`badge ${viewing.ispublic ? 'badge--green' : 'badge--gray'}`}>
                                {viewing.ispublic ? 'Ochiq' : 'Yopiq'}
                            </span>
                        </div>
                        <div className="detail__row detail__row--column">
                            <span className="detail__label">Tavsif</span>
                            <p>{viewing.tavsif}</p>
                        </div>
                        {viewingHashtags.length > 0 && (
                            <div className="detail__row detail__row--column">
                                <span className="detail__label">Hashtaglar</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {viewingHashtags.map((th) => (
                                        <span key={th.id} className="badge badge--blue">
                                            #{th.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title="Testni o'chirish"
                    message={`"${deleting.nom}" testini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
                    onCancel={() => setDeleting(null)}
                    onConfirm={async () => {
                        try {
                            const result = await adminDeleteTest(deleting.id);
                            if (result.status === true) {
                                await fetchTests();
                                setDeleting(null);
                            } else {
                                alert(result.message || 'Testni o\'chirishda xatolik');
                            }
                        } catch (err) {
                            alert('Server bilan bog\'lanishda xatolik');
                            console.error('Error deleting test:', err);
                        }
                    }}
                />
            )}

        </div>
    );
}