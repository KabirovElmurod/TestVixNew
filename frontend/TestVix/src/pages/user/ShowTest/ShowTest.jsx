import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const getInitials = (name) => {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

export default function ShowTest() {
    const navigate = useNavigate()

    // useEffect(() => {
    //     return () => {
    //         navigate(-1)
    //     }
    // }, [])

    const [hoveredStar, setHoveredStar] = useState(0)
    const [selectedStar, setSelectedStar] = useState(0)
    const [commentText, setCommentText] = useState('')
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [expandedReplies, setExpandedReplies] = useState({})
    const [comments, setComments] = useState([
        {
            id: 1,
            author: 'Ali Valiyev',
            time: '2 soat oldin',
            text: 'Bu test juda zo\'r tuzilgan ekan. Ayniqsa oxirgi savollar real imtihonga juda yaqin.',
            likes: 24,
            dislikes: 2,
            reaction: null,
            replies: [
                {
                    id: 11,
                    author: 'Dilshod',
                    time: '1 soat oldin',
                    text: 'Ha, ayniqsa matematika bo\'limi juda yaxshi chiqibdi.',
                    likes: 6,
                    dislikes: 0,
                    reaction: null,
                },
            ],
        },
        {
            id: 2,
            author: 'Nodirbek',
            time: 'Kecha',
            text: '3-savolda javob kalitida xatolik bor deb o\'ylayman. Tekshirib ko\'rsangiz yaxshi bo\'lardi.',
            likes: 8,
            dislikes: 1,
            reaction: null,
            replies: [],
        },
        {
            id: 3,
            author: 'Sarvar',
            time: '3 kun oldin',
            text: 'Rahmat! Shu kabi testlar yana ko\'proq qo\'shhilsa juda yaxshi bo\'lardi.',
            likes: 14,
            dislikes: 0,
            reaction: null,
            replies: [],
        },
    ])

    const [star_each_much, setStarEachMuch] = useState([5, 4, 3, 2, 1])
    const star_much = star_each_much.reduce((sum, item) => sum + item, 0);
    const star_agv = (star_each_much.reduce((sum, item, index) => sum + item * (5 - index), 0) / star_much).toFixed(1)
    const displayStarCount = hoveredStar || selectedStar
    const [animate, setAnimate] = useState(false);
    const totalCommentCount = comments.reduce((sum, comment) => sum + 1 + comment.replies.length, 0)

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);




    // const handle

    const handleCancel = () => {
        setSelectedStar(0)
        setHoveredStar(0)
    }

    const handleChoise = (star) => {
        setSelectedStar(star)
        let much = [...star_each_much]

        for (let i = 0; i < 5; i++) {
            if (i === 5 - star) {
                much[i] += 1
            }
        }

        setStarEachMuch(much)
    }

    const handleCommentSubmit = () => {
        const trimmed = commentText.trim()

        if (!trimmed) return

        const newComment = {
            id: Date.now(),
            author: 'Siz',
            time: 'hozir',
            text: trimmed,
            likes: 0,
            dislikes: 0,
            reaction: null,
            replies: [],
        }

        setComments((prev) => [newComment, ...prev])
        setCommentText('')
    }

    const toggleReaction = (commentId, replyId = null, type) => {
        setComments((prev) =>
            prev.map((comment) => {
                if (comment.id !== commentId) return comment

                if (replyId) {
                    return {
                        ...comment,
                        replies: comment.replies.map((reply) => {
                            if (reply.id !== replyId) return reply

                            const nextReaction = reply.reaction === type ? null : type

                            return {
                                ...reply,
                                reaction: nextReaction,
                                likes: reply.likes + (reply.reaction === 'like' ? -1 : nextReaction === 'like' ? 1 : 0),
                                dislikes: reply.dislikes + (reply.reaction === 'dislike' ? -1 : nextReaction === 'dislike' ? 1 : 0),
                            }
                        }),
                    }
                }

                const nextReaction = comment.reaction === type ? null : type

                return {
                    ...comment,
                    reaction: nextReaction,
                    likes: comment.likes + (comment.reaction === 'like' ? -1 : nextReaction === 'like' ? 1 : 0),
                    dislikes: comment.dislikes + (comment.reaction === 'dislike' ? -1 : nextReaction === 'dislike' ? 1 : 0),
                }
            })
        )
    }

    const toggleReplies = (commentId) => {
        setExpandedReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }))
    }

    const handleReplySubmit = (commentId) => {
        const trimmed = replyText.trim()

        if (!trimmed || !replyingTo) return

        const newReply = {
            id: Date.now(),
            author: 'Siz',
            time: 'hozir',
            text: trimmed,
            likes: 0,
            dislikes: 0,
            reaction: null,
            replyTo: null,
        }

        setComments((prev) => {
            const targetComment = prev.find((item) => item.id === commentId)
            const targetReply = replyingTo.replyId
                ? targetComment?.replies.find((item) => item.id === replyingTo.replyId)
                : null

            return prev.map((comment) => {
                if (comment.id !== commentId) return comment

                return {
                    ...comment,
                    replies: [
                        ...comment.replies,
                        {
                            ...newReply,
                            replyTo: targetReply ? targetReply.author : null,
                        },
                    ],
                }
            })
        })
        setReplyText('')
        setReplyingTo(null)
    }

    const handleStartNav = () => {
        navigate('/test/start/14/')
    }

    return (
        <div className='show_test_cont'>
            <div className='team_star_div'>
                <div className='team_div'>
                    {/* Team */}
                    <div className='id_vis_div'>
                        <div className='id_div'>
                            <i className='bi bi-globe'></i>
                            <p>
                                ID: 1234
                            </p>
                        </div>
                        <div className='vis_div'>
                            <span>
                                <i className='bi bi-share-fill'></i>
                            </span>
                        </div>
                    </div>
                    <div className='nom_fan_div'>
                        <h2>
                            Matematika 1-sinf
                        </h2>
                        <p>
                            Matematika fan
                        </p>
                    </div>
                    <div className='user_sub_div'>
                        <div className='user_div'>
                            {/* <img src="" alt="" className=''/> */}
                            <i className='bi bi-person'></i>
                            <div>
                                <strong>user</strong>
                                <p>100 obuna</p>
                            </div>
                        </div>
                        <div className='sub_l_d_div'>
                            <button>
                                Obuna
                            </button>
                            <div className='like_dis_div'>
                                <div>
                                    <i className='bi bi-hand-thumbs-up like'></i>
                                    <span>45</span>
                                </div>
                                <div>
                                    <i className='bi bi-hand-thumbs-down dislike'></i>
                                    <span>10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='content_div'>
                        <div className='content_div_div'>
                            <div>
                                <i className='bi bi-book'></i>
                                <span>Savollar</span>
                                <p>2</p>
                            </div>
                            <div>
                                <i className='bi bi-clock'></i>
                                <span>Vaqt</span>
                                <p>2</p>
                            </div>
                        </div>
                        <div className='content_div_div'>
                            <div>
                                <i className='bi bi-star'></i>
                                <span>Baho</span>
                                <p>4.5</p>
                            </div>
                            <div>
                                <i className='bi bi-people'></i>
                                <span>Foydalanuchi</span>
                                <p>1.2K</p>
                            </div>
                        </div>
                    </div>

                    <div className='start_div'>
                        <button className='btn' onClick={handleStartNav}>
                            Boshlashsss
                        </button>
                    </div>

                    <div className='tavsif_div'>
                        <p>
                            Tavsif
                        </p>
                    </div>
                    <div className='hashtag_div'>
                        <span>#matematika</span>
                        <span>#matematika</span>
                        <span>#matematika</span>
                        <span>#matematika</span>
                    </div>
                </div>
                <div className='star_div'>
                    <div className='star_content_div'>
                        <div className='star_much_div'>
                            <h2>
                                {star_agv}
                            </h2>
                            <div>
                                <span>
                                    <i className='bi bi-star'></i>
                                    <i className='bi bi-star'></i>
                                    <i className='bi bi-star'></i>
                                    <i className='bi bi-star'></i>
                                    <i className='bi bi-star'></i>
                                </span>
                                <span style={{ width: `${star_agv * 100 / 5}%` }}>
                                    <i className='bi bi-star-fill'></i>
                                    <i className='bi bi-star-fill'></i>
                                    <i className='bi bi-star-fill'></i>
                                    <i className='bi bi-star-fill'></i>
                                    <i className='bi bi-star-fill'></i>
                                </span>
                            </div>
                            <p>
                                {star_much}
                            </p>
                        </div>

                        <div className='star_each_much'>
                            {
                                star_each_much.map((item, index) => {
                                    return (
                                        <div key={index} className='star_each'>
                                            <p>{5 - index} </p>
                                            <div>
                                                <span style={{ width: animate ? `${item * 100 / star_much}%` : '0%' }}></span>
                                            </div>
                                            <p>{item}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className='star_choice'>
                        <div
                            className='star_much_choice'
                            onMouseLeave={() => setHoveredStar(0)}
                        >
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = star <= displayStarCount

                                return (
                                    <i
                                        key={star}
                                        className={`bi ${isFilled ? 'bi-star-fill' : 'bi-star'} star_icon ${isFilled ? 'active' : ''}`}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onClick={() => handleChoise(star)}
                                    ></i>
                                )
                            })}
                        </div>
                        <button onClick={handleCancel}>Bekor qilish</button>
                    </div>
                </div>
            </div>
            <div className='show_test_comments'>
                <div className='comment_box'>
                    <div className='comment_title'>
                        💬 {totalCommentCount} ta izoh
                    </div>

                    <div className='write_comment'>
                        <div className='comment_avatar'>
                            S
                        </div>

                        <div className='input_area'>
                            <textarea
                                rows='4'
                                placeholder='Fikringizni yozing...'
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            ></textarea>
                            <div className='comment_actions'>
                                <button type='button' onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                                    Yuborish
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='comment_line'></div>

                    {comments.map((comment, index) => (
                        <div key={comment.id}>
                            <div className='comment'>
                                <div className='comment_avatar'>
                                    {getInitials(comment.author)}
                                </div>

                                <div className='comment_content'>
                                    <div className='comment_header'>
                                        <div className='comment_name'>{comment.author}</div>
                                        <div className='comment_time'>{comment.time}</div>
                                    </div>

                                    <div className='comment_text'>
                                        {comment.text}
                                    </div>

                                    <div className='comment_footer'>
                                        <button type='button' className={`comment_action_btn ${comment.reaction === 'like' ? 'active' : ''}`} onClick={() => toggleReaction(comment.id, null, 'like')}>
                                            <i className='bi bi-hand-thumbs-up'></i>
                                            <span>{comment.likes}</span>
                                        </button>
                                        <button type='button' className={`comment_action_btn ${comment.reaction === 'dislike' ? 'active' : ''}`} onClick={() => toggleReaction(comment.id, null, 'dislike')}>
                                            <i className='bi bi-hand-thumbs-down'></i>
                                            <span>{comment.dislikes}</span>
                                        </button>
                                        <button type='button' className='comment_action_btn reply_btn' onClick={() => {
                                            setReplyingTo({ commentId: comment.id, replyId: null })
                                            setReplyText('')
                                        }}>
                                            Javob yozish
                                        </button>
                                    </div>

                                    {replyingTo?.commentId === comment.id && replyingTo?.replyId === null && (
                                        <div className='reply_form'>
                                            <textarea
                                                rows='3'
                                                placeholder='Javobingizni yozing...'
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            ></textarea>
                                            <div className='reply_actions'>
                                                <button type='button' className='reply_cancel_btn' onClick={() => {
                                                    setReplyingTo(null)
                                                    setReplyText('')
                                                }}>Bekor qilish</button>
                                                <button type='button' onClick={() => handleReplySubmit(comment.id)} disabled={!replyText.trim()}>
                                                    Yuborish
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {comment.replies?.length > 0 && (
                                        <div>
                                            <button type='button' className='reply_toggle_btn' onClick={() => toggleReplies(comment.id)}>
                                                {expandedReplies[comment.id] ? 'Javoblarni yopish' : `Javoblarni ochish (${comment.replies.length})`}
                                            </button>

                                            {expandedReplies[comment.id] && (
                                                <div className='reply_list'>
                                                    {comment.replies.map((reply) => (
                                                        <div className='reply' key={reply.id}>
                                                            <div className='comment_avatar reply_avatar'>
                                                                {getInitials(reply.author)}
                                                            </div>

                                                            <div className='reply_content'>
                                                                <div className='comment_header'>
                                                                    <div className='comment_name'>{reply.author}</div>
                                                                    <div className='comment_time'>{reply.time}</div>
                                                                </div>

                                                                {reply.replyTo && (
                                                                    <div className='reply_target'>↳ @{reply.replyTo} ga javob</div>
                                                                )}

                                                                <div className='comment_text'>
                                                                    {reply.text}
                                                                </div>

                                                                <div className='comment_footer'>
                                                                    <button type='button' className={`comment_action_btn ${reply.reaction === 'like' ? 'active' : ''}`} onClick={() => toggleReaction(comment.id, reply.id, 'like')}>
                                                                        <i className='bi bi-hand-thumbs-up'></i>
                                                                        <span>{reply.likes}</span>
                                                                    </button>
                                                                    <button type='button' className={`comment_action_btn ${reply.reaction === 'dislike' ? 'active' : ''}`} onClick={() => toggleReaction(comment.id, reply.id, 'dislike')}>
                                                                        <i className='bi bi-hand-thumbs-down'></i>
                                                                        <span>{reply.dislikes}</span>
                                                                    </button>
                                                                    <button type='button' className='comment_action_btn reply_btn' onClick={() => {
                                                                        setReplyingTo({ commentId: comment.id, replyId: reply.id })
                                                                        setReplyText('')
                                                                    }}>
                                                                        Javob yozish
                                                                    </button>
                                                                </div>

                                                                {replyingTo?.commentId === comment.id && replyingTo?.replyId === reply.id && (
                                                                    <div className='reply_form'>
                                                                        <textarea
                                                                            rows='3'
                                                                            placeholder='Javobingizni yozing...'
                                                                            value={replyText}
                                                                            onChange={(e) => setReplyText(e.target.value)}
                                                                        ></textarea>
                                                                        <div className='reply_actions'>
                                                                            <button type='button' className='reply_cancel_btn' onClick={() => {
                                                                                setReplyingTo(null)
                                                                                setReplyText('')
                                                                            }}>Bekor qilish</button>
                                                                            <button type='button' onClick={() => handleReplySubmit(comment.id)} disabled={!replyText.trim()}>
                                                                                Yuborish
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {index < comments.length - 1 && <div className='comment_line'></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div >
    )
}
