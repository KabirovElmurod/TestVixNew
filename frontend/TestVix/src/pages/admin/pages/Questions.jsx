import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockTests, mockUsers, mockQuestions, mockVariants } from '../data/mockData';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

const EMPTY_FORM = {
    text: '',
    svg_json: '',
    test_id: mockTests[0]?.id ?? 1,
};

const EMPTY_VARIANT_FORM = {
    text: '',
    is_true: false,
    savol_id: '',
};

export default function Questions() {
    const [searchParams] = useSearchParams();
    const [questions, setQuestions] = useState(mockQuestions);
    const [variants, setVariants] = useState(mockVariants);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'variants'
    
    // Questions management state
    const [search, setSearch] = useState('');
    const [testFilter, setTestFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleting, setDeleting] = useState(null);
    const [viewing, setViewing] = useState(null);
    
    // Handle URL parameter for test filtering
    useEffect(() => {
        const testIdFromUrl = searchParams.get('test_id');
        if (testIdFromUrl) {
            setTestFilter(testIdFromUrl);
        }
    }, [searchParams]);
    
    // Variants management state
    const [variantSearch, setVariantSearch] = useState('');
    const [variantQuestionFilter, setVariantQuestionFilter] = useState('all');
    const [variantPage, setVariantPage] = useState(1);
    const [editingVariant, setEditingVariant] = useState(null);
    const [variantForm, setVariantForm] = useState(EMPTY_VARIANT_FORM);
    const [deletingVariant, setDeletingVariant] = useState(null);

    const testById = useMemo(
        () => Object.fromEntries(mockTests.map((t) => [t.id, t])),
        []
    );

    const questionById = useMemo(
        () => Object.fromEntries(questions.map((q) => [q.id, q])),
        [questions]
    );

    // Filter questions
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return questions.filter((question) => {
            const matchQ =
                !q ||
                question.text.toLowerCase().includes(q) ||
                String(question.id).includes(q);
            const matchTest = testFilter === 'all' || question.test_id === Number(testFilter);
            return matchQ && matchTest;
        });
    }, [questions, search, testFilter]);

    // Filter variants
    const filteredVariants = useMemo(() => {
        const q = variantSearch.trim().toLowerCase();
        return variants.filter((variant) => {
            const matchQ = !q || 
                variant.text.toLowerCase().includes(q) ||
                questionById[variant.savol_id]?.text.toLowerCase().includes(q);
            const matchQuestion = variantQuestionFilter === 'all' || variant.savol_id === Number(variantQuestionFilter);
            return matchQ && matchQuestion;
        });
    }, [variants, variantSearch, variantQuestionFilter, questionById]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const variantTotalPages = Math.max(1, Math.ceil(filteredVariants.length / PAGE_SIZE));
    const variantSafePage = Math.min(variantPage, variantTotalPages);
    const variantPageItems = filteredVariants.slice(
        (variantSafePage - 1) * PAGE_SIZE, 
        variantSafePage * PAGE_SIZE
    );

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditing('new');
    };

    const openEdit = (question) => {
        setForm({ ...question });
        setEditing(question.id);
    };

    const saveForm = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            const id = Math.max(0, ...questions.map((q) => q.id)) + 1;
            setQuestions([
                ...questions,
                { ...form, id, test_id: Number(form.test_id) },
            ]);
        } else {
            setQuestions(questions.map((q) => (q.id === editing ? { ...q, ...form, test_id: Number(form.test_id) } : q)));
        }
        setEditing(null);
    };

    const openCreateVariant = () => {
        setVariantForm(EMPTY_VARIANT_FORM);
        setEditingVariant('new');
    };

    const openEditVariant = (variant) => {
        setVariantForm({ ...variant });
        setEditingVariant(variant.id);
    };

    const saveVariantForm = (e) => {
        e.preventDefault();
        if (editingVariant === 'new') {
            const id = Math.max(0, ...variants.map((v) => v.id)) + 1;
            setVariants([
                ...variants,
                { ...variantForm, id, savol_id: Number(variantForm.savol_id) },
            ]);
        } else {
            setVariants(variants.map((v) => 
                v.id === editingVariant 
                    ? { ...v, ...variantForm, savol_id: Number(variantForm.savol_id) } 
                    : v
            ));
        }
        setEditingVariant(null);
    };

    return (
        <div className="page">
            <div className="panel">
                <div className="panel__header">
                    <div className="tab-system">
                        <button
                            className={`tab-system__btn ${activeTab === 'questions' ? 'tab-system__btn--active' : ''}`}
                            onClick={() => setActiveTab('questions')}
                        >
                            Savollar
                        </button>
                        <button
                            className={`tab-system__btn ${activeTab === 'variants' ? 'tab-system__btn--active' : ''}`}
                            onClick={() => setActiveTab('variants')}
                        >
                            Variantlar
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'questions' && (
                <>
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
                                        <th>Test</th>
                                        <th>SVG JSON</th>
                                        <th className="table__actions-col">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((q) => (
                                        <tr key={q.id}>
                                            <td>
                                                <p className="test-cell__name">{q.text}</p>
                                            </td>
                                            <td>{testById[q.test_id]?.nom ?? '—'}</td>
                                            <td>
                                                {q.svg_json ? (
                                                    <span className="badge badge--blue">Bor</span>
                                                ) : (
                                                    <span className="badge badge--gray">Yo'q</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button className="row-actions__btn" onClick={() => setViewing(q)} title="Ko'rish">
                                                        👁️
                                                    </button>
                                                    <button 
                                                        className="row-actions__btn" 
                                                        onClick={() => {
                                                            setActiveTab('variants');
                                                            setVariantQuestionFilter(q.id.toString());
                                                        }} 
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
                </>
            )}

            {activeTab === 'variants' && (
                <>
                    <div className="page__toolbar">
                        <div className="search-box">
                            <span className="search-box__icon">🔍</span>
                            <input
                                className="search-box__input"
                                placeholder="Qidirish: variant matni..."
                                value={variantSearch}
                                onChange={(e) => {
                                    setVariantSearch(e.target.value);
                                    setVariantPage(1);
                                }}
                            />
                        </div>
                        <select
                            className="select"
                            value={variantQuestionFilter}
                            onChange={(e) => {
                                setVariantQuestionFilter(e.target.value);
                                setVariantPage(1);
                            }}
                        >
                            <option value="all">Barcha savollar</option>
                            {questions.map((q) => (
                                <option key={q.id} value={q.id}>
                                    {q.text.substring(0, 30)}...
                                </option>
                            ))}
                        </select>
                        <button className="btn btn--primary" onClick={openCreateVariant}>
                            + Yangi variant
                        </button>
                    </div>

                    <div className="panel">
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Variant</th>
                                        <th>Savol</th>
                                        <th>To'g'ri</th>
                                        <th className="table__actions-col">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variantPageItems.map((v) => (
                                        <tr key={v.id}>
                                            <td>
                                                <p className="test-cell__name">{v.text}</p>
                                            </td>
                                            <td>
                                                <p className="test-cell__desc">
                                                    {questionById[v.savol_id]?.text?.substring(0, 40) ?? '—'}...
                                                </p>
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
                                                    <button className="row-actions__btn" onClick={() => openEditVariant(v)} title="Tahrirlash">
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="row-actions__btn row-actions__btn--danger"
                                                        onClick={() => setDeletingVariant(v)}
                                                        title="O'chirish"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {variantPageItems.length === 0 && (
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
                            <span className="panel__count">{filteredVariants.length} ta natija</span>
                            <Pagination page={variantSafePage} totalPages={variantTotalPages} onChange={setVariantPage} />
                        </div>
                    </div>
                </>
            )}

            {editing !== null && (
                <Modal
                    title={editing === 'new' ? 'Yangi savol' : 'Savolni tahrirlash'}
                    onClose={() => setEditing(null)}
                >
                    <form className="form" onSubmit={saveForm}>
                        <label className="form__field">
                            <span>Test *</span>
                            <select
                                required
                                value={form.test_id}
                                onChange={(e) => setForm({ ...form, test_id: e.target.value })}
                            >
                                {mockTests.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nom}
                                    </option>
                                ))}
                            </select>
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
                            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                                Bekor qilish
                            </button>
                            <button type="submit" className="btn btn--primary">
                                Saqlash
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
                            <span>{testById[viewing.test_id]?.nom ?? '—'}</span>
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

            {/* Variant Modal */}
            {editingVariant !== null && (
                <Modal
                    title={editingVariant === 'new' ? 'Yangi variant' : 'Variantni tahrirlash'}
                    onClose={() => setEditingVariant(null)}
                >
                    <form className="form" onSubmit={saveVariantForm}>
                        <label className="form__field">
                            <span>Savol *</span>
                            <select
                                required
                                value={variantForm.savol_id}
                                onChange={(e) => setVariantForm({ ...variantForm, savol_id: e.target.value })}
                            >
                                <option value="">Tanlang...</option>
                                {questions.map((q) => (
                                    <option key={q.id} value={q.id}>
                                        {q.text.substring(0, 50)}...
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="form__field">
                            <span>Variant matni *</span>
                            <textarea
                                rows={3}
                                required
                                value={variantForm.text}
                                onChange={(e) => setVariantForm({ ...variantForm, text: e.target.value })}
                            />
                        </label>
                        <label className="form__check">
                            <input
                                type="checkbox"
                                checked={variantForm.is_true}
                                onChange={(e) => setVariantForm({ ...variantForm, is_true: e.target.checked })}
                            />
                            <span>To'g'ri javob</span>
                        </label>
                        <div className="form__footer">
                            <button type="button" className="btn btn--ghost" onClick={() => setEditingVariant(null)}>
                                Bekor qilish
                            </button>
                            <button type="submit" className="btn btn--primary">
                                Saqlash
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Variant Delete Confirm */}
            {deletingVariant && (
                <ConfirmDialog
                    title="Variantni o'chirish"
                    message="Bu variantni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
                    onCancel={() => setDeletingVariant(null)}
                    onConfirm={() => {
                        setVariants(variants.filter((v) => v.id !== deletingVariant.id));
                        setDeletingVariant(null);
                    }}
                />
            )}
        </div>
    );
}