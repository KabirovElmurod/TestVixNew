import { useState, useEffect, useCallback, useRef } from 'react'
// import { test_data } from './data'
import TestCard from '../../../components/ui/TestCard'
import { getPublicTest, getSearchTest } from "../../../api/request_testlar";
import { useSearchCon } from '../../../context/SearchContext';

function CateCard({ handleCopyId, steps_class, tests, category, is_cate, last_score, last_id }) {
    const { searchText, setSearchText, searchTest, setSearchTest } = useSearchCon()
    const [testlar, setTestlar] = useState(tests);
    const [lastScore, setLastScore] = useState(last_score);
    const [lastId, setLastId] = useState(last_id)
    const [categor, setCategor] = useState(category)
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loading_ref = useRef(false);
    const sliderRef = useRef(null);
    const fetchTests = useCallback(async (score, lst_id) => {
        if (!hasMore || loading_ref.current) return;

        loading_ref.current = true;
        setLoading(true);

        try {
            console.log('fetchTests called with score:', score);
            let data = {}
            let value = categor
            data['last_id'] = last_id
            if (!value || value === '') {
                return
            }
            data['last_score'] = last_score
            data['text'] = value;
            if (typeof value === "number") {
                data['type'] = "number";
            } else if (typeof value === "string" && value.length === 20 && !value.includes(' ')) {
                data['type'] = "key";
            } else if (typeof value === "string") {
                data['type'] = "string";
            }
            const res = await getSearchTest(data);

            console.log('res =>', res);

            if (res.results?.length > 0) {
                setTestlar(prev => [
                    ...prev,
                    ...res.results
                ]);

                if (res.last_score) {
                    setLastScore(res.last_score);
                    setLastId(res.last_id);
                    setHasMore(true);
                } else {
                    setHasMore(false);
                    setLastScore(null);
                }
            } else {
                setHasMore(false);
                setLastScore(null);
            }

        } catch (error) {
            console.error("Testlarni yuklashda xatolik:", error);
        } finally {
            loading_ref.current = false;
            setLoading(false);
        }
    }, [hasMore]);

    const fetchTests_ver = useCallback(async (score) => {
        console.log('fetchTests called with score:', score);
        if (loading || !hasMore) return;


        setLoading(true);
        try {
            const res = await getPublicTest({ 'last_score': Number(score), 'last_id': lastId });
            console.log('res=>', res);
            if (res.results.length > 0) {
                setTestlar(prev => [
                    ...prev,
                    ...res.results
                ])
                if (!res.last_score || !res.last_id) {
                    setHasMore(false)
                    setLastScore(false)
                }
                // setTestlar(prev => [...prev, ...res.results]);
                // setLastScore(res.last_score);
            } else {
                setHasMore(false); // Boshqa ma'lumot qolmadi
            }
        } catch (error) {
            console.error("Testlarni yuklashda xatolik:", error);
        } finally {
            setLoading(false);
        }
        // setLoading(false);

    }, [loading, hasMore]);

    // useEffect(() => {
    //     // Komponent ilk marta yuklanganda testlarni olamiz
    //     console.log('searchTest=>', searchTest);
    //     console.log('searchText=>', searchText.text);
    //     if (searchTest && searchText.text) {
    //         return
    //     }
    //     fetchTests(0);
    // }, []); // Bo'sh massiv faqat bir marta ishga tushishini ta'minlaydi

    useEffect(() => {
        const handleScroll = () => {
            // Oynaning pastki qismiga 300px qolganda yangi ma'lumotlarni yuklash
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
                if (hasMore && !loading && lastScore && loading_ref.current === false) {
                    // setLoading(true);
                    fetchTests_ver(lastScore, lastId);
                }
            }
        };

        if (is_cate) {
            return
        }
        console.log('sa=>', category);


        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [loading, hasMore, lastScore, fetchTests_ver]);

    const handleHorizontalScroll = (e) => {
        const el = e.currentTarget;

        const remaining =
            el.scrollWidth -
            el.scrollLeft -
            el.clientWidth;

        if (
            remaining <= 300 &&
            hasMore &&
            !loading_ref.current
        ) {
            // setLoading(true)
            fetchTests(lastScore, lastId);
        }
    };

    return (
        <div>
            {(
                <div
                    ref={sliderRef}
                    className={steps_class}
                    onScroll={handleHorizontalScroll}
                >
                    {testlar?.map(test => (
                        <TestCard
                            key={test.test_id}
                            test={test}
                            handleCopyId={handleCopyId}
                        />
                    ))}
                    {
                        is_cate ? (
                            hasMore && loading ? (
                                <div className='loading_div' style={{ 'justifyContent': 'space-between' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : null
                        ) : null

                    }
                </div>
            )
            }
            {
                is_cate ? null : (

                    hasMore && loading ? (
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) :
                        (

                            hasMore && !loading ? (null) : (
                                <div>
                                    <p>
                                        <b>Boshqa natija yo'q</b>
                                    </p>
                                </div>

                            )

                        )
                )
            }


        </div>
    )
}

export default CateCard;
