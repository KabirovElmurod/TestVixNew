import React from 'react';
import Input from '../../../../components/ui/Input';
import TextArea from '../../../../components/ui/TextArea';
import Check from '../../../../components/ui/Check';

const TestForm = ({
    nom,
    fan,
    tavsif,
    visiable,
    istime,
    time,
    setNom,
    setFan,
    setTavsif,
    setVisiable,
    setIsTime,
    setTime,
    handleAddTime
}) => {
    const times = [
        { name: '15 min', value: 15 },
        { name: '30 min', value: 30 },
        { name: '45 min', value: 45 },
        { name: '1 soat', value: 60 },
        { name: '1.5 soat', value: 90 },
        { name: '2 soat', value: 120 },
    ];

    return (
        <div className='add_test_inputs'>
            <div className='add_test_div'>
                <Input 
                    place="Test Nomi" 
                    label="Test Nomi" 
                    setNom={setNom} 
                    nom={nom}
                />
                <Input 
                    place="Test Fani" 
                    label="Test Fani" 
                    setNom={setFan} 
                    nom={fan}
                />
            </div>
            
            <div className='add_test_div'>
                <TextArea 
                    place="Test Tavsifi" 
                    label="Test Tavsifi" 
                    setNom={setTavsif} 
                    nom={tavsif}
                />
            </div>
            
            <div className='add_test_div'>
                <Check 
                    set={setVisiable} 
                    item={visiable} 
                    theme='Private va Public' 
                    name="visiable" 
                    label1="Private" 
                    label2="Public" 
                    id1="private_id" 
                    id2="public_id" 
                    comment1="Hech kim ko'ra olmaydi" 
                    comment2="Hammaga ko'rinadi"
                />
                <Check 
                    set={setIsTime} 
                    item={istime} 
                    theme='Vaqtli va Vaqtsiz' 
                    name="time" 
                    label1="Vaqtsiz" 
                    label2="Vaqtli" 
                    id1="vaqtsiz_id" 
                    id2="vaqtli_id" 
                    comment1="Vaqtsiz" 
                    comment2="Vaqtli"
                />
            </div>
            
            <div className='add_test_div add_test_div_time'>
                <div className='add_test_div_time_input'>
                    <Input 
                        place="Vaqt" 
                        label="Vaqt (minut)" 
                        setNom={setTime} 
                        nom={time} 
                        disabled={istime}
                    />
                    {istime ? (
                        <div className='add_test_div_time_input_button'>
                            <button onClick={() => handleAddTime('-')}>-</button>
                            <button onClick={() => handleAddTime('+')}>+</button>
                        </div>
                    ) : (
                        <div className='add_test_div_time_input_button_disabled'>
                            <button>-</button>
                            <button>+</button>
                        </div>
                    )}
                </div>
                
                <div className='time_btn_set'>
                    {istime && times.map((item, index) => (
                        <button 
                            key={index} 
                            onClick={() => setTime(item.value)}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestForm;
