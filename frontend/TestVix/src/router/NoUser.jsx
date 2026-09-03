import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/nouser/Home'
import Login from '../pages/nouser/Login'
import Register from '../pages/nouser/Register'
import NoPage from '../pages/NoPage'

export default function NoUser() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NoPage></NoPage>} />
            </Routes>
        </Suspense>
    )
}
