const API_URl_savollar = 'http://localhost/api3/savollar';


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