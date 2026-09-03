let API_URL = "http://localhost/api4/comments/";

export const sendComment = async (data) => {
    let response = await fetch(API_URL + "aloqa", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
}