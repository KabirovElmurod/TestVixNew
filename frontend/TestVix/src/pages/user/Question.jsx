import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { deleteSavol, getSavollar } from '../../api/request_savollar';
// import { getSavollar } from '../../api/test';
import SVGShow from '../../components/ui/SVGShow';
import ConfirmModal from '../../components/ui/ConfirmModal';
import MathText from '../../components/MathText';
import Message from '../../components/ui/Message';
// import { logoutUser } from '../../api/auth';
// import '../../../style/block/user/page/_question.scss';

const QuestionCard = ({ question, onEdit, onDelete, index, testIDKeyHash}) => {
  // const navigate = useNavigation()
  const [svg, setSvg] = useState('');
  const [json, setJson] = useState(() => {
    try {
      const parsed = JSON.parse(question.svg_json);
      return parsed.elements.length > 0 ? question.svg_json : null;
    } catch (e) {
      console.error('JSON parse error:', e);
      return null;
    }
  });
  return (
    <div className="question-card">
      <div className="card-header">
        <div className="q-badge">
          <i className="bi bi-hash"></i>
          <span>Savol {index+1}</span>
        </div>
        <div className="actions">
          <button className="action-btn edit" title="Tahrirlash" onClick={() => onEdit(question)}>
            <i className="bi bi-pencil-square"></i>
          </button>
          <button className="action-btn delete" title="O'chirish" onClick={() => onDelete(index, testIDKeyHash)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <h2 className="question-body"><MathText text={question.text} /></h2>
      {
        json ? 
        <SVGShow svg={svg} setSVG={setSvg} json={json} />
        : null
      }


      <div className="options-grid">
        {question.variantlar.map((option, index) => (
          <div
            key={index}
            className={`option-item ${option.is_true ? "correct" : ""}`}
          >
            <span className="prefix">{String.fromCharCode(65 + index)}</span>
            <span className="text"><MathText text={option.text} /></span>
            {option.is_true && (
              <div className="status-icon">
                <i className="bi bi-check-lg"></i>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`bi ${i < fullStars ? 'bi-star-fill' : (i === fullStars && hasHalfStar ? 'bi-star-half' : 'bi-star')}`}></i>
      ))}
      <span className="rating-value">{rating}</span>
    </div>
  );
};

const QuestionNavigator = ({ questions, scrollToQuestion, activeQuestionId, isOpen, onClose }) => {
  return (
    <div className={`question-navigator-container ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="question-navigator" onClick={(e) => e.stopPropagation()}>
        <div className="navigator-header">
          <h3 className="navigator-title">Savollar</h3>
          <button className="close-nav-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="navigator-grid">
          {questions.map((q, index) => (
            <button
              key={q.id}
              className={`navigator-button ${activeQuestionId === q.id ? 'active' : ''}`}
              onClick={() => scrollToQuestion(q.id)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuestionsPage = () => {
  const { test_id: testID, key: testKey, hash_url: hashUrl } = useParams(); // Get test ID from URL
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const questionRefs = useRef(new Map()); // Map to store refs for each question
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, questionId: null, questionText: '' });
  const [testIDKeyHash, setTestIDKeyHash] = useState({ 'test_id': Number(testID), 'key': testKey, 'hash_url': hashUrl });
  const [test, setTest] = useState({
    id: testID || '50550',
    title: 'Algebra asoslari: Chiziqli tenglamalar',
    subject: 'Matematika',
    description: 'Ushbu test algebraik ifodalar, bir noma’lumli chiziqli tenglamalar va ularni yechish usullarini qamrab oladi. O‘rta maktab o‘quvchilari uchun mo‘ljallangan.',
    duration: 45,
    isPublic: true,
    rating: 4.8
  });


  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [questions, setQuestions] = useState([]);

  const get_avollar = async () => {
    let data = {
      test_id: Number(testID),
      key: testKey,
      hash_url: hashUrl
    }
    const response = await getSavollar(data);
    // console.log('response=>', response);
    
    if (response.user == false) {
      logout();
      navigate('/login');
      return;
    }
    
    setQuestions(response.data);
    // console.log(response);
    // console.log('data=>', response.data);
    
  };

  useEffect(() => {
    const test = localStorage.getItem('test');
    if (test) {
      const testObj = JSON.parse(test);
      setTest(testObj);
    }
    get_avollar();
  }, []);


  const setQuestionRef = (id, element) => {
    if (element) {
      questionRefs.current.set(id, element);
    } else {
      questionRefs.current.delete(id);
    }
  };

  const scrollToQuestion = (id) => {
    const element = questionRefs.current.get(`question-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsNavOpen(false); // Close navigator on mobile after selection
    }
  };

  // Use IntersectionObserver to determine active question
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveQuestionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' } // Trigger when 50% of the element is in view
    );

    questionRefs.current.forEach((element, id) => {
      element.id = id; // Ensure element has an ID for IntersectionObserver
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [questions]);

  const handleAddQuestion = () => {
    
    navigate(`/test/add_question/${testID}/${testKey}/${hashUrl}`);
    // alert('Yangi savol qo‘shish funksiyasi hali amalga oshirilmagan!');
    // Implement navigation to a form or open a modal for adding a new question
  };

  const handleEditQuestion = (question) => {
    navigate(`/test/add_question/${testID}/${testKey}/${hashUrl}`, {state:question});
    // alert(`Savol ${id} ni tahrirlash funksiyasi hali amalga oshirilmagan!`);
    // Implement navigation to an edit form or open a modal for editing
  };

  const handleDeleteQuestion = (index) => {
    setDeleteModal({ isOpen: true, questionId: index });
  };

  const handleConfirmDelete = async () => {
    testIDKeyHash['hash_id'] = questions[deleteModal.questionId].hash_id;
    testIDKeyHash['savol_id'] = questions[deleteModal.questionId].id;
    handleCloseDeleteModal()
    let res = await deleteSavol(testIDKeyHash);
    if (res.user==false){
      setMessage('Sessiya tugagan. Tizimga qaytadan kiring!');
      setMessageType('error');
      setTimeout(() => {
        logout()
        navigate('/')
      }, 2000);
      return;
    }
    if (res.status == false){
      setMessage(res.message || 'Savolni o\'chirishda xatolik yuz berdi!');
      setMessageType('error');
      return;
    }

    setMessage(res.message || 'Savol muvaffaqiyatli o\'chirildi!');
    setMessageType('success');
    let quiz = document.getElementById(`question-${questions[deleteModal.questionId].id}`);
    if (quiz) {
      quiz.classList.add('question-item-delete');
      setTimeout(() => {
        quiz.remove();
      }, 500);
    }
    setQuestions(prev => prev.filter(item => item.id !== questions[deleteModal.questionId].id));

  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, questionId: null, questionText: '' });
  };
  const handleCloseMessage = useCallback(() => {
    setMessage('');
  }, []);
  return (
    
    <div className="questions-page-wrapper">
      <Message 
              type={messageType} 
              message={message} 
              onClose={handleCloseMessage} 
              duration={4000}
            />
      <button className="mobile-nav-toggle" onClick={() => setIsNavOpen(true)}>
        <i className="bi bi-list-ol"></i>
        <span>Savollar</span>
      </button>

      <div className="questions-main-content"> {/* Main content area */}
        <div className="test-info-section">
          <div className="test-card-content">
            <div className="test-main-info">
              <div className="test-badge-row">
                <span className="subject-badge">{test.fan}</span>
                <span className="id-badge">ID: {test.id}</span>
                <span className={`visibility-badge ${test.ispublic ? 'Public' : 'Private'}`}>
                  <i className={`bi ${test.ispublic ? 'bi-globe' : 'bi-lock'}`}></i>
                  {test.ispublic ? 'Public' : 'Private'}
                </span>
              </div>
              <h1 className="test-title">{test.nom}</h1>
              <p className="test-description">{test.tavsif}</p>
            </div>
            
            <div className="test-footer-stats">
              <div className="stat-group">
                <div className="stat-item">
                  <div className="icon-box">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Vaqt</span>
                    <span className="stat-value">{test.time} daqiqa</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="icon-box">
                    <i className="bi bi-award"></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Reyting</span>
                    <StarRating rating={test.rating ? test.rating : 0} />
                  </div>
                </div>
              </div>
              <button className="settings-btn" title="Test sozlamalari">
                <i className="bi bi-gear-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="questions-header">
          <h1 className="title">Savollar ro‘yxati <span className="count">({questions.length})</span></h1>
          <button className="add-btn" onClick={handleAddQuestion}>
            <i className="bi bi-plus-circle-fill"></i>
            <span>Yangi savol</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="empty-container">
            <div className="icon-box">
              <i className="bi bi-journal-x"></i>
            </div>
            <div className="empty-text">
              <h3 className="text-lg font-bold">Hali savollar yo‘q</h3>
              <p className="text-slate-500 text-sm">Testni to‘ldirish uchun birinchi savolni qo‘shing.</p>
            </div>
            <button onClick={handleAddQuestion} className="btn btn-primary inline-flex items-center gap-2">
              <i className="bi bi-plus-lg"></i> Savol qo‘shish
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div className="question-item" ref={(el) => setQuestionRef(`question-${question.id}`, el)} key={question.id}>
                <QuestionCard
                  question={question}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                  index={index}
                  testIDKeyHash={testIDKeyHash}
                  // testId={testId}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <QuestionNavigator
        questions={questions}
        scrollToQuestion={scrollToQuestion}
        activeQuestionId={activeQuestionId}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        testTitle={false}
        testId={deleteModal.questionId}
        isTest={false}
      />
    </div>
  );
};

export default QuestionsPage;
