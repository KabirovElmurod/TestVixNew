import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetTestById } from '../../../api/request_testlar';
import { mockQuestions, mockVariants } from '../data/mockData';
import { adminGetQuestionsByTestId, adminUpdateQuestion } from '../../../api/request_savollar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

const EMPTY_FORM = {
    text: '',
    svg_json: '',
    test_id: 0,
};

export default function TestQuestions() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);

    // Questions management state
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleting, setDeleting] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch test details and questions
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [testData, questionsData] = await Promise.all([
                    adminGetTestById(testId),
                    adminGetQuestionsByTestId(testId)
                ]);

                if (testData && !testData.status) {
                    setTest(testData);
                    setForm({ ...EMPTY_FORM, test_id: testData.id });
                } else {
                    console.error('Error fetching test:', testData);
                }

                if (questionsData && Array.isArray(questionsData)) {
                    setQuestions(questionsData);
                } else {
                    console.error('Error fetching questions:', questionsData);
                    // Fallback to mock data
                    const testQuestions = mockQuestions.filter(q => q.test_id === Number(testId));
                    setQuestions(testQuestions);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                // Fallback to mock data
                const testQuestions = mockQuestions.filter(q => q.test_id === Number(testId));
                setQuestions(testQuestions);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [testId]);

    // Filter questions
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return questions.filter((question) => {
            const matchQ =
                !q ||
                question.text.toLowerCase().includes(q) ||
                String(question.id).includes(q);
            return matchQ;
        });
    }, [questions, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const openCreate = () => {
        setForm({ ...EMPTY_FORM, test_id: test?.id || 0 });
        setEditing('new');
    };

    const openEdit = (question) => {
        setForm({ ...question });
        setEditing(question.id);
    };

    const saveForm = async (e) => {
        e.preventDefault();
        if (editing === 'new') {
            const id = Math.max(0, ...questions.map((q) => q.id)) + 1;
            setQuestions([
                ...questions,
                { ...form, id, test_id: Number(form.test_id) },
            ]);
        } else {
            let data = {}
            questions.map(
                (q) => {
                    if (q.id == editing) {
                        data.text = form.text != q.text ? form.text : 'null'
                        data.svg_json = form.svg_json != q.svg_json ? form.svg_json : 'null'
                    }
                    // q.id === editing ? { ...q, ...form, test_id: Number(form.test_id) } : q
                }
            )
            // let data = {
            //     'text': form.text == viewing.text ? form.text : 'null',
            //     'svg_json': form.svg_json == viewing.svg_json ? form.svg_json : 'null'
            // }
            let res = await adminUpdateQuestion(editing, data)
            setQuestions(questions.map((q) => (q.id === editing ? { ...q, ...form, test_id: Number(form.test_id) } : q)));
        }
        setEditing(null);
    };

    if (loading) {
        return <div className="page">Yuklanmoqda...</div>;
    }

    if (!test) {
        return <div className="page">Test topilmadi</div>;
    }

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

            <div className="panel">
                <div className="panel__header">
                    <div>
                        <h2 className="panel__title">{test.nom}</h2>
                        <p className="panel__subtitle">Savollarni boshqarish</p>
                    </div>
                    <button className="btn btn--ghost" onClick={() => navigate('/admin/tests')}>
                        ← Orqaga
                    </button>
                </div>
            </div>

            <div className="page__toolbar">
                <div className="search-box">
                    <span className="search-box__icon">🔍</span>
                    <input
                        className="search-box__input"
                        placeholder="Qidirish: savol matni..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <button className="btn btn--primary" onClick={openCreate}>
                    + Yangi savol
                </button>
            </div>

            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Savol</th>
                                <th>SVG JSON</th>
                                <th>Variantlar soni</th>
                                <th className="table__actions-col">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((q) => (
                                <tr key={q.id}>
                                    <td>
                                        <p className="test-cell__name">{q.text}</p>
                                    </td>
                                    <td>
                                        {q.svg_json ? (
                                            <span className="badge badge--blue">Bor</span>
                                        ) : (
                                            <span className="badge badge--gray">Yo'q</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge badge--violet">
                                            {q.variantlar?.length || 0} ta
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="row-actions__btn" onClick={() => setViewing(q)} title="Ko'rish">
                                                👁️
                                            </button>
                                            <button
                                                className="row-actions__btn"
                                                onClick={() => navigate(`/admin/tests/${testId}/questions/${q.id}/variants`)}
                                                title="Variantlar"
                                            >
                                                📝
                                            </button>
                                            <button className="row-actions__btn" onClick={() => openEdit(q)} title="Tahrirlash">
                                                ✏️
                                            </button>
                                            <button
                                                className="row-actions__btn row-actions__btn--danger"
                                                onClick={() => setDeleting(q)}
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
                                    <td colSpan={4} className="table__empty">
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

            {editing !== null && (
                <Modal
                    title={editing === 'new' ? 'Yangi savol' : 'Savolni tahrirlash'}
                    onClose={() => setEditing(null)}
                >
                    <form className="form" onSubmit={saveForm}>
                        <label className="form__field">
                            <span>Test</span>
                            <input
                                disabled
                                value={test?.nom || ''}
                            />
                        </label>
                        <label className="form__field">
                            <span>Savol matni *</span>
                            <textarea
                                rows={4}
                                required
                                value={form.text}
                                onChange={(e) => setForm({ ...form, text: e.target.value })}
                            />
                        </label>
                        <label className="form__field">
                            <span>SVG JSON (ixtiyoriy)</span>
                            <textarea
                                rows={6}
                                value={form.svg_json || ''}
                                onChange={(e) => setForm({ ...form, svg_json: e.target.value })}
                                placeholder='{"type": "graph", "data": [...]}'
                            />
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
                <Modal title="Savol tafsilotlari" onClose={() => setViewing(null)}>
                    <div className="detail">
                        <div className="detail__row">
                            <span className="detail__label">Test</span>
                            <span>{test?.nom ?? '—'}</span>
                        </div>
                        <div className="detail__row detail__row--column">
                            <span className="detail__label">Savol matni</span>
                            <p>{viewing.text}</p>
                        </div>
                        <div className="detail__row detail__row--column">
                            <span className="detail__label">SVG JSON</span>
                            {viewing.svg_json ? (
                                <pre style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    overflow: 'auto',
                                    fontSize: '0.85rem'
                                }}>
                                    {viewing.svg_json}
                                </pre>
                            ) : (
                                <span className="badge badge--gray">Mavjud emas</span>
                            )}
                        </div>
                        {viewing.variantlar && viewing.variantlar.length > 0 && (
                            <div className="detail__row detail__row--column">
                                <span className="detail__label">Variantlar</span>
                                <div style={{ marginTop: '12px' }}>
                                    {viewing.variantlar.map((v, idx) => (
                                        <div key={v.id || idx} style={{
                                            padding: '8px 12px',
                                            background: 'rgba(0,0,0,0.1)',
                                            borderRadius: '4px',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ color: v.is_true ? '#4ade80' : '#94a3b8' }}>
                                                {v.is_true ? '✓' : '✗'}
                                            </span>
                                            <span>{v.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title="Savolni o'chirish"
                    message={`Bu savolni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => {
                        setQuestions(questions.filter((q) => q.id !== deleting.id));
                        setDeleting(null);
                    }}
                />
            )}
        </div>
    );
}