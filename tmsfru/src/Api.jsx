// api.js
const BASE_URL = 'http://localhost:2000'; // Update with your actual backend URL

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.success) {
            // Save user data to secure storage
            localStorage.setItem('user', JSON.stringify(data.user));
          }
      
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const signupUser = async (name, email, password, role) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};
