const API_URl_testlar = 'http://localhost/api2/testlar'; // testlar url


export const profile_img = () => {
    return '../public/profile.png'
}

// get test public
export const getPublicTest = async (data) => {
    const res = await fetch(`${API_URl_testlar}/testlar`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json();
}

export const getShowTest = async (data) => {
    const res = await fetch(`${API_URl_testlar}/get_show_test`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    );
    return res.json();
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

export const createTestWithJsonPost = async (postData) => {
    const res = await fetch(`${API_URl_testlar}/create_test_with_json`, {
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

export const getSearchTest = async (data) => {
    const res = await fetch(`${API_URl_testlar}/search_test`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res.json();
}