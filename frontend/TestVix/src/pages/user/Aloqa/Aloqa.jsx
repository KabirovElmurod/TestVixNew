import React, { useCallback, useState } from 'react'
import { sendComment } from '../../../api/request_comment';
import Message from '../../../components/ui/Message';
const contactTypes = [
    { id: "xatolik", icon: "🐞", name: "Xatolik", },
    { id: "taklif", icon: "💡", name: "Taklif", },
    { id: "fikr", icon: "💬", name: "Fikr-mulohaza", },
    { id: "savol", icon: "❓", name: "Savol", },
    // { id: "test-question", icon: "📝", name: "Test savoli", },
    { id: "boshqa", icon: "⋯", name: "Boshqa", },
];


export default function Aloqa() {
    const [type, setType] = useState("xatolik");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [telegram, setTelegram] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("")
    const [messageType, setMessageType] = useState('')
    const [resMessage, setResMessage] = useState('')
    const handleSubmit = async (e) => {
        e.preventDefault()
        let data = {
            type: type,
            subject: subject,
            message: message,
            telegram: telegram,
            email: email,
            name: name
        }
        console.log('data=>', data);

        let res = await sendComment(data);
        if (!res.ok) {
            setMessageType("error")
            setResMessage(res.message)
        }
        setMessageType('success')
        setResMessage(res.message ? res.message : 'Yuborildi!')
        // console.log(res);
        cleanState()

    }
    const cleanState = () => {
        setEmail('')
        setMessage('')
        setName('')
        setSubject('')
        setTelegram('')
    }
    const handleCloseMessage = useCallback(() => {
        setMessage('');
    }, []);
    return (
        <div className="aloqa_cont">
            <Message
                type={messageType}
                message={resMessage}
                onClose={handleCloseMessage}
                duration={3000}
            />


            <div className="page-heading">

                <div className="badge">
                    <span className="badge-dot"></span>
                    Yordam markazi
                </div>

                <h1>Biz bilan bog‘laning</h1>

                <p>
                    Platforma yoki testlar bo‘yicha savolingiz, taklifingiz yoki
                    muammoingiz bo‘lsa, bizga yozib qoldiring.
                </p>

            </div>


            <div className="content">


                <aside className="info-card">

                    <h3>Murojaatingiz muhim</h3>

                    <p>
                        Yuborgan xabaringiz platformani yaxshilash va
                        foydalanuvchilarga qulayroq tajriba yaratishimizga yordam beradi.
                    </p>


                    <div className="info-item">

                        <div className="info-icon">🐞</div>

                        <div>
                            <strong>Xatolik topdingizmi?</strong>
                            <span>
                                Platforma yoki testdagi xatolik haqida bizga xabar bering.
                            </span>
                        </div>

                    </div>


                    <div className="info-item">

                        <div className="info-icon">💡</div>

                        <div>
                            <strong>Taklifingiz bormi?</strong>
                            <span>
                                Platformani qanday yaxshilash mumkinligi haqida fikringizni yozing.
                            </span>
                        </div>

                    </div>


                    <div className="info-item">

                        <div className="info-icon">❓</div>

                        <div>
                            <strong>Savolingiz bormi?</strong>
                            <span>
                                Tushunmagan joyingizni yozib qoldiring.
                            </span>
                        </div>

                    </div>


                    <div className="response-note">
                        💬 <strong>Javob kerak bo‘lsa</strong>, Telegram username yoki
                        email manzilingizni qoldiring. Aks holda murojaat faqat
                        ma'lumot sifatida qabul qilinadi.
                    </div>

                </aside>



                <section className="form-card">

                    <h2>Murojaat yuborish</h2>

                    <p className="form-subtitle">
                        Quyidagi ma'lumotlarni to‘ldiring.
                    </p>


                    <form>



                        <div className="form-group">

                            <label>
                                Murojaat turi <span className="required">*</span>
                            </label>
                            <div className="type-grid">
                                {contactTypes.map((item) => (
                                    <div className="type-option" key={item.id}>
                                        <input type="radio"
                                            name="type"
                                            id={item.id}
                                            value={item.id}
                                            checked={type === item.id}
                                            onChange={(e) => setType(e.target.value)} />
                                        <label htmlFor={item.id}>
                                            <span className="type-icon"> {item.icon} </span>
                                            <span className="type-name"> {item.name} </span>
                                        </label>
                                    </div>))}
                            </div>
                            {/* <div className="type-grid">


                                <div className="type-option">

                                    <input type="radio" name="type" id="bug" checked />

                                    <label for="bug">
                                        <span className="type-icon">🐞</span>
                                        <span className="type-name">Xatolik</span>
                                    </label>

                                </div>


                                <div className="type-option">

                                    <input type="radio" name="type" id="suggestion" />

                                    <label for="suggestion">
                                        <span classNameName="type-icon">💡</span>
                                        <span className="type-name">Taklif</span>
                                    </label>

                                </div>


                                <div className="type-option">

                                    <input type="radio" name="type" id="feedback" />

                                    <label for="feedback">
                                        <span className="type-icon">💬</span>
                                        <span className="type-name">Fikr-mulohaza</span>
                                    </label>

                                </div>


                                <div className="type-option">

                                    <input type="radio" name="type" id="question" />

                                    <label for="question">
                                        <span className="type-icon">❓</span>
                                        <span className="type-name">Savol</span>
                                    </label>

                                </div>


                                <div className="type-option">

                                    <input type="radio" name="type" id="test-question" />

                                    <label for="test-question">
                                        <span className="type-icon">📝</span>
                                        <span className="type-name">Test savoli</span>
                                    </label>

                                </div>


                                <div className="type-option">

                                    <input type="radio" name="type" id="other" />

                                    <label for="other">
                                        <span className="type-icon">⋯</span>
                                        <span className="type-name">Boshqa</span>
                                    </label>

                                </div>

                            </div> */}

                        </div>

                        <div className="form-group">

                            <label for="subject">
                                Ism va Familya
                                <span style={{ 'fontWeight': 400, 'color': '#999' }}>
                                    (Ixtiyoriy)
                                </span>
                            </label>

                            <input type="text" id="subject" placeholder="Aziz Azizov yoki Aziz" value={name} onChange={(e) => setName(e.target.value)} />

                        </div>



                        <div className="form-group">

                            <label for="subject">
                                Mavzu
                            </label>

                            <input type="text" id="subject" placeholder="Masalan: 5-savolda xatolik bor" value={subject} onChange={(e) => setSubject(e.target.value)} />

                        </div>



                        <div className="form-group">

                            <label for="message">
                                Xabar <span className="required">*</span>
                            </label>

                            <textarea id="message" placeholder="Murojaatingizni batafsil yozing..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>

                            <div className="input-hint">
                                Muammoni imkon qadar aniqroq tushuntiring.
                            </div>

                        </div>



                        {/* <div className="form-group">

                                <label>
                                    Fayl biriktirish
                                    <span style="font-weight:400;color:#999;">
                                        (ixtiyoriy)
                                    </span>
                                </label>

                                <label className="file-upload">

                                    <input type="file" />

                                    <div className="upload-icon">📎</div>

                                    <strong>
                                        Faylni shu yerga tashlang yoki tanlang
                                    </strong>

                                    <span>
                                        PNG, JPG yoki PDF · maksimal 5 MB
                                    </span>

                                </label>

                            </div> */}



                        <div className="form-group">




                            <div className="contact-fields">

                                <div>

                                    <label for="telegram">
                                        Telegram username
                                    </label>

                                    <input type="text" id="telegram" placeholder="@username" value={telegram} onChange={(e) => setTelegram(e.target.value)} />

                                </div>


                                <div>

                                    <label for="email">
                                        Email
                                    </label>

                                    <input type="email" id="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />

                                </div>

                            </div>

                            <div className="input-hint">
                                Javob olish uchun kamida bitta aloqa usulini qoldiring.
                            </div>

                        </div>



                        <button className="submit-btn" onClick={(e) => handleSubmit(e)}>
                            Murojaatni yuborish →
                        </button>

                        <p className="privacy">
                            Murojaat yuborish orqali ma'lumotlaringizdan faqat
                            murojaatingizni ko‘rib chiqish maqsadida foydalanishga rozilik
                            bildirasiz.
                        </p>

                        <p className="privacy">
                            {resMessage}
                        </p>


                    </form>

                </section>

            </div>

        </div >
    )
}
