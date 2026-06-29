import React, { useState, useCallback, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input'
import TextArea from '../../components/ui/TextArea';
import Check from '../../components/ui/Check';
import Message from '../../components/ui/Message';
import { createTestPost, updateTestPost } from '../../api/request_testlar';
import Title from '../../components/ui/Title';
import { AuthContext } from '../../context/AuthContext';

export default function AddTest() {
    const location = useLocation();
    const navigate = useNavigate();
    const {logout} = useContext(AuthContext)
    const editData = location.state?.test;
    console.log('eeee', editData);
    
    const [nom, setNom] = useState(editData?.nom || '');
    const [fan, setFan] = useState(editData?.fan || '');
    const [tavsif, setTavsif] = useState(editData?.tavsif || '');
    const [visiable, setVisiable] = useState(editData ? editData.ispublic : true);
    const [istime, setIsTime] = useState(editData ? editData.istime : true);
    const [time, setTime] = useState(editData?.time || 15);
    const [key, setKey] = useState(editData?.key || '');

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    let times = [
      {
        'name': '15 min',
        'value': 15
      }, {'name':'30 min', 'value':30}, 
      {'name':'45 min', 'value':45}, 
      {'name':'1 soat', 'value':60}, 
      {'name':'1.5 soat', 'value':90}, 
      {'name':'2 soat', 'value':120}, 
    ];

    const handleAddTime = (sign)=>{
      if(sign === '+'){
        setTime(Number(time)+5);
      }else{
        if (Number(time)>5)
          setTime(Number(time)-5);
      }
    }

    const handleCreateTest = async () =>{
      if (!nom || !fan || !tavsif){
        setMessage('Ma\'lumotlarni to\'liq kiriting!');
        setMessageType('error');
        return
      }
      let data = {
        'nom': nom,
        'fan': fan,
        'tavsif': tavsif,
        'ispublic': visiable,
        'istime': istime,
        'time': time
      }
      if(editData){
        data['key'] = key;
        data['id'] = editData.id;
      }
      
      let res;
      if (editData?.id) {
        // res = 'data'
        res = await updateTestPost(data);
      } else {
        res = await createTestPost(data);
      }

      console.log(res);
      if (res.user == false){
        logout()
        window.location.href = '/';
        return
      }
      
      if (res && res.status === true) {
        setMessage(editData ? res.message || 'Test muvaffaqiyatli tahrirlandi!': 'Test muvaffaqiyatli qo\'shildi!');
        setMessageType('success');
        
        if (!editData) {
            setNom('');
            setFan('');
            setTavsif('');
            
        } else {
            setTimeout(() => navigate('/my_test'), 1500);
        }
        setTimeout(() => navigate('/my_test'), 1500);
      } else {
        setMessage(res?.message || 'Test qo\'shishda xatolik yuz berdi!');
        setMessageType('error');
      }
    }

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
      <Title title={editData ? "Testni tahrirlash" : "Test qo'shish"}></Title>
      <div className='add_test'>
        {/* <div className='add_test_title'>
          <h2>Test qo'shish</h2>
        </div> */}
        <div className='add_test_inputs'>
          <div className='add_test_div'>
            <Input place="Test Nomi" label="Test Nomi" setNom={setNom} nom={nom}></Input>
            <Input place="Test Fani" label="Test Fani" setNom={setFan} nom={fan}></Input>
          </div>
          <div className='add_test_div'> 
            <TextArea place="Test Fani" label="Test Fani" setNom={setTavsif} nom={tavsif}></TextArea>
          </div>
          <div className='add_test_div'>
            <Check set={setVisiable} item={visiable} theme='Private va Public' name="visiable" label1="Private" label2='Public' id1="private_id" id2="public_id" comment1="Hech kim ko'ra olmaydi" comment2="Hammaga ko'rinadi"></Check>
            <Check set={setIsTime} item={istime} theme='Vaqtli va Vaqtsiz'name="time" label1="Vaqtsiz" label2='Vaqtli' id1="vaqtsiz_id" id2="vaqtli_id" comment1="Vaqtsiz" comment2="Vaqtli"></Check>
          </div>
          <div className='add_test_div add_test_div_time'>
            <div className='add_test_div_time_input'>
              <Input place="Vaqt" label="Vaqt (minut)" setNom={setTime} nom={time} disabled={istime}></Input>
              {
                istime ? 
                  <div className='add_test_div_time_input_button'>
                    <button onClick={()=>handleAddTime('-')}>-</button>
                    <button onClick={()=>handleAddTime('+')}>+</button>
                  </div>
                : 
                <div className='add_test_div_time_input_button_disabled'>
                    <button>-</button>
                    <button>+</button>
                </div>
              }
            </div>
            <div className='time_btn_set'>
              {
                istime ?
                times.map((item, index)=>{
                  return <button key={index} onClick={()=>setTime(item.value)}>{item.name}</button>
                }):
                ''
              }
            </div>
          </div>

          <button className="btn btn-primary w-full" onClick={()=>handleCreateTest()}>
            {editData ? "Saqlash" : "Test Qo'shish"}
          </button>

        </div>
      </div>
    </div>
  )
}
