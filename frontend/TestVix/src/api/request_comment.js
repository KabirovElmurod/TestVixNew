// const API_URL_comment = 'http://localhost:8003/comments'
let API_URL_comment = "http://localhost/api4/comments/";
export const getRoomMessages = async (roomId) => {
  const res = await fetch(`${API_URL_comment}/room/${roomId}/messages`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.json();
};

export const flushRoomMessages = async (roomId) => {
  const res = await fetch(`${API_URL_comment}/room/${roomId}/flush`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.json();
};


export const sendComment = async (data) => {
    let response = await fetch(API_URL_comment + "aloqa", {
        method: "POST",
        credentials: "include",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
}