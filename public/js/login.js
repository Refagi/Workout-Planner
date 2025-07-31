$(document).ready(function () {
  function login() {
    $('#login-form').on('submit', async function (event) {
      event.preventDefault();

      const email = $('#loginEmail').val();
      const password = $('#loginPassword').val();

      const requestData = { email, password };

      Swal.fire({
        title: 'Loading...',
        text: 'Please wait...',
        allowOutsideClick: false,
        background: '#1a1a1a',
        color: '#ffffff',
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await axios.post('https://workout-planner-2pch.vercel.app/v1/auth/login', requestData, {
          headers: { 'Content-Type': 'application/json' }
        });

        const result = response.data;
        await Swal.fire({
          title: response.status === 200 ? result.message : 'Warning!',
          text: response.status === 200 ? 'Berhasil Login!' : result.message || 'Something went wrong',
          icon: response.status === 200 ? 'success' : 'warning',
          confirmButtonText: 'OK',
          background: '#1a1a1a',
          color: '#ffffff',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm'
          }
        });

        if (response.status === 200) {
          localStorage.setItem('accessToken', result.tokens.access.token);
          localStorage.setItem('refreshToken', result.tokens.refresh.token);
          localStorage.setItem('userId', result.data.id);
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Error:', err);
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || 'Internal server error!',
          icon: 'error',
          background: '#1a1a1a',
          color: '#ffffff'
        });
      }
    });
  }

  login();
});
