import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../api/auth'
import { AuthContext } from '../../context/AuthContext'
// logout uchun page. userdan haqiqatdan ham chiqishni bilish uchun
export default function Logout() {
    const {logout} = useContext(AuthContext)
    let navigate = useNavigate()
    const handleLogout = async() =>{
        let res = await logoutUser()
        logout()
        navigate('/')
    }
    const handleCancel = () =>{
        navigate('/')
    }
  return (
    <div className='logout-page'>

        <div className="logout-box">

            <div className="icon-wrapper">
                <i className="bi bi-box-arrow-right"></i>
            </div>

            <h2>Tizimdan chiqish</h2>

            <p>
                Sessiyangiz yakunlanadi. Davom etishdan oldin,
                akkauntingizdan chiqishni tasdiqlang.
            </p>

            <div className="actions">
                <button className="btn btn-cancel" onClick={handleCancel}>
                    Qolish
                </button>

                <button className="btn btn-logout" onClick={handleLogout}>
                    Chiqish
                </button>
            </div>

            <div className="note">
                <i className="bi bi-shield-check"></i>
                Hisobingiz ma'lumotlari saqlanib qoladi.
            </div>

        </div>
    </div>
  )
}
