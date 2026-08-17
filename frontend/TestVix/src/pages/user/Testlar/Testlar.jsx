// import React from 'react'

import { useState, useCallback, useEffect } from "react"
// import HeadTitle from "./HeadTitle"
import CateCard from "./CateCard"
import Message from "../../../components/ui/Message";
// import { categor, test_data } from "./data";
import { useSearchCon } from "../../../context/SearchContext";
import { getPublicTest } from "../../../api/request_testlar";
// import { getPublicTest } from "../../../api/request_testlar";

export default function Testlar() {
    const { searchText, setSearchText, searchTest, setSearchTest, test_cate, setTestCate } = useSearchCon()
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // const [testlar, setTestlar] = useState([])
    // useEffect(() => {
    //     async function getTest() {
    //         const res = await getPublicTest();
    //         console.log('test=>', res);

    //         setTestlar(res);
    //     }
    //     getTest()
    // }, [])
    const [categor, setCategor] = useState([])
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
            if (res.length > 0) {
                setCategor(res.at(-1).cates)
                console.log('res[-1]=>', res.at(-1));
                setTestCate(
                    res
                )
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
        setLoading(false);

    }, [loading, hasMore]);

    useEffect(() => {
        // Komponent ilk marta yuklanganda testlarni olamiz
        console.log('searchTest=>', searchTest);
        console.log('searchText=>', searchText.text);
        // if (searchTest && searchText.text) {
        //     return
        // }
        fetchTests(0);
    }, []); // Bo'sh massiv faqat bir marta ishga tushishini ta'minlaydi

    // useEffect(() => {
    //     const handleScroll = () => {
    //         // Oynaning pastki qismiga 300px qolganda yangi ma'lumotlarni yuklash
    //         if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
    //             if (hasMore && !loading && lastScore) {
    //                 // setLoading(true);
    //                 fetchTests(lastScore);
    //             }
    //         }
    //     };

    //     window.addEventListener('scroll', handleScroll);
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //     }
    // }, [loading, hasMore, lastScore, fetchTests]);


    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setMessage(`Test ID (${id}) nusxalandi!`);
        setMessageType('success');
    }
    const handleCloseMessage = useCallback(() => {
        setMessage('');
    }, []);

    return (
        <div className="testlar">
            <Message
                type={messageType}
                message={message}
                onClose={handleCloseMessage}
                duration={3000}
            />
            {
                test_cate?.map((item, inx) => (
                    (
                        <div className="categors-div" key={`cate-${inx}`}>
                            <div className="categor-title">
                                <h2>{item.category} </h2>
                                {
                                    item.is_category ? (
                                        <button>
                                            <span>Yana</span>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    ) : null
                                }
                            </div>
                            {

                                <CateCard key={`cate-${inx}`} handleCopyId={handleCopyId} steps_class={item.is_category ? 'steps-flex' : 'steps-grid'} tests={item.is_category ? item.results.results : item.results} category={item.category} is_cate={item.is_category} last_score={item.is_category ? item.results.last_score : item.last_score} last_id={item.is_category ? item.results.last_id : item.last_id}></CateCard>
                                // test_cate?.map((cate, index) => (
                                //     item.cate === cate.category ? (
                                //     ) : null

                                // ))
                            }
                            {/* <CateCard handleCopyId={handleCopyId} steps_class={item.is_category ? 'steps-flex' : 'steps-grid'} tests={item.results}></CateCard> */}
                        </div>
                    )
                ))

            }
            {
                // test_data ? (
                //     <div className="categors-div">
                //         {/* <div className="categor-title">
                //             <h2>Boshqalar </h2>
                //         </div> */}
                //         <CateCard handleCopyId={handleCopyId} steps_class={'steps-grid'} tests={test_data}></CateCard>
                //     </div>
                // ) : null
            }
            {/* {
                testlar ? (
                    <div>
                        <CateCard handleCopyId={handleCopyId} steps_class={'steps-grid'}></CateCard>
                    </div>
                ) : null
            } */}

        </div>
    )
}

