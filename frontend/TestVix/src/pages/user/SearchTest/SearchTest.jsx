// import React from 'react'

import { useState, useCallback, useEffect, useRef } from "react"
// import HeadTitle from "./HeadTitle"
import CateCard from "./CateCard"
import Message from "../../../components/ui/Message";
// import { categor, test_data } from "./data";
import { useSearchCon } from "../../../context/SearchContext";
import { getPublicTest, getSearchTest } from "../../../api/request_testlar";
// import { getPublicTest } from "../../../api/request_testlar";

export default function SearchTest() {
    const { searchText, setSearchText, searchTest, setSearchTest, test_cate, setTestCate } = useSearchCon()
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    // console.log(searchTest);

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
    const [lastScore, setLastScore] = useState(searchTest.last_score);
    const [lastSearchScore, setLastSearchScore] = useState(searchTest.last);
    const [lastId, setLastId] = useState(searchTest.last_id);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);


    const handleSearchSubmit = useCallback(async (last_score, last_id) => {
        // if (e) e.preventDefault()
        let value = searchText.text
        // console.log('searchText=>', searchText);
        // console.log('searchTest=>;
        if (loading) return;
        setLoading(true);
        let data = {}
        data['last_id'] = last_id
        if (!value || value === '') {
            return
        }
        data['last_score'] = last_score
        data['last'] = lastSearchScore
        if (typeof value === "number") {
            data['text'] = value;
            data['type'] = "number";
        } else if (typeof value === "string" && value.length === 20 && !value.includes(' ')) {
            data['text'] = value;
            data['type'] = "key";
        } else if (typeof value === "string") {
            data['text'] = value;
            data['type'] = "string";
        }
        console.log('dataeeee=>', data);

        let res = await getSearchTest(data)
        console.log('res=>', res);
        if (res.last_score !== null) {
            setLastScore(res.last_score)
            setLastId(res.last_id)
            setLastSearchScore(res.last)
            setHasMore(true);
        }
        else {
            setHasMore(false); // Boshqa ma'lumot qolmadi
            setLastScore(null);
        }
        // setLastScore(res.last_score)
        setSearchTest(prev => ({
            ...res,
            results: [...prev.results, ...res.results]
        }));
        setLoading(false);
        // navigate('/search')

    }, [loading, hasMore, searchText]);
    // const fetchTests = useCallback(async (score) => { }, [loading, hasMore]);

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
        setLastScore(searchTest.last_score)
        setLastId(searchTest.last_id)
        console.log('last_id=>', searchTest.last_id);

        if (searchTest.last_score !== null) {
            setHasMore(true);
        }

    }, [searchTest]);

    // useEffect(() => {
    //     console.log('ssss=>', searchText);

    // }, [searchText])
    const isFetching = useRef(false);

    const checkNeedMore = () => {
        const isNearBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 300;

        const noScrollNeeded =
            document.documentElement.scrollHeight <= window.innerHeight;

        if (
            (isNearBottom || noScrollNeeded) &&
            hasMore &&
            !isFetching.current &&
            lastScore
        ) {
            isFetching.current = true;
            console.log('sssss=>', lastId);

            handleSearchSubmit(lastScore, lastId).finally(() => {
                isFetching.current = false;
            });
        }
    };

    useEffect(() => {
        let check = checkNeedMore(); // Sahifa ochilganda yoki natijalar o'zgarganda tekshir
        if (check) return
        window.addEventListener("scroll", checkNeedMore);

        return () => {
            window.removeEventListener("scroll", checkNeedMore);
        };
    }, [hasMore, loading, lastScore, handleSearchSubmit]);

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setMessage(`Test ID(${id}) nusxalandi!`);
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
                searchTest ? (
                    <CateCard key={`cate - ${searchText.text}`} handleCopyId={handleCopyId} steps_class={'steps-grid'} tests={searchTest.results}></CateCard>
                ) :
                    null

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

