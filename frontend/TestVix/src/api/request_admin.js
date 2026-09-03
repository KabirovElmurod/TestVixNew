
let API = 'http://localhost/api1/users'
// let API = '/users'

export const get_users = async (data) => {
    console.log('Fetching users from API:', API);
    const res = await fetch(`${API}/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}
export const create_user = async (data) => {
    const res = await fetch(`${API}/create_user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}
export const update_user = async (data) => {
    const res = await fetch(`${API}/update_user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}

export const delete_user = async (data) => {
    const res = await fetch(`${API}/delete_user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}

export const search_users = async (data) => {
    const res = await fetch(`${API}/search_users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}