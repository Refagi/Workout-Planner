const axios = window.axios; // Pastikan axios tersedia dari CDN

const baseURL = window.location.origin.includes('localhost')
  ? 'http://localhost:3000/v1'
  : 'https://workout-planner-2pch.vercel.app/v1';

// Buat instance Axios
const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor untuk menambahkan access token ke setiap permintaan
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('https://workout-planner-2pch.vercel.app/v1/auth/refresh-tokens', {
          refreshToken
        });
        const { access, refresh } = response.data;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.setItem('accessToken', access.token);
        localStorage.setItem('refreshToken', refresh.token);

        originalRequest.headers.Authorization = `Bearer ${access.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // await Swal.fire({
        //   icon: 'error',
        //   title: 'Sesi Kadaluarsa',
        //   text: 'Sesi Anda telah berakhir. Silakan login ulang.',
        //   confirmButtonText: 'Login Sekarang',
        //   showCancelButton: true,
        //   cancelButtonText: 'Batal',
        //   background: '#1a1a1a',
        //   color: '#ffffff',
        //   customClass: {
        //     popup: 'custom-swal-popup',
        //     confirmButton: 'custom-swal-confirm',
        //     cancelButton: 'custom-swal-cancel'
        //   }
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     localStorage.removeItem('accessToken');
        //     localStorage.removeItem('refreshToken');
        //     localStorage.removeItem('userId');
        //     window.location.href = '/auth';
        //   }
        // });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Ekspor instance Axios ke window.api
window.api = api;
