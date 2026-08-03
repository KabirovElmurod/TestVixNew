import React, { useState, useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Message from '../../../components/ui/Message';
import { createTestPost, updateTestPost, createTestWithJsonPost } from '../../../api/request_testlar';
import Title from '../../../components/ui/Title';
import { AuthContext } from '../../../context/AuthContext';
import Navigation from './components/Navigation';
import TestForm from './components/TestForm';
import JsonForm from './components/JsonForm';
import JsonStructure from './components/JsonStructure';
import { validateTestData, formatJsonData } from './utils/jsonValidator';

export default function AddTest() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const editData = location.state?.test;

    const [activeTab, setActiveTab] = useState('manual');
    const [nom, setNom] = useState(editData?.nom || '');
    const [fan, setFan] = useState(editData?.fan || '');
    const [tavsif, setTavsif] = useState(editData?.tavsif || '');
    const [visiable, setVisiable] = useState(editData ? editData.ispublic : true);
    const [istime, setIsTime] = useState(editData ? editData.istime : true);
    const [time, setTime] = useState(editData?.time || 15);
    const [key, setKey] = useState(editData?.key || '');
    const [jsonData, setJsonData] = useState(null);
    const [is_json, setIsJson] = useState(false);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    const handleAddTime = (sign) => {
        if (sign === '+') {
            setTime(Number(time) + 5);
        } else {
            if (Number(time) > 5)
                setTime(Number(time) - 5);
        }
    };

    const handleJsonChange = (data) => {
        setJsonData(data);
        if (data) {
            const validation = validateTestData(data);
            if (validation.isValid) {
                const formattedData = formatJsonData(data);
                setNom(formattedData.nom);
                setFan(formattedData.fan);
                setTavsif(formattedData.tavsif);
                setVisiable(formattedData.ispublic);
                setIsTime(formattedData.istime);
                setTime(formattedData.time);
                setMessage('JSON ma\'lumotlari muvaffaqiyatli yuklandi!');
                setMessageType('success');
            } else {
                setMessage('JSON xatoliklari: ' + validation.errors.join(', '));
                setMessageType('error');
            }
        }
    };
    const handleJsonWithCreate = async (data) => {
        if (!data) {
            setMessage('JSON ma\'lumotlari mavjud emas!');
            setMessageType('error');
            return;
        }
        const res = await createTestWithJsonPost(data);
        if (res.user == false) {
            logout();
            window.location.href = '/';
            return;
        }
        if (res.status === false) {
            setMessage(res?.message || 'JSON ma\'lumotlari bilan test yaratishda xatolik yuz berdi!');
            setMessageType('error');
            return;
        }
        setMessage(res?.message || 'JSON ma\'lumotlari bilan test muvaffaqiyatli yaratildi!');
        setMessageType('success');
        setTimeout(() => navigate('/my_test'), 1500);
        return;

    };
    const handleCreateTest = async () => {
        if (is_json) {
            handleJsonWithCreate(jsonData);
            return;
        }
        if (!nom || !fan || !tavsif) {
            setMessage('Ma\'lumotlarni to\'liq kiriting!');
            setMessageType('error');
            return;
        }

        let data = {
            nom: nom,
            fan: fan,
            tavsif: tavsif,
            ispublic: visiable,
            istime: istime,
            time: time
        };

        if (editData) {
            data['key'] = key;
            data['id'] = editData.id;
        }

        let res;
        if (editData?.id) {
            res = await updateTestPost(data);
        } else {
            res = await createTestPost(data);
        }

        if (res.user == false) {
            logout();
            window.location.href = '/';
            return;
        }

        if (res && res.status === true) {
            setMessage(editData ? res.message || 'Test muvaffaqiyatli tahrirlandi!' : 'Test muvaffaqiyatli qo\'shildi!');
            setMessageType('success');

            if (!editData) {
                setNom('');
                setFan('');
                setTavsif('');
                setJsonData(null);
            } else {
                setTimeout(() => navigate('/my_test'), 1500);
            }
            setTimeout(() => navigate('/my_test'), 1500);
        } else {
            setMessage(res?.message || 'Test qo\'shishda xatolik yuz berdi!');
            setMessageType('error');
        }
    };

    const handleCloseMessage = useCallback(() => {
        setMessage('');
    }, []);

    return (
        <div>
            <Message
                type={messageType}
                message={message}
                onClose={handleCloseMessage}
                duration={4000}
            />
            <Title title={editData ? "Testni tahrirlash" : "Test qo'shish"} />

            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} setIsJson={setIsJson} />

            <div className='add_test'>
                {activeTab === 'manual' ? (
                    <TestForm
                        nom={nom}
                        fan={fan}
                        tavsif={tavsif}
                        visiable={visiable}
                        istime={istime}
                        time={time}
                        setNom={setNom}
                        setFan={setFan}
                        setTavsif={setTavsif}
                        setVisiable={setVisiable}
                        setIsTime={setIsTime}
                        setTime={setTime}
                        handleAddTime={handleAddTime}
                    />
                ) : (
                    <div className='json_section'>
                        <JsonStructure />
                        <JsonForm onJsonChange={handleJsonChange} jsonData={jsonData} />
                    </div>
                )}

                <button className="btn btn-primary w-full" onClick={handleCreateTest}>
                    {editData ? "Saqlash" : "Test Qo'shish"}
                </button>
            </div>
        </div>
    );
}
