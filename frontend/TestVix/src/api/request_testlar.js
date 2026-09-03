const API_URl_testlar = 'http://localhost/api2/testlar'; // testlar url
const API_URL_admin_testlar = 'http://localhost/api2/testlar/admin'

export const profile_img = () => {
    return '../public/profile.png'
}
export const logo_img = () => {
    return '../public/testvix.png'
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

// Admin-specific API functions
export const adminGetAllTests = async (params = {}) => {
    const { search = '', fan = '', ispublic = null, skip = 0, user_id = 0 } = params;
    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (fan) queryParams.append('fan', fan);
    if (ispublic !== null) queryParams.append('ispublic', String(ispublic));
    if (user_id !== 0) queryParams.append('user_id', String(user_id));
    queryParams.append('skip', String(skip));

    const res = await fetch(`${API_URL_admin_testlar}/all?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
    }

    return res.json();
};

export const adminGetStats = async () => {
    const res = await fetch(`${API_URL_admin_testlar}/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminGetTestById = async (testId) => {
    const res = await fetch(`${API_URL_admin_testlar}/${testId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) {
        console.error('Error fetching test by ID:', res.status, res.statusText);
        return null;
    }
    return res.json();
};

export const adminCreateTest = async (testData) => {
    const res = await fetch(`${API_URL_admin_testlar}/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });
    return res.json();
};

export const adminUpdateTest = async (testId, testData) => {
    const res = await fetch(`${API_URL_admin_testlar}/update/${testId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });
    return res.json();
};

export const adminDeleteTest = async (testId) => {
    const res = await fetch(`${API_URL_admin_testlar}/${testId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

// Hashtag API functions
export const adminGetAllHashtags = async () => {
    const res = await fetch(`${API_URL_admin_testlar}/hashtags`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminCreateHashtag = async (name) => {
    const res = await fetch(`${API_URL_admin_testlar}/hashtags/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    });
    return res.json();
};

export const adminDeleteHashtag = async (hashtagId) => {
    const res = await fetch(`${API_URL_admin_testlar}/hashtags/${hashtagId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminUpdateHashtag = async (hashtagId, name) => {
    const res = await fetch(`${API_URL_admin_testlar}/hashtags/${hashtagId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    });
    return res.json();
};

export const adminAddHashtagToTest = async (testId, hashtagId, tag = true) => {
    const res = await fetch(`${API_URL_admin_testlar}/${testId}/hashtags`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hashtag_id: hashtagId, tag })
    });
    return res.json();
};

export const adminRemoveHashtagFromTest = async (testId, hashtagId) => {
    const res = await fetch(`${API_URL_admin_testlar}/${testId}/hashtags/${hashtagId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};

export const adminGetTestHashtags = async (testId) => {
    const res = await fetch(`${API_URL_admin_testlar}/${testId}/hashtags`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
};