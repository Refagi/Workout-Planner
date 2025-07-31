$(document).ready(function () {
  function sendVerificationEmail() {
    $('#verif-form').on('submit', async function (event) {
      event.preventDefault();

      // Ambil token dari localStorage (sesuaikan dengan register.js)
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        Swal.fire({
          title: 'Error!',
          text: 'No access token found. Please register again.',
          icon: 'error',
          background: '#1a1a1a',
          color: '#ffffff',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm'
          }
        });
        $('#verif-section').hide();
        $('#register-section').show();
        return;
      }

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
        const response = await axios.post(
          'https://workout-planner-2pch.vercel.app/v1/auth/send-verification-email',
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        const result = response.data;

        await Swal.fire({
          title: response.status === 200 ? result.message : 'Warning!',
          text: response.status === 200 ? 'Verification sent to your email' : result.message || 'Something went wrong',
          icon: response.status === 200 ? 'success' : 'warning',
          background: '#1a1a1a',
          color: '#ffffff',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm'
          }
        });

        if (response.status === 200) {
          localStorage.setItem('verifyToken', result.tokens);
          $('#verif-section').hide();
          $('#login-section').show();
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

  sendVerificationEmail();
});
