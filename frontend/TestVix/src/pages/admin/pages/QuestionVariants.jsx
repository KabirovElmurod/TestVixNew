import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetTestById } from '../../../api/request_testlar';
import { 
    adminGetQuestionById, 
    adminGetVariantsByQuestionId,
    adminCreateVariant,
    adminUpdateVariant,
    adminDeleteVariant
} from '../../../api/request_savollar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

const EMPTY_VARIANT_FORM = {
    text: '',
    is_true: false,
    savol_id: 0,
};

export default function QuestionVariants() {
    const { testId, questionId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [question, setQuestion] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Variants management state
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_VARIANT_FORM);
    const [deleting, setDeleting] = useState(null);
    const [saving, setSaving] = useState(false);

    // Fetch test, question and variants
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [testData, questionData] = await Promise.all([
                    adminGetTestById(testId),
                    adminGetQuestionById(questionId)
                ]);

                if (testData && !testData.status) {
                    setTest(testData);
                } else {
                    console.error('Error fetching test:', testData);
                }

                if (questionData && !questionData.status) {
                    setQuestion(questionData);
                    setForm({ ...EMPTY_VARIANT_FORM, savol_id: questionData.id });
                } else {
                    console.error('Error fetching question:', questionData);
                }

                // Fetch variants
                const variantsData = await adminGetVariantsByQuestionId(questionId);
                if (variantsData && Array.isArray(variantsData)) {
                    setVariants(variantsData);
                } else {
                    setVariants([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Ma\'lumotlarni yuklashda xatolik');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [testId, questionId]);

    // Filter variants
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return variants.filter((variant) => {
            const matchQ = !q || variant.text.toLowerCase().includes(q);
            return matchQ;
        });
    }, [variants, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const openCreate = () => {
        setForm({ ...EMPTY_VARIANT_FORM, savol_id: question?.id || 0 });
        setEditing('new');
    };

    const openEdit = (variant) => {
        setForm({ ...variant });
        setEditing(variant.id);
    };

    const saveForm = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (editing === 'new') {
                const result = await adminCreateVariant(questionId, {
                    text: form.text,
                    is_true: form.is_true
                });
                if (result.status === true || result.status === undefined) {
                    const variantsData = await adminGetVariantsByQuestionId(questionId);
                    if (Array.isArray(variantsData)) {
                        setVariants(variantsData);
                    }
                    setEditing(null);
                } else {
                    setError(result.message || 'Variant yaratishda xatolik');
                }
            } else {
                const result = await adminUpdateVariant(questionId, editing, {
                    text: form.text,
                    is_true: form.is_true
                });
                if (result.status === true) {
                    const variantsData = await adminGetVariantsByQuestionId(questionId);
                    if (Array.isArray(variantsData)) {
                        setVariants(variantsData);
                    }
                    setEditing(null);
                } else {
                    setError(result.message || 'Variantni yangilashda xatolik');
                }
            }
        } catch (err) {
            setError('Server bilan bog\'lanishda xatolik');
            console.error('Error saving variant:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="page">Yuklanmoqda...</div>;
    }

    if (!question) {
        return <div className="page">Savol topilmadi</div>;
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
                        <h2 className="panel__title">{test?.nom || 'Test'}</h2>
                        <p className="panel__subtitle">Variantlarni boshqarish</p>
                    </div>
                    <button className="btn btn--ghost" onClick={() => navigate(`/admin/tests/${testId}/questions`)}>
                        ← Savollarga qaytish
                    </button>
                </div>
            </div>

            <div className="panel">
                <div className="panel__header">
                    <div>
                        <h3 className="panel__title">Savol #{question.id}</h3>
                        <p className="panel__subtitle">{question.text}</p>
                    </div>
                </div>
            </div>

            <div className="page__toolbar">
                <div className="search-box">
                    <span className="search-box__icon">🔍</span>
                    <input
                        className="search-box__input"
                        placeholder="Qidirish: variant matni..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <button className="btn btn--primary" onClick={openCreate}>
                    + Yangi variant
                </button>
            </div>

            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Variant</th>
                                <th>To'g'ri</th>
                                <th className="table__actions-col">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((v) => (
                                <tr key={v.id}>
                                    <td>
                                        <p className="test-cell__name">{v.text}</p>
                                    </td>
                                    <td>
                                        {v.is_true ? (
                                            <span className="badge badge--green">✓ To'g'ri</span>
                                        ) : (
                                            <span className="badge badge--gray">✗ Noto'g'ri</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="row-actions__btn" onClick={() => openEdit(v)} title="Tahrirlash">
                                                ✏️
                                            </button>
                                            <button
                                                className="row-actions__btn row-actions__btn--danger"
                                                onClick={() => setDeleting(v)}
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
                                    <td colSpan={3} className="table__empty">
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
                    title={editing === 'new' ? 'Yangi variant' : 'Variantni tahrirlash'}
                    onClose={() => setEditing(null)}
                >
                    <form className="form" onSubmit={saveForm}>
                        <label className="form__field">
                            <span>Savol</span>
                            <input
                                disabled
                                value={question?.text || ''}
                            />
                        </label>
                        <label className="form__field">
                            <span>Variant matni *</span>
                            <textarea
                                rows={3}
                                required
                                value={form.text}
                                onChange={(e) => setForm({ ...form, text: e.target.value })}
                            />
                        </label>
                        <label className="form__check">
                            <input
                                type="checkbox"
                                checked={form.is_true}
                                onChange={(e) => setForm({ ...form, is_true: e.target.checked })}
                            />
                            <span>To'g'ri javob</span>
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

            {deleting && (
                <ConfirmDialog
                    title="Variantni o'chirish"
                    message="Bu variantni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
                    onCancel={() => setDeleting(null)}
                    onConfirm={async () => {
                        try {
                            const result = await adminDeleteVariant(questionId, deleting.id);
                            if (result.status === true) {
                                const variantsData = await adminGetVariantsByQuestionId(questionId);
                                if (Array.isArray(variantsData)) {
                                    setVariants(variantsData);
                                }
                                setDeleting(null);
                            } else {
                                setError(result.message || 'Variantni o\'chirishda xatolik');
                            }
                        } catch (err) {
                            setError('Server bilan bog\'lanishda xatolik');
                            console.error('Error deleting variant:', err);
                        }
                    }}
                />
            )}
        </div>
    );
}