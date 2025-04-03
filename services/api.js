import axios from 'axios';

const API_URL = 'http://192.168.0.103:3000/api'; // Replace with your backend URL

export const sendOTP = async ({ mobile, email }) => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, { email }); // Send only email to the backend
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error in sendOTP:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || error.message };
  }
};
export const verifyOTP = async ({ email, otp }) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error in verifyOTP:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || error.message };
  }
};
export const getUserProfile = async (mobile) => {
  const response = await axios.get(`${API_URL}/profile/${mobile}`);
  return response.data;
};

export const uploadImage = async (imageUri, userName, location) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'road_damage.jpg',
  });
  formData.append('userName', userName);
  formData.append('location', location);
  formData.append('date', new Date().toISOString().split('T')[0]);
  formData.append('time', new Date().toLocaleTimeString());

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};