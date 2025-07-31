$(document).ready(function () {
  function logout() {
    $('.btn-logout').on('click', async function (event) {
      event.preventDefault();

      const refreshToken = localStorage.getItem('refreshToken');

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
          'https://workout-planner-2pch.vercel.app/v1/auth/logout',
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const result = response.data;
        await Swal.fire({
          title: response.status === 200 ? result.message : 'Warning!',
          text: response.status === 200 ? 'Berhasil logout!' : result.message || 'Something went wrong',
          icon: response.status === 200 ? 'success' : 'warning',
          confirmButtonText: 'OK',
          background: '#1a1a1a',
          color: '#ffffff',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm'
          }
        });
        window.location.reload();

        if (response.status === 200) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          $('.btn-logout').hide();
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

  logout();
});
