import { useState, useEffect } from 'react';
import { adminAddHashtagToTest, adminRemoveHashtagFromTest, adminGetTestHashtags, adminGetAllTests } from '../../../api/request_testlar';

export default function TestHashtagLinker({ hashtags }) {
    const [tests, setTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(true);
    const [testIdentifierInput, setTestIdentifierInput] = useState('');
    const [hashtagNameInput, setHashtagNameInput] = useState('');
    const [testHashtags, setTestHashtags] = useState([]);
    const [loadingTestHashtags, setLoadingTestHashtags] = useState(false);
    const [linking, setLinking] = useState(false);
    const [selectedHashtagForLink, setSelectedHashtagForLink] = useState(null);
    const [hashtagSearchResults, setHashtagSearchResults] = useState([]);

    const fetchTests = async () => {
        try {
            setLoadingTests(true);
            const data = await adminGetAllTests();
            if (data && data.tests && Array.isArray(data.tests)) {
                setTests(data.tests);
            } else {
                setTests([]);
            }
        } catch (err) {
            console.error('Error fetching tests:', err);
        } finally {
            setLoadingTests(false);
        }
    };

    const fetchTestHashtags = async (testId) => {
        try {
            setLoadingTestHashtags(true);
            const data = await adminGetTestHashtags(testId);
            if (Array.isArray(data)) {
                setTestHashtags(data);
            } else {
                setTestHashtags([]);
            }
        } catch (err) {
            console.error('Error fetching test hashtags:', err);
        } finally {
            setLoadingTestHashtags(false);
        }
    };

    const linkHashtagToTest = async () => {
        if (!testIdentifierInput.trim()) {
            alert('Test ID yoki Test test_id kiriting');
            return;
        }

        if (!selectedHashtagForLink) {
            alert('Hashtagni tanlang');
            return;
        }

        setLinking(true);
        try {
            const result = await adminAddHashtagToTest(testIdentifierInput.trim(), selectedHashtagForLink.id, true);
            if (result.status === true) {
                await fetchTestHashtags(testIdentifierInput.trim());
                setSelectedHashtagForLink(null);
                setHashtagNameInput('');
                setHashtagSearchResults([]);
                alert('Hashtag testga muvaffaqiyatli qo\'shildi');
            } else {
                alert(result.message || 'Hashtag qo\'shishda xatolik');
            }
        } catch (err) {
            alert('Server bilan bog\'lanishda xatolik');
            console.error('Error linking hashtag:', err);
        } finally {
            setLinking(false);
        }
    };

    const unlinkHashtagFromTest = async (hashtagId) => {
        if (!testIdentifierInput.trim()) return;

        try {
            const result = await adminRemoveHashtagFromTest(testIdentifierInput.trim(), hashtagId);
            if (result.status === true) {
                await fetchTestHashtags(testIdentifierInput.trim());
            } else {
                alert(result.message || 'Hashtag olib tashlashda xatolik');
            }
        } catch (err) {
            alert('Server bilan bog\'lanishda xatolik');
            console.error('Error unlinking hashtag:', err);
        }
    };

    const searchHashtags = (searchTerm) => {
        if (!searchTerm.trim()) {
            setHashtagSearchResults([]);
            setSelectedHashtagForLink(null);
            return;
        }
        
        const results = hashtags.filter(h => 
            h.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
        setHashtagSearchResults(results);
    };

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        if (testIdentifierInput.trim()) {
            fetchTestHashtags(testIdentifierInput.trim());
        } else {
            setTestHashtags([]);
        }
    }, [testIdentifierInput]);

    return (
        <div className="panel" style={{ marginBottom: '24px' }}>
            <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                    Testga Hashtag Bog'lash
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Test Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                            Test (ID yoki test_id)
                        </label>
                        <input
                            type="text"
                            placeholder="Test ID yoki test_id kiriting (masalan: 123)"
                            value={testIdentifierInput}
                            onChange={(e) => setTestIdentifierInput(e.target.value)}
                            disabled={loadingTests}
                            style={{
                                padding: '14px 18px',
                                border: '2px solid var(--admin-input-border)',
                                borderRadius: '12px',
                                background: 'var(--admin-input-bg)',
                                color: 'var(--text)',
                                fontSize: '14px'
                            }}
                        />
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                            Backend avval ID bilan, keyin test_id bilan qidiradi
                        </p>
                    </div>

                    {/* Hashtag Selection - Search */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                            Hashtag qidirish
                        </label>
                        <input
                            type="text"
                            placeholder="Hashtag nomi yoki ID kiriting (masalan: math yoki 1)"
                            value={hashtagNameInput}
                            onChange={(e) => {
                                setHashtagNameInput(e.target.value);
                                searchHashtags(e.target.value);
                            }}
                            disabled={loadingTests}
                            style={{
                                padding: '14px 18px',
                                border: '2px solid var(--admin-input-border)',
                                borderRadius: '12px',
                                background: 'var(--admin-input-bg)',
                                color: 'var(--text)',
                                fontSize: '14px'
                            }}
                        />
                        
                        {/* Search results */}
                        {hashtagSearchResults.length > 0 && (
                            <div style={{ 
                                position: 'absolute', 
                                background: 'var(--admin-card-bg)', 
                                border: '1px solid var(--admin-card-border)', 
                                borderRadius: '8px', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {hashtagSearchResults.map((h) => (
                                    <div
                                        key={h.id}
                                        onClick={() => {
                                            setSelectedHashtagForLink(h);
                                            setHashtagNameInput(h.name);
                                            setHashtagSearchResults([]);
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--admin-table-border)',
                                            ':hover': {
                                                background: 'var(--admin-sidebar-hover)'
                                            }
                                        }}
                                    >
                                        <span className="badge badge--blue">#{h.name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                            ID: {h.id}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Hashtag Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                            Tanlangan hashtag
                        </label>
                        {selectedHashtagForLink ? (
                            <div style={{
                                padding: '14px 18px',
                                border: '2px solid var(--admin-input-border)',
                                borderRadius: '12px',
                                background: 'var(--admin-button-primary)',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500
                            }}>
                                #{selectedHashtagForLink.name}
                                <button
                                    onClick={() => {
                                        setSelectedHashtagForLink(null);
                                        setHashtagNameInput('');
                                        setHashtagSearchResults([]);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        padding: 0,
                                        lineHeight: 1,
                                        marginLeft: 'auto'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                padding: '14px 18px',
                                border: '2px solid var(--admin-input-border)',
                                borderRadius: '12px',
                                background: 'var(--admin-input-bg)',
                                color: 'var(--text-muted)',
                                fontSize: '14px'
                            }}>
                                Hashtag tanlanmagan
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            className="btn btn--primary"
                            onClick={linkHashtagToTest}
                            disabled={linking || !testIdentifierInput.trim() || !selectedHashtagForLink}
                        >
                            {linking ? 'Bog\'lanmoqda...' : 'Bog\'lash'}
                        </button>
                    </div>
                </div>

                {/* Test's Current Hashtags */}
                {testIdentifierInput.trim() && (
                    <div className="panel">
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                                Testning Hashtaglari (ID: {testIdentifierInput})
                            </h3>
                            
                            {loadingTestHashtags ? (
                                <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
                            ) : testHashtags.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {testHashtags.map((th) => (
                                        <div
                                            key={th.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 16px',
                                                background: 'var(--admin-button-primary)',
                                                borderRadius: '20px',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 500
                                            }}
                                        >
                                            <span>#{th.name}</span>
                                            <button
                                                onClick={() => unlinkHashtagFromTest(th.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    padding: 0,
                                                    lineHeight: 1
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>Hashtaglar topilmadi</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}