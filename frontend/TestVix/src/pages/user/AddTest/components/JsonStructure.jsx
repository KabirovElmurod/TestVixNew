import React, { useState } from 'react';

const JsonStructure = () => {
    const [copied, setCopied] = useState(false);
    const jsonShow = {

        nom: "Matematika testi",
        fan: "Matematika",
        tavsif: "Matematika fanidan test",
        ispublic: true,
        istime: true,
        time: 30,
        savollar: [
            {
                savol: "15 + 15 = ?",
                svg_json: {
                    "elements": []
                },
                // { "elements": [] },
                javob: 2,
                variantlar: ["25", "33", "30", "40"],
            },
            {
                savol: "Agar x = 4 bo'lsa, $$\sum_0^ 4x +\int_4 ^ 2x ^ 2 + x=?$$ ",
                javob: 0,
                variantlar: ["50", "45", "54", "55"],
            }
        ]

    }
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
                svg_json: {
                    "elements": [
                        {
                            "id": "nF59_ryS4nznpGKKPzZfD",
                            "type": "arrow",
                            "x": 318.39997482299805,
                            "y": 76.20002746582031,
                            "width": 120.80001068115234,
                            "height": 71.99996948242188,
                            "angle": 0,
                            "strokeColor": "#1e1e1e",
                            "backgroundColor": "transparent",
                            "fillStyle": "solid",
                            "strokeWidth": 2,
                            "strokeStyle": "solid",
                            "roughness": 1,
                            "opacity": 100,
                            "groupIds": [],
                            "frameId": null,
                            "index": "a0",
                            "roundness": {
                                "type": 2
                            },
                            "seed": 1774150722,
                            "version": 199,
                            "versionNonce": 607999108,
                            "isDeleted": true,
                            "boundElements": null,
                            "updated": 1787399676591,
                            "link": null,
                            "locked": false,
                            "points": [
                                [
                                    0,
                                    0
                                ],
                                [
                                    94.89992141723633,
                                    13.175025939941406
                                ],
                                [
                                    120.80001068115234,
                                    71.99996948242188
                                ]
                            ],
                            "lastCommittedPoint": null,
                            "startBinding": null,
                            "endBinding": null,
                            "startArrowhead": null,
                            "endArrowhead": "arrow",
                            "elbowed": false
                        },
                        {
                            "id": "uYp0BT_K53373W04dH4ou",
                            "type": "ellipse",
                            "x": 232.49996948242188,
                            "y": 20.574996948242188,
                            "width": 212.800048828125,
                            "height": 217.60000610351562,
                            "angle": 0,
                            "strokeColor": "#1e1e1e",
                            "backgroundColor": "transparent",
                            "fillStyle": "solid",
                            "strokeWidth": 1,
                            "strokeStyle": "solid",
                            "roughness": 0,
                            "opacity": 100,
                            "groupIds": [],
                            "frameId": null,
                            "index": "a1",
                            "roundness": {
                                "type": 2
                            },
                            "seed": 996456636,
                            "version": 96,
                            "versionNonce": 1623925820,
                            "isDeleted": false,
                            "boundElements": null,
                            "updated": 1787399703468,
                            "link": null,
                            "locked": false
                        },
                        {
                            "id": "yllOowUU--qP6GuIgBpee",
                            "type": "line",
                            "x": 336.4999694824219,
                            "y": 124.57499694824219,
                            "width": 109.60003662109375,
                            "height": 0,
                            "angle": 0,
                            "strokeColor": "#e03131",
                            "backgroundColor": "transparent",
                            "fillStyle": "solid",
                            "strokeWidth": 1,
                            "strokeStyle": "solid",
                            "roughness": 0,
                            "opacity": 100,
                            "groupIds": [],
                            "frameId": null,
                            "index": "a2",
                            "roundness": {
                                "type": 2
                            },
                            "seed": 647560452,
                            "version": 42,
                            "versionNonce": 477136828,
                            "isDeleted": false,
                            "boundElements": null,
                            "updated": 1787399712431,
                            "link": null,
                            "locked": false,
                            "points": [
                                [
                                    0,
                                    0
                                ],
                                [
                                    109.60003662109375,
                                    0
                                ]
                            ],
                            "lastCommittedPoint": null,
                            "startBinding": null,
                            "endBinding": null,
                            "startArrowhead": null,
                            "endArrowhead": null
                        },
                        {
                            "id": "O29E8249ztSzPFTp84fBQ",
                            "type": "text",
                            "x": 349.2999572753906,
                            "y": 89.41940378764436,
                            "width": 38.879974365234375,
                            "height": 27,
                            "angle": 0,
                            "strokeColor": "#e03131",
                            "backgroundColor": "transparent",
                            "fillStyle": "solid",
                            "strokeWidth": 1,
                            "strokeStyle": "solid",
                            "roughness": 0,
                            "opacity": 100,
                            "groupIds": [],
                            "frameId": null,
                            "index": "a3",
                            "roundness": null,
                            "seed": 1761620028,
                            "version": 44,
                            "versionNonce": 1402052540,
                            "isDeleted": false,
                            "boundElements": null,
                            "updated": 1787399770279,
                            "link": null,
                            "locked": false,
                            "text": "5sm",
                            "fontSize": 20,
                            "fontFamily": 6,
                            "textAlign": "left",
                            "verticalAlign": "top",
                            "containerId": null,
                            "originalText": "5sm",
                            "autoResize": true,
                            "lineHeight": 1.35
                        }
                    ]
                },
                // { "elements": [] },
                javob: 2,
                variantlar: ["25", "33", "30", "40"],
            },
            {
                savol: "Agar x = 4 bo'lsa, $$\sum_0^ 4x +\int_4 ^ 2x ^ 2 + x=?$$ ",
                javob: 0,
                variantlar: ["50", "45", "54", "55"],
            }
        ]
    };
    const prompt = `
        Yuqoridagi test, shunchaki namuna, qanday qilish kerakligi, xatosini topma.
        Sen testlarini tuzish bo‘yicha kuchli mutaxassissan.
        Sen Excalidraw JSON bilan ham ishlashni bilasan.

        Mening vazifam:
        Men senga test qanday bo‘lishini aytaman.
        Sen testni tuzasan, matematik jihatdan tekshirasan va menga 2 QISMDA qaytarasan:

        1-QISM — TESTNI ODDIY YOZUV KO‘RINISHIDA
        Avval yaratgan barcha savollaringni menga o‘qishga qulay formatda ko‘rsat:

        1. Savol
        A) ...
        B) ...
        C) ...
        D) ...

        To‘g‘ri javob: C

        2. Savol
        A) ...
        B) ...
        C) ...
        D) ...

        To‘g‘ri javob: A

        Agar savolda matematik formula bo‘lsa, uni chiroyli matematik formatda ko‘rsat.

        Agar savolga rasm qo‘shilgan bo‘lsa, yozuv ko‘rinishidagi qismda:
        "[Bu savol uchun Excalidraw rasm mavjud]"
        deb ko‘rsat.

        2-QISM — JSON
        Yuqoridagi aynan o‘sha savollarni mening JSON formatimda qaytar.

        MUHIM:
        JSON va yozuv ko‘rinishidagi savollar BIR XIL bo‘lishi kerak.
        JSONdagi savol, variantlar va javob yozuvdagi versiya bilan aynan mos bo‘lsin.
        
        

        QOIDALAR:

            - Har bir savolda 4 ta variant bo‘lsin.
            - "javob" 0 dan boshlanadigan indeks bo‘lsin.
            - 0 = birinchi variant.
            - 1 = ikkinchi variant.
            - 2 = uchinchi variant.
            - 3 = to‘rtinchi variant.
            - Har bir savolda aynan bitta to‘g‘ri javob bo‘lsin.
            - Matematik hisob-kitoblarni tekshir.
            - Noto‘g‘ri variantlar mantiqan ishonarli bo‘lsin.
            - Matematik formulalar kerak bo‘lsa LaTeX ishlat.
        
        MUHIM:
            Men testni ko‘rib chiqishim uchun avval oddiy yozuv ko‘rinishini ko‘rsat.
            Keyin JSONni ber.

            Agar men:
            - "2-savolni o‘zgartir"
            - "3-savolga rasm qo‘sh"
            - "savollarni qiyinlashtir"
            - "4-savolni olib tashla"
            - "yana 5 ta savol qo‘sh"

            desam, o‘zgarishni amalga oshir va yana:
            1. yangilangan testni yozuv ko‘rinishida;
            2. yangilangan to‘liq JSONni
            qaytar.

            Agar topshiriq aniq bo‘lsa, ortiqcha savol berma.
            Agar test yaratish uchun muhim ma’lumot yetishmasa, avval mendan so‘ra.

            JSON valid bo‘lishi shart.
    `

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(jsonExample, null, 4) + prompt);
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
                {JSON.stringify(jsonShow, null, 4)}
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
