import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { deleteTestPost, getTestGet } from '../../api/request_testlar';
import Message from '../../components/ui/Message';
import Title from '../../components/ui/Title';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { AuthContext } from '../../context/AuthContext';




export default function MyTests() {
  const [testlar, setTestlar] = useState([])
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const {logout} = useContext(AuthContext)
  const navigate = useNavigate();

  const triggerDeleteModal = (test) => {
    setTestToDelete(test);
    setIsModalOpen(true);
  };

  const handleCloseMessage = useCallback(() => {
    setMessage('');
  }, []);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setMessage(`Test ID (${id}) nusxalandi!`);
    setMessageType('success');
  };

  const handleDeleteTest = async (key, id, ispublic) =>{
    let res = await deleteTestPost(key, id, ispublic);
    // console.log(res);
    if (res.user == false){
      logout()
      window.location.href = '/';
      return
    }
    if (res && res.status === true) {
      let card = document.getElementById(`test_card_id_${id}`);
      card.classList.add('test-card-deleted');
      setTimeout(() => {
        card.remove();
      }, 500);
      setMessage('Test muvaffaqiyatli o\'chirildi!');
      setMessageType('success');
    }
    else{
      setMessage(res?.message || 'Test o\'chirishda xatolik yuz berdi!');
      setMessageType('error');
    }
    
  }

  useEffect(
  ()=>{
    async function getTest(){
      let res = await getTestGet();
      if (res.user == false){
        logout()
        window.location.href = '/';
        return
      }
      setTestlar(res)
    }
    getTest()
  }, []
)

  const handleConfirmDelete = async () => {
    if (testToDelete) {
      await handleDeleteTest(testToDelete.key, testToDelete.id, testToDelete.ispublic);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Message 
        type={messageType} 
        message={message} 
        onClose={handleCloseMessage} 
        duration={3000}
      />
      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmDelete}
        testTitle={testToDelete?.nom}
        testId={testToDelete?.id}
      />
      <Title title="Mening testlarim"></Title>
    <div className="my_tests">
      {/* <div className="add_test_title" style={{ marginBottom: '20px' }}>
        <h2>Mening testlarim</h2>
      </div> */}
      
      <div className="steps-grid">
        {testlar?.map((test) => (
          <div key={test.id} className="test-card" id={`test_card_id_${test.id}`}>
            <div className="test-card-content">
              <div className="card-top">
                {
                  test.ispublic ?
                  <div className="card-icon card-icon-public">
                      <i className='bi bi-globe'></i>
                      <span 
                        className="card-id" 
                        onClick={() => handleCopyId(test.id)}
                        style={{ cursor: 'pointer' }}
                        title="Nusxa"
                      >
                        ID: {test.id}
                      </span>
                  </div>
                  :
                  <div className="card-icon card-icon-private">
                      <i className='bi bi-lock'></i>
                      <span 
                        className="card-id" 
                        onClick={() => handleCopyId(test.id)}
                        style={{ cursor: 'pointer' }}
                        title="Nusxalash uchun bosing"
                      >
                        ID: {test.id}
                      </span>
                  </div>

                }
                <div className="card-actions">
                  <button
                    className="icon-button"
                    title="Savol qo'shish"
                    onClick={() => {
                      localStorage.setItem('test', JSON.stringify(test))
                      navigate(`/test/questions/${test.test_id}/${test.key}/${test.hash_url}`)
                    }} // Ushbu testga savollar qo'shish sahifasiga o'tish
                  >
                    <i className="bi bi-plus-square"></i> {/* Savol qo'shish ikonkasi */}
                  </button>
                  <button 
                    className="icon-button" 
                    title="Tahrirlash" 
                    onClick={() => navigate('/add_test', { state: { test: test } })}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className="icon-button delete-button" title="O'chirish" onClick={() => triggerDeleteModal(test)}><i className="bi bi-trash"></i></button>
                </div>
              </div>

              <h3 className="card-title">{test.nom}</h3>
              <p className="card-desc">{test.tavsif}</p>
              
              <span className="card-badge">{test.fan}</span>

              <div className="card-info">
                
                <span><i className="bi bi-clock"></i> {test.istime ? test.time : <i className="bi bi-infinity"></i>}</span>
                <span><i className="bi bi-question-circle"></i> {test.savollar_soni} savol</span>
                <span><i className="bi bi-star-fill" style={{color: '#fbbf24'}}></i> 4.5</span>
                <span><i className="bi bi-calendar3"></i> {test.created}</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="card-tags">
                <span  className="card-tag">#math</span>
                <span className="card-tag">#engilish</span>
                <span className="card-tag">#algebra</span>
                {/* {test.tags.map((tag, idx) => (
                  <span key={idx} className="card-tag">{tag}</span>
                ))} */}
              </div>
              <button className="icon-button" onClick={() => {
                      localStorage.setItem('test', JSON.stringify(test))
                      navigate(`/test/questions/${test.test_id}/${test.key}/${test.hash_url}`)
                    }}>
                Ko'rish <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}