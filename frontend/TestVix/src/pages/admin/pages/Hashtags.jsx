import { useState } from 'react';
import { useHashtags } from '../hooks/useHashtags';
import TestHashtagLinker from '../components/TestHashtagLinker';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

export default function Hashtags() {
    const [activeTab, setActiveTab] = useState('hashtags'); // 'hashtags' or 'links'
    
    // Hashtag management hook
    const {
        hashtags,
        pagedData,
        loading,
        page,
        totalPages,
        setPage,
        createHashtag,
        updateHashtag,
        deleteHashtag,
        refetch
    } = useHashtags();
    
    // UI states
    const [newHashtag, setNewHashtag] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newHashtag.trim()) return;
        
        setSaving(true);
        const result = await createHashtag(newHashtag);
        if (result.success) {
            setNewHashtag('');
        } else {
            alert(result.message);
        }
        setSaving(false);
    };

    const handleEdit = (hashtag) => {
        setEditing(hashtag);
        setEditName(hashtag.name);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) return;
        
        setSaving(true);
        const result = await updateHashtag(editing.id, editName);
        if (result.success) {
            setEditing(null);
            setEditName('');
        } else {
            alert(result.message);
        }
        setSaving(false);
    };

    const handleDelete = async (hashtagId) => {
        const result = await deleteHashtag(hashtagId);
        if (result.success) {
            setDeleting(null);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="page">
            {/* Tab Navigation */}
            <div className="tab-system">
                <button 
                    className={`tab-system__btn ${activeTab === 'hashtags' ? 'tab-system__btn--active' : ''}`}
                    onClick={() => setActiveTab('hashtags')}
                >
                    Hashtaglar
                </button>
                <button 
                    className={`tab-system__btn ${activeTab === 'links' ? 'tab-system__btn--active' : ''}`}
                    onClick={() => setActiveTab('links')}
                >
                    Test-Hashtag Bog'lanish
                </button>
            </div>

            {/* Hashtags Tab */}
            {activeTab === 'hashtags' && (
                <>
                    <div className="page__toolbar">
                        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Yangi hashtag yaratish..."
                                value={newHashtag}
                                onChange={(e) => setNewHashtag(e.target.value)}
                                disabled={loading || saving}
                                style={{
                                    flex: 1,
                                    padding: '14px 18px',
                                    border: '2px solid var(--admin-input-border)',
                                    borderRadius: '12px',
                                    background: 'var(--admin-input-bg)',
                                    color: 'var(--text)',
                                    fontSize: '14px'
                                }}
                            />
                            <button 
                                type="submit" 
                                className="btn btn--primary" 
                                disabled={loading || saving || !newHashtag.trim()}
                            >
                                {saving ? 'Yaratilmoqda...' : '+ Yaratish'}
                            </button>
                        </form>
                    </div>

                    <div className="panel">
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Hashtag</th>
                                        <th className="table__actions-col">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedData.map((h) => (
                                        <tr key={h.id}>
                                            <td>{h.id}</td>
                                            <td>
                                                <span className="badge badge--blue">#{h.name}</span>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button
                                                        className="row-actions__btn"
                                                        onClick={() => handleEdit(h)}
                                                        title="Tahrirlash"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="row-actions__btn row-actions__btn--danger"
                                                        onClick={() => setDeleting(h)}
                                                        title="O'chirish"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pagedData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="table__empty">
                                                {loading ? 'Yuklanmoqda...' : 'Hashtaglar topilmadi'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="panel__footer">
                            <span className="panel__count">{hashtags.length} ta hashtag</span>
                            {totalPages > 1 && (
                                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Test-Hashtag Links Tab */}
            {activeTab === 'links' && (
                <TestHashtagLinker hashtags={hashtags} />
            )}

            {/* Delete Hashtag Dialog */}
            {deleting && (
                <ConfirmDialog
                    title="Hashtagni o'chirish"
                    message={`"#${deleting.name}" hashtagini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => handleDelete(deleting.id)}
                />
            )}

            {/* Edit Hashtag Modal */}
            {editing && (
                <Modal
                    title="Hashtagni tahrirlash"
                    onClose={() => {
                        setEditing(null);
                        setEditName('');
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                                Hashtag nomi
                            </label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Hashtag nomi..."
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid var(--admin-input-border)',
                                    borderRadius: '12px',
                                    background: 'var(--admin-input-bg)',
                                    color: 'var(--text)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                className="btn btn--ghost"
                                onClick={() => {
                                    setEditing(null);
                                    setEditName('');
                                }}
                                disabled={saving}
                            >
                                Bekor qilish
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={handleSaveEdit}
                                disabled={saving || !editName.trim()}
                            >
                                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}