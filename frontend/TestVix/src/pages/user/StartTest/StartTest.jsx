import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { getSavollar } from '../../../api/request_savollar';
import Message from '../../../components/ui/Message';
import FinishTestModal from './components/FinishTestModal';
import TestInfo from './components/TestInfo';
import Timer from './components/Timer';
import QuestionCard from './components/QuestionCard';
import QuestionNavigator from './components/QuestionNavigator';

const StartTest = () => {
  const { test_id: testID, key: testKey, hash_url: hashUrl } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const questionRefs = useRef(new Map());
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [test, setTest] = useState({
    id: testID || '50550',
    nom: 'Algebra asoslari: Chiziqli tenglamalar',
    fan: 'Matematika',
    tavsif: 'Ushbu test algebraik ifodalar, bir noma\'lumli chiziqli tenglamalar va ularni yechish usullarini qamrab oladi. O\'rta maktab o\'quvchilari uchun mo\'ljallangan.',
    time: 4,
    ispublic: true,
    rating: 4.8
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: '2x + 5 = 15 tenglamani yeching.',
      variantlar: [
        { text: 'x = 5', is_true: true },
        { text: 'x = 10', is_true: false },
        { text: 'x = 7', is_true: false },
        { text: 'x = 3', is_true: false }
      ],
      svg_json: null
    },
    {
      id: 2,
      text: '3(x - 2) = 12 tenglamani yeching.',
      variantlar: [
        { text: 'x = 6', is_true: true },
        { text: 'x = 4', is_true: false },
        { text: 'x = 8', is_true: false },
        { text: 'x = 2', is_true: false }
      ],
      svg_json: null
    },
    {
      id: 3,
      text: 'Quyidagilardan qaysi biri chiziqli tenglama?',
      variantlar: [
        { text: 'x² + 2x = 5', is_true: false },
        { text: '2x + 3 = 7', is_true: true },
        { text: 'x³ = 8', is_true: false },
        { text: '√x = 4', is_true: false }
      ],
      svg_json: null
    },
    {
      id: 4,
      text: '5x - 3 = 2x + 9 tenglamani yeching.',
      variantlar: [
        { text: 'x = 4', is_true: true },
        { text: 'x = 3', is_true: false },
        { text: 'x = 5', is_true: false },
        { text: 'x = 2', is_true: false }
      ],
      svg_json: null
    },
    {
      id: 5,
      text: 'Agar 2x + 7 = 19 bo\'lsa, x ning qiymatini toping.',
      variantlar: [
        { text: 'x = 6', is_true: true },
        { text: 'x = 8', is_true: false },
        { text: 'x = 5', is_true: false },
        { text: 'x = 12', is_true: false }
      ],
      svg_json: null
    }
  ]);

  const getSavollarData = async () => {
    let data = {
      test_id: Number(testID),
      key: testKey,
      hash_url: hashUrl
    }
    const response = await getSavollar(data);
    
    if (response.user == false) {
      logout();
      navigate('/login');
      return;
    }
    
    setQuestions(response.data);
  };

  useEffect(() => {
    const test = localStorage.getItem('test');
    if (test) {
      const testObj = JSON.parse(test);
      setTest(testObj);
    }
    
    // Load saved answers from localStorage
    const savedAnswers = localStorage.getItem(`test_answers_${testID}`);
    const savedAnsweredQuestions = localStorage.getItem(`test_answered_${testID}`);
    
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
    if (savedAnsweredQuestions) {
      setAnsweredQuestions(JSON.parse(savedAnsweredQuestions));
    }
    
    getSavollarData();
    
    // Auto-start timer immediately
    setIsTimerRunning(true);
  }, [testID]);

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
      setIsNavOpen(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveQuestionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    questionRefs.current.forEach((element, id) => {
      element.id = id;
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [questions]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`test_answers_${testID}`, JSON.stringify(selectedAnswers));
  }, [selectedAnswers, testID]);

  useEffect(() => {
    localStorage.setItem(`test_answered_${testID}`, JSON.stringify(answeredQuestions));
  }, [answeredQuestions, testID]);

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    setMessage('Vaqt tugadi! Test avtomatik yakunlandi.');
    setMessageType('warning');
    confirmSubmitTest();
  };

  const handleSubmitTest = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmitTest = () => {
    setShowConfirmModal(false);
    setIsTimerRunning(false);
    const correctAnswers = questions.reduce((count, question) => {
      const selectedOption = selectedAnswers[question.id];
      if (selectedOption !== undefined && question.variantlar[selectedOption]?.is_true) {
        return count + 1;
      }
      return count;
    }, 0);

    setMessage(`Test yakunlandi! To'g'ri javoblar: ${correctAnswers}/${questions.length}`);
    setMessageType('success');
    
    // Clear saved answers from localStorage after submission
    localStorage.removeItem(`test_answers_${testID}`);
    localStorage.removeItem(`test_answered_${testID}`);
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

      <div className="questions-main-content">
        <TestInfo test={test} />

        {questions.length === 0 ? (
          <div className="empty-container">
            <div className="icon-box">
              <i className="bi bi-journal-x"></i>
            </div>
            <div className="empty-text">
              <h3 className="text-lg font-bold">Hali savollar yo'q</h3>
              <p className="text-slate-500 text-sm">Testda savollar mavjud emas.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="questions-header">
              <h1 className="title">Savollar <span className="count">({questions.length})</span></h1>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div 
                  className="question-item" 
                  ref={(el) => setQuestionRef(`question-${question.id}`, el)} 
                  key={question.id}
                >
                  <QuestionCard
                    question={question}
                    index={index}
                    selectedAnswer={selectedAnswers[question.id]}
                    onAnswerSelect={handleAnswerSelect}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <QuestionNavigator
        questions={questions}
        scrollToQuestion={scrollToQuestion}
        activeQuestionId={activeQuestionId}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        answeredQuestions={answeredQuestions}
        test={test}
        isTimerRunning={isTimerRunning}
        onTimeUp={handleTimeUp}
        handleSubmitTest={handleSubmitTest}
      />

      <FinishTestModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSubmitTest}
      />
    </div>
  );
};

export default StartTest;
