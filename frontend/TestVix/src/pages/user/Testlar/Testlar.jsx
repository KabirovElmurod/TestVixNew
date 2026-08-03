// import React from 'react'

import { useState, useCallback, useEffect } from "react"
// import HeadTitle from "./HeadTitle"
import CateCard from "./CateCard"
import Message from "../../../components/ui/Message";
import { categor, test_data } from "./data";
// import { getPublicTest } from "../../../api/request_testlar";

export default function Testlar() {
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
            {/* <HeadTitle search={search} setSearch={setSearch} /> */}
            {
                categor?.map((item, inx) => (
                    (
                        <div className="categors-div" key={inx}>
                            <div className="categor-title">
                                <h2>{item} </h2>
                                <button>
                                    <span>Yana</span>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                            <CateCard handleCopyId={handleCopyId} steps_class={'steps-flex'}></CateCard>
                        </div>
                    )
                ))

            }
            {
                test_data ? (
                    <div className="categors-div">
                        {/* <div className="categor-title">
                            <h2>Boshqalar </h2>
                        </div> */}
                        <CateCard handleCopyId={handleCopyId} steps_class={'steps-grid'}></CateCard>
                    </div>
                ) : null
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

