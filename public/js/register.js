$(document).ready(function () {
  function register() {
    $('#register-form').on('submit', async function (event) {
      event.preventDefault();

      const email = $('#registerEmail').val();
      const password = $('#registerPassword').val();

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
        const response = await axios.post('https://workout-planner-2pch.vercel.app/v1/auth/register', requestData, {
          headers: { 'Content-Type': 'application/json' }
        });

        const result = response.data;
        await Swal.fire({
          title: response.status === 201 ? result.message : 'Warning!',
          text:
            response.status === 201
              ? 'Registrasi berhasil, silahkan kirim verifikasi Email'
              : result.message || 'Something went wrong',
          icon: response.status === 201 ? 'success' : 'warning',
          confirmButtonText: 'OK',
          background: '#1a1a1a',
          color: '#ffffff',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm'
          }
        });

        if (response.status === 201) {
          localStorage.setItem('accessToken', result.tokens.access.token);
          $('#register-section').fadeOut(300, () => {
            $('#verif-section').fadeIn(300);
          });
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

  register();
});
