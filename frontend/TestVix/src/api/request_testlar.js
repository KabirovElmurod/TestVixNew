const API_URl_testlar = 'http://localhost/api1/testlar'; // testlar url


export const profile_img = () => {
    return '../public/profile.png'
}

// test create post api
export const createTestPost = async (postData) => {
    const res = await fetch(`${API_URl_testlar}/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    return res.json();
}

export const getTestGet = async () => {
    const res = await fetch(`${API_URl_testlar}/get_test_by_user_id`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return res.json();
}

export const deleteTestPost = async (id, key, hash_url) => {
    const res = await fetch(`${API_URl_testlar}/delete_test/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            'id': id,
            'key': key,
            'hash_url': hash_url
        })

    })
    return res.json();
}


export const updateTestPost = async (postData) => {
    const res = await fetch(`${API_URl_testlar}/update_test/${postData.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    return res.json();
}