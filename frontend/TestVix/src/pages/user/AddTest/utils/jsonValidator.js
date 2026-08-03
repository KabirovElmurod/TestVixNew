export const validateTestData = (data) => {
    const errors = [];

    if (!data.nom || typeof data.nom !== 'string' || data.nom.trim() === '') {
        errors.push('nom maydoni to\'ldirilishi shart (matn)');
    }

    if (!data.fan || typeof data.fan !== 'string' || data.fan.trim() === '') {
        errors.push('fan maydoni to\'ldirilishi shart (matn)');
    }

    if (!data.tavsif || typeof data.tavsif !== 'string' || data.tavsif.trim() === '') {
        errors.push('tavsif maydoni to\'ldirilishi shart (matn)');
    }

    if (typeof data.ispublic !== 'boolean') {
        errors.push('ispublic maydoni boolean (true/false) bo\'lishi shart');
    }

    if (typeof data.istime !== 'boolean') {
        errors.push('istime maydoni boolean (true/false) bo\'lishi shart');
    }

    if (typeof data.time !== 'number' || data.time < 0) {
        errors.push('time maydoni musbat son bo\'lishi shart');
    }

    // Validate savollar array if it exists
    if (data.savollar && Array.isArray(data.savollar)) {
        data.savollar.forEach((savol, index) => {
            if (!savol.savol || typeof savol.savol !== 'string' || savol.savol.trim() === '') {
                errors.push(`savollar[${index}].savol maydoni to\'ldirilishi shart`);
            }
            if (typeof savol.javob !== 'number' || savol.javob < 0 || savol.javob >= (savol.variantlar ? savol.variantlar.length : 0)) {
                errors.push(`savollar[${index}].javob maydoni to\'ldirilishi shart`);
            }
            if (!savol.variantlar || !Array.isArray(savol.variantlar) || savol.variantlar.length < 2) {
                errors.push(`savollar[${index}].variantlar kamida 2 ta variant bo'lishi shart`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const formatJsonData = (jsonData) => {
    return {
        nom: jsonData.nom || '',
        fan: jsonData.fan || '',
        tavsif: jsonData.tavsif || '',
        ispublic: typeof jsonData.ispublic === 'boolean' ? jsonData.ispublic : true,
        istime: typeof jsonData.istime === 'boolean' ? jsonData.istime : true,
        time: typeof jsonData.time === 'number' ? jsonData.time : 15,
        savollar: jsonData.savollar || []
    };
};
