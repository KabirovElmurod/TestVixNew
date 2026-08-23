import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Message from '../../../components/ui/Message';
import ResultCard from './components/ResultCard';
import QuestionReview from './components/QuestionReview';
import QuestionNavigator from './components/QuestionNavigator';

const FinishTest = () => {
  const { id: test_id, test_id: testID, hash_url: hashUrl } = useParams();
  const navigate = useNavigate();

  const questionRefs = useRef(new Map());
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [test, setTest] = useState({
    id: testID || '50550',
    nom: 'Algebra asoslari: Chiziqli tenglamalar',
    fan: 'Matematika',
    tavsif: 'Ushbu test algebraik ifodalar, bir noma\'lumli chiziqli tenglamalar va ularni yechish usullarini qamrab oladi.',
    time: 4,
    ispublic: true,
    rating: 4.8
  });

  const [questions, setQuestions] = useState([]);

  const [selectedAnswers, setSelectedAnswers] = useState({});

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [testresult, setTestresult] = useState([]);


  useEffect(() => {
    let test_result = localStorage.getItem('test_result');
    let test_savol = localStorage.getItem('test_savol');
    if (test_result) {
      test_result = JSON.parse(test_result);
      setTestresult(test_result);
    }
    if (test_savol) {
      test_savol = JSON.parse(test_savol);
      console.log('test_savol=>', test_savol.savollar);

      setQuestions(test_savol.savollar);
    }


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

  // const calculateResults = useCallback(() => {

  //   // if (!questions) return
  //   const correctCount = questions.reduce((count, question) => {
  //     const selectedOption = selectedAnswers[question.id];
  //     if (selectedOption !== undefined && question.variantlar[selectedOption]?.is_true) {
  //       return count + 1;
  //     }
  //     return count;
  //   }, 0);

  //   const totalQuestions = questions.length;
  //   const percentage = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;
  //   const isPassed = percentage >= 60;

  //   return {
  //     correctCount,
  //     totalQuestions,
  //     percentage,
  //     isPassed
  //   };

  // }, [questions])

  const calculateResults = () => {
    console.log('ss');

    const correctCount = questions.reduce((count, question) => {
      const selectedOption = testresult.answer[question.id];
      console.log('ss=>', selectedOption);

      if (selectedOption !== undefined && selectedOption?.is_true) {
        return count + 1;
      }
      return count;
    }, 0);

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;
    const isPassed = percentage >= 60;

    return {
      correctCount,
      totalQuestions,
      percentage,
      isPassed
    };
  };

  const handleRetry = () => {
    navigate(`/test/start/${test_id}/${testID}/${hashUrl}`);
  };

  const handleBackToHome = () => {
    navigate('/testlar');
  };

  const handleBackToTest = () => {
    navigate(`/test/show/${test_id}/${testID}/${hashUrl}/`);
  };

  const handleCloseMessage = () => {
    setMessage('');
  };

  const results = calculateResults();

  return (
    <div className="finish-test-wrapper">
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

      <div className="finish-test-content">
        <ResultCard
          results={results}
          test={test}
          onRetry={handleRetry}
          onBackToHome={handleBackToHome}
          onBackToTest={handleBackToTest}
        />

        <div className="questions-review-section">
          <h2 className="review-title">Savollar va javoblar tahlili</h2>
          <div className="questions-review-list">
            {questions.map((question, index) => (
              <div
                className="question-item"
                ref={(el) => setQuestionRef(`question-${question.id}`, el)}
                key={question.id}
              >
                <QuestionReview
                  question={question}
                  index={index}
                  selectedAnswer={testresult.answer[question.id]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuestionNavigator
        questions={questions}
        scrollToQuestion={scrollToQuestion}
        activeQuestionId={activeQuestionId}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        test={test}
        selectedAnswers={testresult.answer}
      />
    </div>
  );
};

export default FinishTest;
