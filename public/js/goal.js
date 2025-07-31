$(document).ready(() => {
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');
  const api = window.api;
  // Fungsi untuk memuat goal dan detail user
  async function getUserGoals() {
    if (!token || !userId) {
      $('#goalSection').html(`
        <div class="goalItemButton">
          <p>Anda Belum Punya Tujuan Workout, Mau Buat Tujuan Workout?</p>
          <button type="button" id="buttonCreateTujuan" disabled>Buat Tujuan</button>
        </div>
      `);
      return;
    }

    try {
      const response = await api.get('/goals/user');
      const goal = response.data.data; // Respons: { status, message, data: { id, goalType, ..., user: { id, username, ... } } }

      // Tampilkan goal dan detail user
      $('#goalSection').html(`
        <div class="goalItem card">
          <h3>Tujuan Anda: ${goal.goalType}</h3>
          <p><strong>Nama:</strong> ${goal.user.username || 'Tidak ada'}</p>
          <p><strong>Umur:</strong> ${goal.user.umur || 'Tidak ada'} tahun</p>
          <p><strong>Gender:</strong> ${goal.user.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
          <p><strong>Tinggi Badan:</strong> ${goal.user.tinggiBadan || 'Tidak ada'} cm</p>
          <p><strong>Berat Badan:</strong> ${goal.user.beratBadan || 'Tidak ada'} kg</p>
          <p><strong>Pengalaman:</strong> ${goal.experienceLevel}</p>
          <p><strong>Alat:</strong> ${goal.equipment}</p>
          <p><strong>Hari/Minggu:</strong> ${goal.availableDays}</p>
          <p><strong>Catatan:</strong> ${goal.goalNotes || 'Tidak ada'}</p>
          <button type="button" class="btn-update" data-goal-id="${goal.id}">Update Tujuan</button>
        </div>
      `);
      $('#buttonCreateTujuan').prop('disabled', true); // Nonaktifkan tombol jika goal ada
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.message === 'Goal by user is not found!') {
        // Jika goal belum ada, aktifkan tombol dan tampilkan form
        $('#buttonCreateTujuan').prop('disabled', false);
        $('#goalSection').html(`
          <div class="goalItemButton">
            <p>Anda Belum Punya Tujuan Workout, Mau Buat Tujuan Workout?</p>
            <button type="button" id="buttonCreateTujuan">Buat Tujuan</button>
          </div>
          <div class="goalItemForm" style="display: none;">
            <form id="userForm">
              <label>Nama:</label>
              <input type="text" name="username" required />
              <br />
              <label>Umur:</label>
              <input type="number" name="umur" min="15" required />
              <br />
              <label>Gender:</label>
              <select name="gender">
                <option value="male">Laki - Laki</option>
                <option value="female">Perempuan</option>
              </select><br />
              <label>Tinggi Badan:</label>
              <input type="number" name="tinggiBadan" min="130" placeholder="Masukkan tinggi (cm)" required />
              <br />
              <label>Berat Badan:</label>
              <input type="number" name="beratBadan" min="40" placeholder="Masukkan berat (kg)" required />
              <br />
              <div class="buttonGroupUser">
                <button type="submit" id="buttonUserSave">Simpan</button>
                <button type="button" id="buttonUserNext">Lanjut</button>
              </div>
            </form>
            <form id="goalForm" style="display: none;">
              <label>Jenis Tujuan:</label>
              <select name="goalType">
                <option value="bulking">Bulking</option>
                <option value="cutting">Cutting</option>
                <option value="maingaining">Maingaining</option>
                <option value="rekomposisi">Rekomposisi</option>
              </select><br />
              <label>Tingkat Pengalaman:</label>
              <select name="experienceLevel">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select><br />
              <label>Alat:</label>
              <select name="equipment">
                <option value="gym">Gym</option>
                <option value="bodyweight">Bodyweight</option>
              </select><br />
              <label>Jumlah Hari / Minggu:</label>
              <input type="number" name="availableDays" min="1" max="7" required /><br />
              <label>Catatan Tujuan:</label>
              <textarea name="goalNotes"></textarea><br />
              <div class="buttonGroupGoal">
                <button type="button" id="buttonReturn">Kembali</button>
                <button type="submit" id="buttonSave">Simpan</button>
              </div>
            </form>
          </div>
        `);
      } else {
        console.error('Error fetching goal:', err);
        // Interceptor Axios akan menangani 401
      }
    }
  }

  getUserGoals();
});
