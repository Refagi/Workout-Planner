$(document).ready(function () {
  function verifyEmail() {
    // Ambil token dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('token') || localStorage.getItem('verifyToken');

    if (verifyToken) {
      submitVerificationToken(verifyToken);
    }

    // Tangani submit form
    $('#verif-form').on('submit', async function (event) {
      event.preventDefault();

      const token = $('#verifyEmailToken').val() || verifyToken;

      if (!token) {
        Swal.fire({
          title: 'Error!',
          text: 'Verification token not found!',
          icon: 'error',
          background: '#1a1a1a',
          color: '#ffffff'
        });
        return;
      }

      submitVerificationToken(token);
    });
  }

  async function submitVerificationToken(token) {
    Swal.fire({
      title: 'Loading...',
      text: 'Verifying your email...',
      allowOutsideClick: false,
      background: '#1a1a1a',
      color: '#ffffff',
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await axios.get(
        `http://localhost:3000/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      console.log('Response from /v1/auth/verify-email:', result);

      await Swal.fire({
        title: response.status === 200 ? 'Success!' : 'Warning!',
        text:
          response.status === 200
            ? 'Email verified successfully! Please login.'
            : result.message || 'Something went wrong',
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('verifyToken');
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
  }

  verifyEmail();
});
