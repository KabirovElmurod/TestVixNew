import { useState, useEffect } from 'react';
import { adminGetStats } from '../../../api/request_testlar';
import { mockUsers, mockTests, mockQuestions, mockVariants, mockHashtags, mockResults } from '../data/mockData';
import StatCard from '../components/StatCard';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminGetStats();
                if (data && !data.status) {
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    
    const activeUsers = mockUsers.filter((u) => u.is_active).length;
    const publicTests = stats?.public_tests || mockTests.filter((t) => t.public).length;
    const totalTests = stats?.total_tests || mockTests.length;
    const fanCounts = mockTests.reduce((acc, t) => {
        acc[t.fan] = (acc[t.fan] || 0) + 1;
        return acc;
    }, {});
    const maxFan = Math.max(...Object.values(fanCounts), 1); // Avoid division by zero
    const recentTests = [...mockTests].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 5);
    const userById = Object.fromEntries(mockUsers.map((u) => [u.id, u]));
    
    // Additional statistics
    const finishedResults = mockResults.filter((r) => r.isfinish).length;
    const averageScore = mockResults.length > 0 
        ? Math.round(mockResults.reduce((acc, r) => acc + (r.true_son / r.sum_son) * 100, 0) / mockResults.length)
        : 0;
    const trueVariants = mockVariants.filter((v) => v.is_true).length;

    return (
        <div className="dashboard">
            <div className="dashboard__stats">
                <StatCard icon="👥" label="Jami foydalanuvchilar" value={stats?.total_users || mockUsers.length} trend={`${activeUsers} ta faol`} accent="blue" />
                <StatCard icon="📝" label="Jami testlar" value={totalTests} trend={`${publicTests} ta ochiq`} accent="violet" />
                <StatCard icon="❓" label="Savollar" value={mockQuestions.length} trend={`${mockVariants.length} ta variant`} accent="green" />
                <StatCard icon="📊" label="Natijalar" value={mockResults.length} trend={`${finishedResults} ta tugatilgan`} accent="orange" />
            </div>

            <div className="dashboard__stats">
                <StatCard icon="#️⃣" label="Hashtaglar" value={mockHashtags.length} trend="kategoriya" accent="blue" />
                <StatCard icon="✅" label="O\'rtacha ball" value={`${averageScore}%`} trend="muvaffaqiyat darajasi" accent="violet" />
                <StatCard icon="📚" label="Fanlar" value={Object.keys(fanCounts).length} trend="turli yonalishlar" accent="green" />
                <StatCard icon="🛡️" label="Adminlar" value={mockUsers.filter((u) => u.is_staff).length} trend="staff huquqli" accent="orange" />
            </div>

            <div className="dashboard__grid">
                <section className="panel">
                    <div className="panel__header">
                        <h2 className="panel__title">Fanlar boyicha testlar</h2>
                    </div>
                    <div className="bar-chart">
                        {Object.entries(fanCounts).map(([fan, count]) => (
                            <div className="bar-chart__row" key={fan}>
                                <span className="bar-chart__label">{fan}</span>
                                <div className="bar-chart__track">
                                    <div
                                        className="bar-chart__fill"
                                        style={{ width: `${(count / maxFan) * 100}%` }}
                                    />
                                </div>
                                <span className="bar-chart__count">{count}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <h2 className="panel__title">So\'nggi testlar</h2>
                    </div>
                    <ul className="recent-list">
                        {recentTests.map((t) => (
                            <li key={t.id}>
                                <div className="recent-list__main">
                                    <p className="recent-list__name">{t.nom}</p>
                                    <p className="recent-list__meta">
                                        {t.fan} · @{userById[t.user_id]?.username}
                                    </p>
                                </div>
                                <span className={`badge ${t.public ? 'badge--green' : 'badge--gray'}`}>
                                    {t.public ? 'Ochiq' : 'Yopiq'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <h2 className="panel__title">So'nggi natijalar</h2>
                    </div>
                    <ul className="recent-list">
                        {[...mockResults].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 5).map((r) => (
                            <li key={r.id}>
                                <div className="recent-list__main">
                                    <p className="recent-list__name">@{userById[r.user_id]?.username ?? '—'}</p>
                                    <p className="recent-list__meta">
                                        {r.true_son}/{r.sum_son} to'g'ri · {r.created}
                                    </p>
                                </div>
                                <span className={`badge ${r.isfinish ? 'badge--green' : 'badge--gray'}`}>
                                    {r.isfinish ? 'Tugatilgan' : 'Davom etmoqda'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <h2 className="panel__title">Mashhur hashtaglar</h2>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {mockHashtags.slice(0, 8).map((tag) => (
                            <span key={tag.id} className="badge badge--blue" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}