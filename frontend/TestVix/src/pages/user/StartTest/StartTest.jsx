import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { finishSavol, getSavol } from '../../../api/request_savollar';
import Message from '../../../components/ui/Message';
import FinishTestModal from './components/FinishTestModal';
import TestInfo from './components/TestInfo';
import Timer from './components/Timer';
import QuestionCard from './components/QuestionCard';
import QuestionNavigator from './components/QuestionNavigator';
import NoPage from '../../NoPage';

const StartTest = () => {
  const { id: id, test_id: testID, hash_url: hash_url } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const questionRefs = useRef(new Map());
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [test, setTest] = useState([]);
  const [time, setTime] = useState()
  const [is_time, setIsTime] = useState(true)

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [lastId, setLastId] = useState()
  {

    console.log('aaaaaaaa')
  }
  const getSavollarData = async (last_id) => {
    let data = {
      id: Number(id),
      test_id: testID,
      hash_url: hash_url
    }
    if (last_id) {
      data['last_id'] = last_id
    }
    console.log(data);

    const response = await getSavol(data);
    console.log('saaa');

    console.log(response);
    if (response.user == false) {
      logout();
      navigate('/login');
      return;
    }
    if (response.status == false) {
      return
      // navigate('');
    }
    let local_savol = localStorage.getItem('test_savol')
    if (local_savol) {
      local_savol = JSON.parse(local_savol);

      const mavjud = new Set(local_savol.savollar.map(s => s.id));

      local_savol.savollar.push(
        ...response.savollar.filter(s => !mavjud.has(s.id))
      );

      local_savol.last_id = response.last_id;

      localStorage.setItem("test_savol", JSON.stringify(local_savol));
    }
    else {
      localStorage.setItem('test_savol', JSON.stringify(response));
    }

    console.log('savollar=>', local_savol);

    setQuestions(prev => ([
      ...prev,
      ...response.savollar
    ]));
    setLastId(response.last_id)
    if (response.last_id) {
      await getSavollarData(response.last_id)
    }
  };

  useEffect(() => {
    const test = localStorage.getItem('test');
    let local_time = localStorage.getItem('time')
    if (local_time) {
      setTime(local_time)
    }
    if (test) {
      const testObj = JSON.parse(test);
      setIsTime(testObj.istime)
      setTest(testObj);
    }

    // Load saved answers from localStorage
    const savedAnswers = localStorage.getItem(`test_answers`);
    const savedAnsweredQuestions = localStorage.getItem(`test_answered`);

    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
    if (savedAnsweredQuestions) {
      setAnsweredQuestions(JSON.parse(savedAnsweredQuestions));
    }

    const gsd = async () => {
      await getSavollarData();
    }
    gsd()

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

  // const scrollToQuestion = (id) => {
  //   const element = questionRefs.current.get(`question-${id}`);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //     setIsNavOpen(false);
  //   }
  // };

  const scrollToQuestion = useCallback((id) => {
    const element = questionRefs.current.get(`question-${id}`);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      setIsNavOpen(false);
    }
  }, []);


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

  const handleAnswerSelect = (questionId, variantIndex) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const selectedVariant = question.variantlar[variantIndex];
    if (!selectedVariant) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: {
        savol_hash: question.savol_hash,
        v_hash: selectedVariant.v_hash,
        v_id: selectedVariant.id // UI uchun saqlab qolamiz
      }
    }));
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`test_answers`, JSON.stringify(selectedAnswers));
  }, [selectedAnswers, testID]);

  useEffect(() => {
    localStorage.setItem(`test_answered`, JSON.stringify(answeredQuestions));
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

  const confirmSubmitTest = async () => {
    setShowConfirmModal(false);
    setIsTimerRunning(false);
    let data = {
      id: Number(id),
      test_id: testID,
      hash_url: hash_url,
      answers: selectedAnswers
    }
    let res = await finishSavol(data);
    if (res.user == false) {
      logout();
      navigate('/login');
      return;
    }
    if (res.status == false) {
      return
    }
    localStorage.setItem('test_result', JSON.stringify(res.result));
    // Navigate to FinishTest page with results
    navigate(`/test/finish/${id}/${testID}/${hash_url}`);
  };


  const handleCloseMessage = useCallback(() => {
    setMessage('');
  }, []);

  // console.log('dwwww=>', test?.time, test);

  // if (!questions) {
  //   console.log('sadwdw');

  //   return (
  //     <NoPage></NoPage>
  //   )
  // }
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
              {questions?.map((question, index) => (
                <div
                  className="question-item"
                  ref={(el) => setQuestionRef(`question-${question.id}`, el)}
                  key={question.id}
                >
                  <QuestionCard
                    question={question}
                    index={index}
                    selectedAnswer={selectedAnswers[question.id]?.v_id}
                    onAnswerSelect={handleAnswerSelect}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {
        test?.nom ?
          <QuestionNavigator
            questions={questions}
            scrollToQuestion={scrollToQuestion}
            activeQuestionId={activeQuestionId}
            isOpen={isNavOpen}
            onClose={() => setIsNavOpen(false)}
            answeredQuestions={answeredQuestions}
            test={test}
            time={time}
            is_time={is_time}
            isTimerRunning={isTimerRunning}
            onTimeUp={handleTimeUp}
            handleSubmitTest={handleSubmitTest}
          /> : null
      }

      <FinishTestModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSubmitTest}
      />
    </div>
  );
};

export default StartTest;
