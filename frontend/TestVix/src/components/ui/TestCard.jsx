import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchCon } from '../../context/SearchContext'
import { human_time } from '../../lib/func'

export default function TestCard({ test, handleCopyId }) {
    const navigate = useNavigate()
    const { searchText, setSearchText } = useSearchCon()
    const handleSearchTag = (tag) => {
        console.log('hash=>', tag);

        setSearchText(
            {
                'text': tag,
                'submit': 1
            }
        )
    }
    // const human_time = (timer) => {
    //     let t = ''
    //     hour = timer / 3600
    //     min = (timer - hour * 3600) / 60
    //     second = timer
    // }
    // function human_time(totalSeconds) {
    //     if (totalSeconds < 1) return "0 seconds";

    //     // const days = Math.floor(totalSeconds / 86400);
    //     const hours = Math.floor((totalSeconds % 86400) / 3600);
    //     const minutes = Math.floor((totalSeconds % 3600) / 60);
    //     const seconds = totalSeconds % 60;

    //     const parts = [];
    //     // if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    //     if (hours > 0) parts.push(`${hours} soat`);
    //     if (minutes > 0) parts.push(`${minutes} minut`);
    //     if (seconds > 0) parts.push(`${seconds} sekund`);

    //     return parts.join(' ');
    // }
    return (

        <div key={test.test_id} className="test-card" id={`test_card_id_${test.id}`}>
            <div className="test-card-content">
                <div className="card-top">
                    <span
                        className="card-id"
                        onClick={() => handleCopyId(test.test_id)}
                        style={{ cursor: 'pointer' }}
                        title="Nusxa"
                    >
                        ID: {test.test_id}
                    </span>

                </div>

                <h3 className="card-title">{test.nom}</h3>
                <p className="card-desc">{test.tavsif}</p>

                <span className="card-badge">{test.fan}</span>

                <div className="card-info">

                    <span><i className="bi bi-clock"></i> {test.istime ? human_time(test.time) : <i className="bi bi-infinity"></i>}</span>
                    <span><i className="bi bi-question-circle"></i> {test.savollar_soni} savol</span>
                    <span><i className="bi bi-star-fill" style={{ color: '#fbbf24' }}></i> 4.5</span>
                    <span><i className="bi bi-calendar3"></i> {test.created}</span>
                </div>
            </div>

            <div className="card-footer">
                <div className="card-tags">
                    {/* <span className="card-tag">#math</span>
                  <span className="card-tag">#engilish</span>
                  <span className="card-tag">#algebra</span> */}
                    {test.hashtag_names && test.hashtag_names.length > 0 ? (
                        test.hashtag_names.map((tag, idx) => (
                            <span key={idx} className="card-tag" onClick={() => handleSearchTag(tag)}>{'#'}{tag}</span>
                        ))
                    ) : null}
                </div>
                <button className="icon-button" onClick={() => {
                    localStorage.setItem('test', JSON.stringify(test))
                    navigate(`/test/show/${test.id}/${test.test_id}/${test.hash_url}`)
                }}>
                    Ko'rish <i className="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>

    )
}
