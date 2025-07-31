$(document).ready(() => {
  // Inisialisasi variabel global
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');
  const planId = localStorage.getItem('planId');
  const api = window.api;
  let currentPlanData = null;
  let currentExercises = null;

  function isLogin() {
    if (!token) {
      showAlert({
        icon: 'warning',
        title: 'Forbiden!',
        text: 'Anda belum login, silahkan login terlebih dahulu',
        confirmButtonText: 'OK'
      });
      return;
    } else {
      $('.btn-logout').show();
    }
  }

  function showAlert({ icon, title, text, html, confirmButtonText, showCancelButton = false, cancelButtonText }) {
    const config = {
      icon,
      title,
      confirmButtonText,
      showCancelButton,
      cancelButtonText,
      background: '#1a1a1a',
      color: '#ffffff',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      }
    };
    if (html) {
      config.html = html;
    } else if (text) {
      config.text = text;
    }
    console.log('SweetAlert config:', config); // Debugging
    return Swal.fire(config);
  }

  // Fungsi untuk memeriksa apakah API tersedia
  function checkApiAvailability() {
    if (!api) {
      showAlert({
        icon: 'error',
        title: 'Kesalahan Sistem',
        text: 'Gagal memuat konfigurasi API. Silakan refresh halaman atau hubungi dukungan.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    return true;
  }

  // Fungsi untuk mengatur smooth scroll pada link navigasi
  function setupSmoothScroll() {
    $('a[href^="#"]').on('click', function (e) {
      e.preventDefault();
      const target = $(this).attr('href');
      if ($(target).length) {
        $('html, body').animate({ scrollTop: $(target).offset().top }, 1000);
      }
    });
  }

  // Fungsi untuk merender goalSection saat tidak ada token
  function renderDefaultGoalSection() {
    $('#goalSection').html(`
      <div class="goalItemButton">
        <p>Anda Belum Punya Tujuan Workout, Mau Buat Tujuan Workout?</p>
        <button type="button" id="buttonCreateTujuan">Buat Tujuan</button>
      </div>
    `);
  }

  // Fungsi untuk merender goalSection dengan data pengguna dan tujuan
  function renderGoalSection(goal) {
    $('#goalSection').html(`
      <div class="goalItem">
        <div class="data-card">
          <h3>Tujuan: ${goal.goals[0].goalType}</h3>
        </div>
        <div class="data-card">
          <p><strong>Nama:</strong> ${goal.username || 'Tidak ada'}</p>
        </div>
        <div class="data-card">
          <p><strong>Umur:</strong> ${goal.age || 'Tidak ada'} tahun</p>
        </div>
        <div class="data-card">
          <p><strong>Gender:</strong> ${goal.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
        </div>
        <div class="data-card">
          <p><strong>Tinggi Badan:</strong> ${goal.heightCm || 'Tidak ada'} cm</p>
        </div>
        <div class="data-card">
          <p><strong>Berat Badan:</strong> ${goal.weightKg || 'Tidak ada'} kg</p>
        </div>
        <div class="data-card">
          <p><strong>Pengalaman:</strong> ${goal.goals[0].experienceLevel}</p>
        </div>
        <div class="data-card">
          <p><strong>Alat:</strong> ${goal.goals[0].equipment}</p>
        </div>
        <div class="data-card">
          <p><strong>Ketersedian hari:</strong> ${goal.goals[0].availableDays} hari</p>
        </div>
        <div class="data-card">
          <p><strong>Catatan:</strong> ${goal.goals[0].goalNotes || 'Tidak ada'}</p>
        </div>
        <div class="data-card-btn">
          <button type="button" class="btn-update-goal" data-goal-id="${goal.goals[0].id}">Update Tujuan</button>
        </div>
      </div>
    `);
    $('#buttonCreateTujuan').prop('disabled', true);
  }

  // Fungsi untuk merender form input saat tujuan tidak ditemukan
  function renderGoalForm() {
    $('#goalSection').html(`
      <div class="goalItemButton">
        <p>Anda Belum Punya Tujuan Workout, Mau Buat Tujuan Workout?</p>
        <button type="button" id="buttonCreateTujuan">Buat Tujuan</button>
      </div>
      <div class="goalItemForm">
        <form id="userForm" class="form-card" style="display: none;">
          <h3>Data Pengguna</h3>
          <div class="form-group">
            <label>Nama:</label>
            <input type="text" name="username" required />
          </div>
          <div class="form-group">
            <label>Umur:</label>
            <input type="number" name="age" min="15" required />
          </div>
          <div class="form-group">
            <label>Gender:</label>
            <select name="gender">
              <option value="male">Laki - Laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tinggi Badan (cm):</label>
            <input type="number" name="heightCm" min="130" placeholder="Masukkan tinggi" required />
          </div>
          <div class="form-group">
            <label>Berat Badan (kg):</label>
            <input type="number" name="weightKg" min="40" placeholder="Masukkan berat" required />
          </div>
          <div class="buttonGroup">
            <button type="submit" id="buttonUserSave">Simpan</button>
          </div>
        </form>
        <form id="goalForm" class="form-card" style="display: none;">
          <h3>Tujuan Workout</h3>
          <div class="form-group">
            <label>Jenis Tujuan:</label>
            <select name="goalType">
              <option value="bulking">Bulking</option>
              <option value="cutting">Cutting</option>
              <option value="maingaining">Maingaining</option>
              <option value="rekomposisi">Rekomposisi</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tingkat Pengalaman:</label>
            <select name="experienceLevel">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div class="form-group">
            <label>Alat:</label>
            <select name="equipment">
              <option value="gym">Gym</option>
              <option value="bodyweight">Bodyweight</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jumlah Hari / Minggu:</label>
            <input type="number" name="availableDays" min="1" max="7" required />
          </div>
          <div class="form-group">
            <label>Catatan Tujuan:</label>
            <textarea name="goalNotes"></textarea>
          </div>
          <div class="buttonGroup">
            <button type="submit" id="buttonGoalSave">Simpan</button>
          </div>
        </form>
      </div>
    `);
  }

  function renderUpdateGoalForm(goalData, userData) {
    $('#goalSection').html(`
    <div class="goalItemForm">
      <form id="updateUserForm" class="form-card">
        <h3>Update Data Pengguna</h3>
        <div class="form-group">
          <label>Nama:</label>
          <input type="text" name="username" value="${userData.username || ''}" required />
        </div>
        <div class="form-group">
          <label>Umur:</label>
          <input type="number" name="age" min="15" value="${userData.age || ''}" required />
        </div>
        <div class="form-group">
          <label>Gender:</label>
          <select name="gender">
            <option value="male" ${userData.gender === 'male' ? 'selected' : ''}>Laki - Laki</option>
            <option value="female" ${userData.gender === 'female' ? 'selected' : ''}>Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tinggi Badan (cm):</label>
          <input type="number" name="heightCm" min="130" placeholder="Masukkan tinggi" value="${userData.heightCm || ''}" required />
        </div>
        <div class="form-group">
          <label>Berat Badan (kg):</label>
          <input type="number" name="weightKg" min="40" placeholder="Masukkan berat" value="${userData.weightKg || ''}" required />
        </div>
        <div class="buttonGroup">
          <button type="submit" id="buttonUserSave">Simpan</button>
          <button type="button" class="btn-cancel">Batal</button>
        </div>
      </form>
      <form id="updateGoalForm" class="form-card" style="display: none;">
        <h3>Update Tujuan Workout</h3>
        <div class="form-group">
          <label>Jenis Tujuan:</label>
          <select name="goalType">
            <option value="bulking" ${goalData.goalType === 'bulking' ? 'selected' : ''}>Bulking</option>
            <option value="cutting" ${goalData.goalType === 'cutting' ? 'selected' : ''}>Cutting</option>
            <option value="maingaining" ${goalData.goalType === 'maingaining' ? 'selected' : ''}>Maingaining</option>
            <option value="rekomposisi" ${goalData.goalType === 'rekomposisi' ? 'selected' : ''}>Rekomposisi</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tingkat Pengalaman:</label>
          <select name="experienceLevel">
            <option value="beginner" ${goalData.experienceLevel === 'beginner' ? 'selected' : ''}>Beginner</option>
            <option value="intermediate" ${goalData.experienceLevel === 'intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="advanced" ${goalData.experienceLevel === 'advanced' ? 'selected' : ''}>Advanced</option>
          </select>
        </div>
        <div class="form-group">
          <label>Alat:</label>
          <select name="equipment">
            <option value="gym" ${goalData.equipment === 'gym' ? 'selected' : ''}>Gym</option>
            <option value="bodyweight" ${goalData.equipment === 'bodyweight' ? 'selected' : ''}>Bodyweight</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jumlah Hari / Minggu:</label>
          <input type="number" name="availableDays" min="1" max="7" value="${goalData.availableDays || ''}" required />
        </div>
        <div class="form-group">
          <label>Catatan Tujuan:</label>
          <textarea name="goalNotes">${goalData.goalNotes || ''}</textarea>
        </div>
        <div class="buttonGroup">
          <button type="submit" id="buttonGoalSave">Simpan Perubahan</button>
          <button type="button" class="btn-cancel">Batal</button>
        </div>
      </form>
    </div>
  `);
    $('#updateUserForm').slideDown(300);
  }

  // Fungsi untuk merender kartu hari dari respons generate plan
  function renderPlanDays(planData) {
    currentPlanData = planData;
    const { planName, totalWeeks, createdAt, workoutDays } = planData;
    let html = `
      <div class="plan-container">
        <h2>${planName}</h2>
        <p>Total Minggu: ${totalWeeks} | Dibuat: ${new Date(createdAt).toLocaleDateString('id-ID')}</p>
        <div class="day-cards">
    `;
    workoutDays.forEach((day) => {
      html += `
        <div class="day-card" data-day-id="${day.id}" data-day-number="${day.dayNumber}">
          <h3>Day ${day.dayNumber}</h3>
          <p>Fokus: ${day.focusArea}</p>
          <p>Deskripsi: ${day.description}</p>
          <button class="btn-view-exercises">Lihat Latihan</button>
        </div>
      `;
    });
    html += `
        </div>
      </div>
    `;
    $('#workoutPlanResult').html(html);
  }

  // Fungsi untuk merender latihan untuk hari tertentu
  function renderExercisesForDay(exercises, dayNumber) {
    currentExercises = exercises;
    let html = `
    <div class="exercise-container">
      <button class="btn-back">Kembali</button>
      <h2>Latihan untuk Day ${dayNumber}</h2>
      <div class="exercise-cards">
  `;
    exercises.forEach((exercise, index) => {
      html += `
      <div class="exercise-card" data-exercise-index="${index}">
        <h3>${exercise.exercise.name || 'Latihan Tidak Dikenal'}</h3>
        <p><strong>Set:</strong> ${exercise.sets || 'Tidak ada'}</p>
        <p><strong>Repetisi:</strong> ${exercise.reps || 'Tidak ada'}</p>
        <p><strong>Istirahat:</strong> ${exercise.restSeconds || 'Tidak ada'} detik</p>
      </div>
    `;
    });
    html += `
      </div>
    </div>
  `;
    $('#workoutPlanResult').html(html);
  }
  function showExerciseDetails(exerciseIndex) {
    if (!currentExercises || !currentExercises[exerciseIndex] || !currentExercises[exerciseIndex].exercise) {
      showAlert({
        icon: 'error',
        title: 'Error!',
        text: 'Data latihan tidak tersedia. Silakan coba lagi.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const exercise = currentExercises[exerciseIndex];
    const html = `
    <div class="exercise-details">
      <p><strong>Kategori:</strong> ${exercise.exercise.category || 'Tidak ada'}</p>
      <p><strong>Peralatan:</strong> ${exercise.exercise.equipment || 'Tidak ada'}</p>
      <p><strong>Tingkat Kesulitan:</strong> ${exercise.exercise.difficulty || 'Tidak ada'}</p>
      <p><strong>Instruksi:</strong> ${exercise.exercise.instructions || 'Tidak ada'}</p>
      <p><strong>Video Tutorial:</strong> <a href="${exercise.exercise.source}" target="_blank">Lihat Video</a></p>
      <p><strong>Set:</strong> ${exercise.sets || 'Tidak ada'}</p>
      <p><strong>Repetisi:</strong> ${exercise.reps || 'Tidak ada'}</p>
      <p><strong>Istirahat:</strong> ${exercise.restSeconds || 'Tidak ada'} detik</p>
    </div>
  `;
    console.log('Rendering SweetAlert with HTML:', html); // Debugging
    showAlert({
      title: exercise.exercise.name || 'Latihan Tidak Dikenal',
      html,
      confirmButtonText: 'Tutup'
    });
  }

  async function getPlan() {
    if (!token || !planId) {
      $('#planSection').html(`
        <div class="planItemButton">
         <p>Belum ada rencana latihan. Klik tombol ini untuk mulai generate.</p>
         <button type="button" class="buttonGeneratePlan">Generate</button>
        </div>
      `);
      return;
    }

    try {
      const response = await api.get(`/plans/${planId}`);
      renderPlanDays(response.data.data);
    } catch (err) {
      if (err.response?.status === 400) {
        $('#planSection').html(`
        <div class="planItemButton">
          <p>Gagal memuat rencana latihan. Silakan coba lagi atau generate ulang.</p>
          <button type="button" class="buttonGeneratePlan">Generate</button>
        </div>
      `);
      } else if (err.response?.status === 404) {
        $('#planSection').html(`
        <div class="planItemButton">
          <p>Belum ada rencana latihan. Klik tombol ini untuk mulai generate.</p>
          <button type="button" class="buttonGeneratePlan">Generate</button>
        </div>
      `);
      } else if (err.response?.status === 401) {
        showAlert({
          icon: 'error',
          title: 'Sesi Kadaluarsa',
          text: 'Sesi Anda telah berakhir. Silahkan refresh halaman',
          confirmButtonText: 'refresh'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    }
  }

  async function getExercisesForDay(workoutDayId, dayNumber) {
    try {
      const response = await api.get(`/plans/${workoutDayId}/workoutExercises`);
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid exercises data structure');
      }
      currentExercises = response.data.data;
      renderExercisesForDay(response.data.data, dayNumber);
    } catch (err) {
      showAlert({
        icon: 'error',
        title: 'Error!',
        text: 'Gagal memuat latihan untuk hari ini.',
        confirmButtonText: 'OK'
      });
    }
  }

  async function getUserGoals() {
    if (!token) {
      renderDefaultGoalSection();
      return;
    }

    try {
      const response = await api.get('/goals/user');
      if (!response.data.data) {
        renderGoalForm();
      } else {
        renderGoalSection(response.data.data);
      }
    } catch (err) {
      renderGoalForm();
      if (err.response?.status === 401) {
        showAlert({
          icon: 'error',
          title: 'Sesi Kadaluarsa',
          text: 'Sesi Anda telah berakhir. Silahkan refresh halaman.',
          confirmButtonText: 'refresh'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    }
  }

  // Fungsi untuk menangani generate plan
  async function handleGeneratePlan() {
    $(document).on('click', '.buttonGeneratePlan', async () => {
      if (!token) {
        showAlert({
          icon: 'warning',
          title: 'Akses Ditolak',
          text: 'Silakan login terlebih dahulu untuk melanjutkan!',
          confirmButtonText: 'Login Sekarang',
          showCancelButton: true,
          cancelButtonText: 'Batal'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/auth';
          }
        });
        return;
      }

      try {
        const goalId = localStorage.getItem('goalId');
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
        const response = await api.post(`/plans/${goalId}/generate`);
        localStorage.setItem('planId', response.data.dataPlan.id);
        await showAlert({
          icon: 'success',
          title: 'Sukses!',
          text: 'Rencana workout berhasil dibuat.',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        // await getPlan();
      } catch (err) {
        if (err.response?.status === 400 && err.response.message != 'Response AI is not valid JSON.') {
          showAlert({
            icon: 'warning',
            title: 'Response AI is not valid JSON.',
            text: 'Silahkan Generate ulang!',
            confirmButtonText: 'OK'
          });
        } else {
          await showAlert({
            icon: 'error',
            title: 'Error!',
            text: err.response?.data?.message || 'Gagal membuat rencana workout.',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }

  // Fungsi untuk menangani klik tombol Buat Tujuan
  function handleCreateUserClick() {
    $(document).on('click', '#buttonCreateTujuan', () => {
      if (!token) {
        showAlert({
          icon: 'warning',
          title: 'Akses Ditolak',
          text: 'Silakan login terlebih dahulu untuk melanjutkan!',
          confirmButtonText: 'Login Sekarang',
          showCancelButton: true,
          cancelButtonText: 'Batal'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/auth';
          }
        });
        return;
      }
      $('.goalItemButton').slideUp(300, () => {
        $('#userForm').slideDown(300);
      });
    });
  }

  // Fungsi untuk menangani submit form pengguna
  function handleUserFormSubmit() {
    $(document).on('submit', '#userForm', async (e) => {
      e.preventDefault();
      const userData = {
        username: $('#userForm input[name="username"]').val(),
        age: parseInt($('#userForm input[name="age"]').val()),
        gender: $('#userForm select[name="gender"]').val(),
        heightCm: parseInt($('#userForm input[name="heightCm"]').val()),
        weightKg: parseInt($('#userForm input[name="weightKg"]').val())
      };

      try {
        await api.put(`/users/createDetailUser/${userId}`, userData);
        await showAlert({
          icon: 'success',
          title: 'Sukses!',
          text: 'Data pengguna berhasil disimpan.',
          confirmButtonText: 'OK'
        });
        $('#userForm').fadeOut(300, () => {
          $('#goalForm').fadeIn(300);
        });
      } catch (err) {
        await showAlert({
          icon: 'error',
          title: 'Error!',
          text: err.response?.data?.message || 'Gagal menyimpan data pengguna.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  // Fungsi untuk menangani submit form tujuan
  function handleGoalFormSubmit() {
    $(document).on('submit', '#goalForm', async (e) => {
      e.preventDefault();
      const goalData = {
        goalType: $('#goalForm select[name="goalType"]').val(),
        experienceLevel: $('#goalForm select[name="experienceLevel"]').val(),
        equipment: $('#goalForm select[name="equipment"]').val(),
        availableDays: parseInt($('#goalForm input[name="availableDays"]').val()),
        goalNotes: $('#goalForm textarea[name="goalNotes"]').val()
      };

      try {
        const response = await api.post(`/goals/${userId}`, goalData);
        await showAlert({
          icon: 'success',
          title: 'Sukses!',
          text: 'Tujuan berhasil disimpan.',
          confirmButtonText: 'OK'
        });
        localStorage.setItem('goalId', response.data.data.id);
        getUserGoals();
      } catch (err) {
        await showAlert({
          icon: 'error',
          title: 'Error!',
          text: err.response?.data?.message || 'Gagal menyimpan tujuan.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  async function deletePlan() {
    if (!planId) {
      await showAlert({
        icon: 'warning',
        title: 'Gagal',
        text: 'Anda belum memiliki rencana latihan untuk dihapus!',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      await api.delete(`/plans/${planId}`);
      localStorage.removeItem('planId'); // Hapus planId dari localStorage
      localStorage.removeItem('tokenGenerate'); // Hapus tokenGenerate jika perlu
      localStorage.removeItem('lastTokenReset'); // Hapus lastTokenReset jika perlu
      await showAlert({
        icon: 'success',
        title: 'Sukses!',
        text: 'Rencana latihan berhasil dihapus.',
        confirmButtonText: 'OK'
      });
      return true;
    } catch (err) {
      await showAlert({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.message || 'Gagal menghapus rencana latihan.',
        confirmButtonText: 'OK'
      });
      return false;
    }
  }

  function handleClickUpdateGoal() {
    $(document).on('click', '.btn-update-goal', async function () {
      const goalId = $(this).data('goal-id');

      try {
        const response = await api.get('/goals/user');
        if (!response.data.data) {
          showAlert({
            icon: 'error',
            title: 'Error!',
            text: 'Data tujuan tidak ditemukan.',
            confirmButtonText: 'OK'
          });
          return;
        }

        const userData = {
          username: response.data.data.username,
          age: response.data.data.age,
          gender: response.data.data.gender,
          heightCm: response.data.data.heightCm,
          weightKg: response.data.data.weightKg
        };
        const goalData = response.data.data.goals[0];

        // Render form dengan data yang sudah diisi
        renderUpdateGoalForm(goalData, userData);

        // Tangani submit form pengguna
        $('#updateUserForm').on('submit', async (e) => {
          e.preventDefault();
          const updatedUserData = {
            username: $('#updateUserForm input[name="username"]').val(),
            age: parseInt($('#updateUserForm input[name="age"]').val()),
            gender: $('#updateUserForm select[name="gender"]').val(),
            heightCm: parseInt($('#updateUserForm input[name="heightCm"]').val()),
            weightKg: parseInt($('#updateUserForm input[name="weightKg"]').val())
          };

          try {
            await api.put(`/users/createDetailUser/${userId}`, updatedUserData);
            await showAlert({
              icon: 'success',
              title: 'Sukses!',
              text: 'Data pengguna berhasil diperbarui.',
              confirmButtonText: 'OK'
            });
            $('#updateUserForm').fadeOut(300, () => {
              $('#updateGoalForm').fadeIn(300);
            });
          } catch (err) {
            await showAlert({
              icon: 'error',
              title: 'Error!',
              text: err.response?.data?.message || 'Gagal memperbarui data pengguna.',
              confirmButtonText: 'OK'
            });
          }
        });

        // Tangani submit form tujuan
        $('#updateGoalForm').on('submit', async (e) => {
          e.preventDefault();
          const updatedGoalData = {
            goalType: $('#updateGoalForm select[name="goalType"]').val(),
            experienceLevel: $('#updateGoalForm select[name="experienceLevel"]').val(),
            equipment: $('#updateGoalForm select[name="equipment"]').val(),
            availableDays: parseInt($('#updateGoalForm input[name="availableDays"]').val()),
            goalNotes: $('#updateGoalForm textarea[name="goalNotes"]').val()
          };

          try {
            await api.put(`/goals/${goalId}`, updatedGoalData);
            await deletePlan();
            await showAlert({
              icon: 'success',
              title: 'Sukses!',
              text: 'Tujuan berhasil diperbarui.',
              confirmButtonText: 'OK'
            });

            $('#updateGoalForm').slideUp(300, () => {
              $('#goalSection').empty();
              getUserGoals();
              window.location.reload();
            });
          } catch (err) {
            await showAlert({
              icon: 'error',
              title: 'Error!',
              text: err.response?.data?.message || 'Gagal memperbarui tujuan.',
              confirmButtonText: 'OK'
            });
          }
        });

        // Tangani tombol batal
        $('.btn-cancel').on('click', () => {
          $('#updateUserForm, #updateGoalForm').slideUp(300, () => {
            $('#goalSection').empty();
            getUserGoals(); // Kembali ke tampilan awal
          });
        });
      } catch (err) {
        console.error('Error fetching goal data:', err.response);
        showAlert({
          icon: 'error',
          title: 'Error!',
          text: 'Gagal memuat data tujuan.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  // Fungsi untuk menangani klik tombol Sign Up
  function handleSignUpClick() {
    $(document).on('click', '.btn-signup', () => {
      window.location.href = '/auth';
    });
  }

  function handleDayCardClick() {
    $(document).on('click', '.day-card', function () {
      const dayId = $(this).data('day-id');
      const dayNumber = $(this).data('day-number');
      getExercisesForDay(dayId, dayNumber);
    });
  }

  function handleBackToDaysClick() {
    $(document).on('click', '.btn-back', () => {
      if (currentPlanData) {
        renderPlanDays(currentPlanData);
      } else {
        getPlan();
      }
    });
  }

  // Fungsi untuk menangani klik kartu latihan
  function handleExerciseCardClick() {
    $(document).on('click', '.exercise-card', function () {
      const exerciseIndex = $(this).data('exercise-index');
      showExerciseDetails(exerciseIndex);
    });
  }

  // Inisialisasi aplikasi
  function initializeApp() {
    if (!checkApiAvailability()) return;
    setupSmoothScroll();
    isLogin();
    handleCreateUserClick();
    handleUserFormSubmit();
    handleGoalFormSubmit();
    handleClickUpdateGoal();
    handleSignUpClick();
    handleGeneratePlan();
    handleDayCardClick();
    handleBackToDaysClick();
    handleExerciseCardClick();
    getUserGoals();
    getPlan();
  }

  // Jalankan inisialisasi
  initializeApp();
});
