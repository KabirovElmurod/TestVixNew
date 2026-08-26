const API = "http://localhost/api1";

export const loginUser = async (data) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const verify_token = async () => {
  // return false
  // return true
  const res = await fetch(`${API}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  let data = await res.json();

  if (data.status) {
    return data
  }
  else return false;
}

export const logoutUser = async () => {
  const res = await fetch(`${API}/auth/logout`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};