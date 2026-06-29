const API_URl_savollar = 'http://localhost/api2/savollar/';


export const getSavollar = async (data) => {
    const res = await fetch(`${API_URl_savollar}/get_savollar`, {
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
