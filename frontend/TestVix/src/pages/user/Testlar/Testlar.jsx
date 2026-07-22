// import React from 'react'

import { useState, useCallback } from "react"
import HeadTitle from "./HeadTitle"
import CateCard from "./CateCard"
import Message from "../../../components/ui/Message";
import { categor } from "./data";

export default function Testlar() {
    const [categors, setCategors] = useState(categor)
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');


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
                categors?.map((item, inx) => (
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
            <div className="categors-div">
                <div className="categor-title">
                    <h2>Boshqalar </h2>
                </div>
                <CateCard handleCopyId={handleCopyId} steps_class={'steps-grid'}></CateCard>
            </div>
        </div>
    )
}

