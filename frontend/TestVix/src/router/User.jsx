import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Aloqa from '../pages/user/Aloqa/Aloqa';
const HomeUser = lazy(() => import("../pages/user/HomeUser"));
const AddTest = lazy(() => import("../pages/user/AddTest/AddTest"));
const MyTests = lazy(() => import("../pages/user/MyTests"));
const Question = lazy(() => import("../pages/user/Question"));
const AddQuestion = lazy(() => import("../pages/user/AddQuestion"));
const ShowTest = lazy(() => import("../pages/user/ShowTest/ShowTest"));
const Testlar = lazy(() => import("../pages/user/Testlar/Testlar"));
const StartTest = lazy(() => import("../pages/user/StartTest/StartTest"))
const FinishTest = lazy(() => import("../pages/user/FinishTest/FinishTest"))
const SearchTest = lazy(() => import("../pages/user/SearchTest/SearchTest"))

const Logout = lazy(() => import("../pages/user/Logout"));
const Login = lazy(() => import("../pages/nouser/Login"));
const Register = lazy(() => import("../pages/nouser/Register"));
const NoPage = lazy(() => import("../pages/NoPage"));
export default function User() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<HomeUser></HomeUser>} />
                <Route path="/add_test" element={<AddTest></AddTest>} />
                <Route path="/my_test" element={<MyTests></MyTests>}></Route>
                <Route path="/test/show/:id/:test_id/:hash_url" element={<ShowTest></ShowTest>}></Route>
                <Route path="/test/questions/:test_id/:key/:hash_url" element={<Question></Question>}></Route>
                <Route path="/test/add_question/:test_id/:key/:hash_url" element={<AddQuestion></AddQuestion>}></Route>
                <Route path="/testlar" element={<Testlar></Testlar>}></Route>
                <Route path="/test/start/:id/:test_id/:hash_url" element={<StartTest></StartTest>}></Route>
                <Route path="/test/finish/:id/:test_id/:hash_url" element={<FinishTest></FinishTest>}></Route>
                <Route path="/search/:query" element={<SearchTest></SearchTest>}></Route>
                <Route path='/aloqa' element={<Aloqa></Aloqa>}></Route>
                <Route path='/logout' element={<Logout></Logout>}></Route>


                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NoPage></NoPage>} />
            </Routes>
        </Suspense>
    )
}
