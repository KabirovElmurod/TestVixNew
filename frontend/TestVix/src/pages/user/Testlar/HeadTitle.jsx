// import React from 'react'
import { useState } from 'react'
import Title from '../../../components/ui/Title'
export default function HeadTitle({ search, setSearch }) {


    const handleSubmit = (e) => {
        e.preventDefault()
    }
    return (
        <form className="head-title" onSubmit={(e) => { handleSubmit(e) }}>
            <Title title="Testlar"></Title>
            <div className='input-div'>
                <input type="text" placeholder="Test nomi bo'yicha qidirish..." className="search-input" value={'asd'} onChange={(e) => setSearch(e.target.value)} />
                <button className="bi bi-search"></button>
            </div>
            <button type="submit" className="search-button">Qidirish</button>
        </form>
    )

}
