import React, { useState } from 'react';

const JsonStructure = () => {
    const [copied, setCopied] = useState(false);

    const jsonExample = {
        nom: "Matematika testi",
        fan: "Matematika",
        tavsif: "Matematika fanidan test",
        ispublic: true,
        istime: true,
        time: 30,
        savollar: [
            {
                savol: "15 + 15 = ?",
                javob: 2,
                variantlar: ["25", "33", "30", "40"],
            },
            {
                savol: "10 * 5 = ?",
                javob: 0,
                variantlar: ["50", "45", "54", "55"],
            }
        ]
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(jsonExample, null, 4));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='json_structure'>
            <div className='json_header'>
                <h3>JSON formati:</h3>
                <button
                    className='copy_button'
                    onClick={handleCopy}
                    title='Nusxa olish'
                >
                    {copied ? '✓ Nusxa olindi!' : '📋 Nusxa olish'}
                </button>
            </div>
            <pre className='json_example'>
                {JSON.stringify(jsonExample, null, 4)}
            </pre>
            {/* <div className='json_fields'>
                <h4>Test maydonlari:</h4>
                <ul>
                    <li><strong>nom</strong>: Test nomi (matn)</li>
                    <li><strong>fan</strong>: Test fani (matn)</li>
                    <li><strong>tavsif</strong>: Test tavsifi (matn)</li>
                    <li><strong>ispublic</strong>: Public yoki Private (boolean)</li>
                    <li><strong>istime</strong>: Vaqtli yoki vaqtsiz (boolean)</li>
                    <li><strong>time</strong>: Vaqt (minut, son)</li>
                </ul>
                <h4>Savol maydonlari (savollar array):</h4>
                <ul>
                    <li><strong>savol</strong>: Savol matni (matn)</li>
                    <li><strong>javob</strong>: To'g'ri javob (matn)</li>
                    <li><strong>variantlar</strong>: Variantlar ro'yxati (array)</li>
                    <li><strong>tavsif</strong>: Savol tavsifi (ixtiyoriy, matn)</li>
                </ul>
            </div> */}
        </div>
    );
};

export default JsonStructure;
