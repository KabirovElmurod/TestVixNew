import React, { useState } from 'react';
import TextArea from '../../../../components/ui/TextArea';

const JsonForm = ({ onJsonChange, jsonData }) => {
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    onJsonChange(json);
                } catch (error) {
                    alert('JSON fayl noto\'g\'ri formatda!');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleJsonInput = (value) => {
        try {
            if (value.trim()) {
                const json = JSON.parse(value);
                onJsonChange(json);
            } else {
                onJsonChange(null);
            }
        } catch (error) {
            // JSON is incomplete, don't update yet
        }
    };

    return (
        <div className='json_form'>
            <div className='json_upload_section'>
                <h3>JSON fayl yuklash</h3>
                <div className='file_upload'>
                    <input
                        type='file'
                        accept='.json'
                        onChange={handleFileUpload}
                        id='jsonFileInput'
                        className='file_input'
                    />
                    <label htmlFor='jsonFileInput' className='file_label'>
                        {fileName || 'Fayl tanlash'}
                    </label>
                </div>
            </div>

            <div className='json_input_section'>
                <h3>JSON matn kiritish</h3>
                <div className='json_textarea_wrapper'>
                    <TextArea
                        place="JSON formatidagi ma\'lumotlarni kiriting"
                        label="JSON ma\'lumotlar"
                        setNom={handleJsonInput}
                        nom={jsonData ? JSON.stringify(jsonData, null, 2) : ''}
                    />
                </div>
            </div>
        </div>
    );
};

export default JsonForm;
