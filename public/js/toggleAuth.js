$(document).ready(function () {
  // Toggle password visibility
  function togglePassword() {
    $('.toggle-password').on('click', function () {
      let inputLogin = $('#loginPassword');
      let inputRegist = $('#registerPassword');
      inputLogin.attr('type', inputLogin.attr('type') === 'password' ? 'text' : 'password');
      inputRegist.attr('type', inputRegist.attr('type') === 'password' ? 'text' : 'password');
      $(this).toggleClass('fa-eye fa-eye-slash');
    });
  }

  // Form switching
  function switchForms() {
    $('#toRegister').click(() => {
      $('#login-section').slideUp(300, () => {
        $('#register-section').slideDown(300);
      });
    });

    $('#toLogin').click(() => {
      $('#register-section').slideUp(300, () => {
        $('#login-section').slideDown(300);
      });
    });

    $('#toForgot').click(() => {
      $('#login-section').slideUp(300, () => {
        $('#forgot-section').slideDown(300);
      });
    });

    $('#backToLogin').click(() => {
      $('#login-section').show();
      $('#forgot-section').hide();
    });
  }
  togglePassword();
  switchForms();
});
