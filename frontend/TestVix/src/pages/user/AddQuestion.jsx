import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Title from '../../components/ui/Title';
import Message from '../../components/ui/Message';
import MathText from '../../components/MathText';
import MathModal from '../../components/MathModal'; // TestCreate.tsx dagi kabi
import Draw1 from './Draw';
import Draw from '../../components/ui/Draw';
import SVGShow from '../../components/ui/SVGShow';
import { createSavol, updateSavol } from '../../api/request_savollar';

// import

const AddQuestion = () => {
  const location = useLocation()
  const [state, setState] = useState(location.state)
  // console.log(location);
  // console.log(location.state);


  const [svg, setSVG] = useState('')
  const [svg_json, setSVGJSON] = useState(JSON.stringify(
    {
      "elements": []
    }
  ))


  const { test_id: testID, key: testKey, hash_url: hashUrl } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState(location.state ? location.state.text : '');
  const [options, setOptions] = useState(
    location.state ? location.state.variantlar : [
      { id: 1, text: '', is_true: true },
      { id: 2, text: '', is_true: false },
      { id: 3, text: '', is_true: false },
      { id: 4, text: '', is_true: false },
    ]);

  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [initialMathFormula, setInitialMathFormula] = useState('');
  const [mathTarget, setMathTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');


  useEffect(() => {
    setSVGJSON(
      location.state == undefined ? JSON.stringify(
        {
          "elements": []
        }
      ) : location.state.svg_json
    )
  }, [])

  const handleAddOption = () => {
    if (options.length < 16) {
      setOptions([...options, { id: Date.now(), text: '', is_true: false }]);
    } else {
      setMessage('Maksimal variantlar soni 16 ta!');
      setMessageType('error');
    }
  };

  const handleRemoveOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
      if (state) {
        setState(prev => ({
          ...prev,
          variantlar: prev.variantlar.map(item =>
            item.id === id
              ? { ...item, is_delete: true }
              : item
          )
        }));
      }
    } else {
      setMessage('Minimal variantlar soni 2 ta bo\'lishi kerak!');
      setMessageType('error');
    }
  };

  const handleOptionChange = (id, text) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    if (state) {
      setState(prev => ({
        ...prev,
        variantlar: prev.variantlar.map(item =>
          item.id === id && item.text !== text
            ? { ...item, is_edit: true }
            : item
        )
      }));
    }
  };

  const handleSetCorrect = (id) => {
    setOptions(options.map(opt => ({ ...opt, is_true: opt.id === id })));
    if (state) {
      setState(prev => ({
        ...prev,
        variantlar: prev.variantlar.map(item =>
          item.id === id
            ? { ...item, is_true_edit: true }
            : { ...item, is_true_edit: false }
        )
      }));
    }
  };

  // Function to open modal for adding new math
  const openMathModalForAdding = (type, id = null) => {
    setMathTarget({ type, id, isAdding: true });
    setInitialMathFormula(''); // Empty for new formula
    setIsMathModalOpen(true);
  };

  // Function to handle click on an existing math element in the preview
  const handleMathElementClick = useCallback((latexString, startIndex, endIndex, contextType, contextId) => {
    setMathTarget({
      type: contextType,
      id: contextId,
      originalLatex: latexString,
      startIndex: startIndex,
      endIndex: endIndex,
      isAdding: false,
    });
    // Extract the formula without delimiters for initialValue
    const displayMode = latexString.startsWith('$$') && latexString.endsWith('$$');
    const formula = latexString.substring(displayMode ? 2 : 1, latexString.length - (displayMode ? 2 : 1));
    setInitialMathFormula(formula);
    setIsMathModalOpen(true);
  }, []);

  const handleMathConfirm = (formula) => {
    if (!mathTarget) {
      setIsMathModalOpen(false);
      setMathTarget(null);
      setInitialMathFormula('');
      return;
    }

    const newFormulaContent = formula.trim();

    // Determine the correct delimiters based on the original or default to display for new additions
    let updatedLatexString;
    if (mathTarget.isAdding) {
      updatedLatexString = `$$${newFormulaContent}$$`; // Default new additions to display
    } else if (mathTarget.originalLatex.startsWith('$$') && mathTarget.originalLatex.endsWith('$$')) {
      updatedLatexString = `$$${newFormulaContent}$$`;
    } else {
      updatedLatexString = `$${newFormulaContent}$`;
    }

    // Store old values for comparison
    const oldQuestionText = questionText;
    const oldOption = mathTarget.type === 'option' ? options.find(opt => opt.id === mathTarget.id) : null;

    // Handle empty formula: remove the expression
    if (!newFormulaContent) {
      if (!mathTarget.isAdding) { // Only remove if editing an existing one
        if (mathTarget.type === 'question') {
          const newQuestionText = questionText.substring(0, mathTarget.startIndex) + questionText.substring(mathTarget.endIndex);
          setQuestionText(newQuestionText);

          if (state) {
            setState(prev => ({
              ...prev,
              is_edit: prev.text != newQuestionText
            }));
          }
        } else if (mathTarget.type === 'option') {
          setOptions(prevOptions => prevOptions.map(opt =>
            opt.id === mathTarget.id ? { ...opt, text: opt.text.substring(0, mathTarget.startIndex) + opt.text.substring(mathTarget.endIndex) } : opt
          ));
          if (state) {
            setState(prev => ({
              ...prev,
              variantlar: prev.variantlar.map(item =>
                item.id == mathTarget.id
                  ? { ...item, is_edit: true }
                  : item
              )
            }));
          }
        }
      }
    } else { // Formula is not empty, add or replace
      if (mathTarget.isAdding) { // Adding new math
        if (mathTarget.type === 'question') {
          setQuestionText(prev => (prev ? prev + ' ' : '') + updatedLatexString);

          if (state) {
            setState(prev => ({
              ...prev,
              is_edit: true
            }));
          }
        } else if (mathTarget.type === 'option') {
          setOptions(prevOptions => prevOptions.map(opt =>
            opt.id === mathTarget.id ? { ...opt, text: (opt.text ? opt.text + ' ' : '') + updatedLatexString } : opt
          ));

          if (state) {
            setState(prev => ({
              ...prev,
              variantlar: prev.variantlar.map(item =>
                item.id == mathTarget.id
                  ? { ...item, is_edit: true }
                  : item
              )
            }));
          }
        }
      } else { // Editing existing math
        if (mathTarget.type === 'question') {
          const newQuestionText = questionText.substring(0, mathTarget.startIndex) +
            updatedLatexString +
            questionText.substring(mathTarget.endIndex);
          setQuestionText(newQuestionText);

          if (state) {
            setState(prev => ({
              ...prev,
              is_edit: prev.text != newQuestionText
            }));
          }
        } else if (mathTarget.type === 'option') {
          setOptions(prevOptions => prevOptions.map(opt => {
            if (opt.id === mathTarget.id) {
              const newOptionText = opt.text.substring(0, mathTarget.startIndex) +
                updatedLatexString +
                opt.text.substring(mathTarget.endIndex);
              return { ...opt, text: newOptionText };
            }
            return opt;
          }));

          if (state) {
            setState(prev => ({
              ...prev,
              variantlar: prev.variantlar.map(item =>
                item.id === mathTarget.id
                  ? { ...item, is_edit: true }
                  : item
              )
            }));
          }
        }
      }
    }

    console.log('math+>', mathTarget);
    console.log('state=>', state);

    setIsMathModalOpen(false);
    setMathTarget(null);
    setInitialMathFormula('');
  };




  const handleSave = async () => {
    if (!questionText.trim()) {
      setMessage('Savol matnini kiriting!');
      setMessageType('error');
      return;
    }
    for (let i = 0; i < options.length; i++) {
      if (!options[i].text.trim()) {
        setMessage('Javoblarni kiriting!');
        setMessageType('error');
        return;
      }
    }
    // Saqlash logikasi bu yerda bo'ladi
    let data;
    if (state) {
      data = {}

      data.test_id = Number(testID)
      data.key = testKey
      data.hash_url = hashUrl
      // if(state.is_edit) 
      data.text = state.is_edit ? questionText : null
      data.is_edit = state.is_edit
      // if(state.is_svg_json_edit) 
      data.svg_json = state.is_svg_json_edit ? svg_json : null
      data.is_svg_json_edit = state.is_svg_json_edit
      data.savol_id = Number(state.id)
      data.hash_id = state.hash_id
      data.new_variantlar = options
      data.old_variantlar = state.variantlar

      data = await updateSavol(data);
    }
    else {
      data = {
        test_id: Number(testID),
        key: testKey,
        hash_url: hashUrl,
        text: questionText,
        options: options,
        svg_json: svg_json
      }
      data = await createSavol(data);
    }
    // console.log(data);
    setMessage(data.message || 'Savol muvaffaqiyatli saqlandi!');
    setMessageType(data.status ? 'success' : 'error');
    if (data.status) setTimeout(() => navigate(`/test/questions/${testID}/${testKey}/${hashUrl}`), 1500);
  };





  return (
    <div className="add-question-page">
      <Message
        type={messageType}
        message={message}
        onClose={() => setMessage('')}
        duration={3000}
      />

      <MathModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onConfirm={handleMathConfirm}
        initialValue={initialMathFormula}
      />

      <div className="container">
        <div className="header-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i> Orqaga
          </button>
          <Title title="Yangi savol qo'shish" />
        </div>

        <div className="content-grid">
          {/* Savol qismi */}
          <div className="main-card">
            <div className="card-header question-header-with-math">
              <label>Savol matni</label>
              <button className="math-btn" onClick={() => openMathModalForAdding('question')}>
                <i className="bi bi-calculator"></i> Formula qo'shish
              </button>
            </div>
            <textarea
              placeholder="Savol matnini kiriting..."
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value)
                if (state) {
                  setState(prev => ({
                    ...prev,
                    is_edit: prev.text != e.target.value
                  }));
                }
                // if(state.text != e.target.value){
                //   state.is_edit = true
                // }
              }
              }
              className="question-input"
            />
            {questionText.includes('$') && (
              <div className="math-preview-box">
                <p className="math-preview-label">Jonli Preview: (Matematik ifodani tahrirlash uchun ustiga bosing)</p>
                <div className="math-preview-content">
                  <MathText
                    text={questionText}
                    onMathClick={handleMathElementClick}
                    contextType="question"
                  />
                </div>
              </div>
            )}
          </div>
          <div className='draw_svg'>
            <Draw json={svg_json} setJSON={setSVGJSON} setSVG={setSVG} state={state} setState={setState}></Draw>
            <SVGShow svg={svg} setSVG={setSVG}></SVGShow>
          </div>
          {/* Variantlar qismi */}
          <div className="options-section">
            <div className="section-header">
              <h3>Variantlar ({options.length})</h3>
              <p className="hint">To'g'ri javobni belgilashni unutmang</p>
            </div>

            <div className="options-list">
              {options.map((option, index) => (
                <div key={option.id} className={`option-card ${option.is_true ? 'active' : ''}`}>
                  <div className="option-prefix">
                    {String.fromCharCode(65 + index)}
                  </div>

                  <div className="option-main">
                    <input
                      type="text"
                      placeholder={`${index + 1}-variant matni`}
                      value={option.text}
                      onChange={(e) => {
                        handleOptionChange(option.id, e.target.value)
                      }
                      }
                    />
                    {option.text.includes('$') && (
                      <div className="math-preview-box-inline" style={{ marginTop: '8px' }}>
                        <MathText
                          text={option.text}
                          onMathClick={handleMathElementClick}
                          contextType="option"
                          contextId={option.id}
                        />
                      </div>
                    )}
                  </div>
                  <div className="option-actions">
                    <button
                      className="action-icon math"
                      onClick={() => openMathModalForAdding('option', option.id)}
                      title="Matematik ifoda"
                    >
                      <i className="bi bi-calculator"></i>
                    </button>

                    <button
                      className={`action-icon check ${option.is_true ? 'checked' : ''}`}
                      onClick={() => handleSetCorrect(option.id)}
                      title="To'g'ri javob"
                    >
                      <i className={`bi ${option.is_true ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                    </button>

                    <button
                      className="action-icon delete"
                      onClick={() => handleRemoveOption(option.id)}
                      disabled={options.length <= 2}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {options.length < 16 && (
              <button className="add-option-btn" onClick={handleAddOption}>
                <i className="bi bi-plus-lg"></i> Variant qo'shish
              </button>
            )}
          </div>

          <div className="footer-actions">
            <button className="cancel-btn" onClick={() => navigate(-1)}>Bekor qilish</button>
            {
              state ?
                <button className="save-btn" onClick={handleSave}>
                  <i className="bi bi-cloud-check"></i> Savolni yangilash
                </button>
                :
                <button className="save-btn" onClick={handleSave}>
                  <i className="bi bi-cloud-check"></i> Savolni saqlash
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;