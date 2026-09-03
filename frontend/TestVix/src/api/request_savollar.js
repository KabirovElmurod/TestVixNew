const API_URl_savollar = 'http://localhost/api3/savollar';
const API_URL_admin_savollar = 'http://localhost/api3/savollar/admin';


export const getSavol = async (data) => {
    const res = await fetch(`${API_URl_savollar}/get_savol`, {
        method: 'POST',
        'credentials': 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)

    }
    );
    return res.json();
}




export const getSavolById = async (data) => {
    const res = await fetch(`${API_URl_savollar}/get_savollar_by_id`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}


export const createSavol = async (savolData) => {
    const res = await fetch(`${API_URl_savollar}/create_savol`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(savolData)
    });
    return res.json();
}


export const updateSavol = async (savolData) => {
    const res = await fetch(`${API_URl_savollar}/update_savol`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(savolData)
    });
    return res.json();
}



export const deleteSavol = async (data) => {
    const res = await fetch(`${API_URl_savollar}/delete_savol`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}

export const finishSavol = async (data) => {
    const res = await fetch(`${API_URl_savollar}/finish_savol`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}

// Admin-specific API functions for questions and variants
export const adminGetQuestionsByTestId = async (testId) => {
    console.log('test_id=>', testId);

    const res = await fetch(`${API_URL_admin_savollar}/test/${testId}/questions`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminGetQuestionById = async (questionId) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminCreateQuestion = async (questionData) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
    });
    return res.json();
};

export const adminUpdateQuestion = async (questionId, questionData) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
    });
    return res.json();
};

export const adminDeleteQuestion = async (questionId) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminGetVariantsByQuestionId = async (questionId) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}/variants`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) {
        console.error('Error fetching variants:', res.status, res.statusText);
        return [];
    }
    return res.json();
};

export const adminCreateVariant = async (questionId, variantData) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}/variants`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(variantData)
    });
    return res.json();
};

export const adminUpdateVariant = async (questionId, variantId, variantData) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}/variants/${variantId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(variantData)
    });
    return res.json();
};

export const adminDeleteVariant = async (questionId, variantId) => {
    const res = await fetch(`${API_URL_admin_savollar}/questions/${questionId}/variants/${variantId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

// Variant operations are handled through question update endpoint
export const adminUpdateQuestionWithVariants = async (questionId, questionData, newVariants = [], oldVariants = []) => {
    const res = await fetch(`${API_URl_savollar}/update_savol`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            test_id: questionData.test_id,
            key: String(questionData.test_id),
            hash_url: questionData.hash_url || '',
            savol_id: questionId,
            hash_id: questionData.hash_id || '',
            text: questionData.text,
            new_variantlar: newVariants,
            old_variantlar: oldVariants,
            svg_json: questionData.svg_json,
            is_edit: true,
            is_svg_json_edit: false
        })
    });
    return res.json();
};