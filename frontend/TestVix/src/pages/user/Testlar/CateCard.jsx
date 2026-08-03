import { useState, useEffect, useCallback } from 'react'
// import { test_data } from './data'
import TestCard from '../../../components/ui/TestCard'
import { getPublicTest } from "../../../api/request_testlar";

function CateCard({ handleCopyId, steps_class }) {
    const [testlar, setTestlar] = useState([]);
    const [lastScore, setLastScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchTests = useCallback(async (score) => {
        console.log('fetchTests called with score:', score);
        if (loading || !hasMore) return;

        setTimeout(() => {
            setLoading(false);
        }, 10000); // 10 soniya kutish
        setInterval(() => {
            setLoading(false);
        }, 10000); // 1 soniya kutish
        setLoading(true);
        try {
            const res = await getPublicTest({ 'last_score': Number(score) });
            console.log('res=>', res);
            if (res.results && res.results.length > 0) {
                setTestlar(prev => [...prev, ...res.results]);
                setLastScore(res.last_score);
            } else {
                setHasMore(false); // Boshqa ma'lumot qolmadi
            }
        } catch (error) {
            console.error("Testlarni yuklashda xatolik:", error);
        } finally {
            setLoading(false);
        }
        setLoading(false);

    }, [loading, hasMore]);

    useEffect(() => {
        // Komponent ilk marta yuklanganda testlarni olamiz
        fetchTests(0);
    }, []); // Bo'sh massiv faqat bir marta ishga tushishini ta'minlaydi

    useEffect(() => {
        const handleScroll = () => {
            // Oynaning pastki qismiga 300px qolganda yangi ma'lumotlarni yuklash
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
                if (hasMore && !loading && lastScore) {
                    // setLoading(true);
                    fetchTests(lastScore);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [loading, hasMore, lastScore, fetchTests]);

    return (
        <div>
            <div className={steps_class}>
                {testlar?.map((test) => (
                    <TestCard test={test} key={test.test_id} handleCopyId={handleCopyId}></TestCard>
                ))}
            </div>
            {
                hasMore && loading ? (
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                ) :
                    (

                        hasMore && !loading ? (null) : (
                            <div>
                                <p>
                                    <b>Testlar tugadi</b>
                                </p>
                            </div>

                        )

                    )
            }

        </div>
    )
}

export default CateCard;
