let API = "http://localhost/api1";


export const getAvatar = (url) => {

  return url ? API + url : null
}



// API += '/auth';

// Get current user profile
export const getProfile = async () => {
  const res = await fetch(`${API}/auth/profile/me`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// Update user profile
export const updateProfile = async (profileData) => {
  const res = await fetch(`${API}/auth/profile/me`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData)
  });
  return res.json();
};

// Change password
export const changePassword = async (passwordData) => {
  const res = await fetch(`${API}/auth/profile/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData)
  });
  return res.json();
};

// Get user statistics
export const getUserStats = async () => {
  const res = await fetch(`${API}/auth/profile/stats`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// Get user test results
export const getUserResults = async (page = 0, limit = 20) => {
  const res = await fetch(`${API}/auth/profile/results?page=${page}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// Delete user account
export const deleteAccount = async (confirmation, reason = null) => {
  const url = reason
    ? `${API}/auth/profile/delete?confirmation=${confirmation}&reason=${encodeURIComponent(reason)}`
    : `${API}/auth/profile/delete?confirmation=${confirmation}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

// Upload avatar as file
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API}/auth/profile/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData
  });
  return res.json();
};

// Get avatar from cache or localStorage
export const getCachedAvatar = (userId) => {
  // const cached = localStorage.getItem(`user_avatar_${userId}`);
  const cached = localStorage.getItem(`user_avatar`);
  return cached ? cached : null;
};

// Cache avatar
export const cacheAvatar = (userId, avatarData) => {
  // localStorage.setItem(`user_avatar_${userId}`, avatarData);
  localStorage.setItem(`user_avatar`, avatarData);
};

// Clear avatar cache
export const clearAvatarCache = (userId) => {
  localStorage.removeItem(`user_avatar`);
};