// Default SHA-256 hash for PIN "1234"
    const DEFAULT_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
    
    // In-memory authentication state (resets whenever page is reloaded)
    let isDoctorAuthenticated = false;

    // Helper to hash PINs using the browser's native Web Crypto API
    async function hashPin(pin) {
      const msgUint8 = new TextEncoder().encode(pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Called when clicking the Shield icon in the navbar
    function openAdminModal() {
      if (isDoctorAuthenticated) {
        populateAndOpenAdminPanel();
      } else {
        document.getElementById('pinErrorMsg').classList.add('hidden');
        document.getElementById('adminPinInput').value = '';
        document.getElementById('adminAuthModal').classList.remove('hidden');
        setTimeout(() => document.getElementById('adminPinInput').focus(), 100);
      }
    }

    function closeAdminAuthModal() {
      document.getElementById('adminAuthModal').classList.add('hidden');
    }

    // Verify PIN submission
    async function handlePinSubmit(e) {
      e.preventDefault();
      const enteredPin = document.getElementById('adminPinInput').value.trim();
      const enteredHash = await hashPin(enteredPin);
      const savedHash = localStorage.getItem('auracare_admin_pin') || DEFAULT_PIN_HASH;

      if (enteredHash === savedHash) {
        isDoctorAuthenticated = true;
        closeAdminAuthModal();
        populateAndOpenAdminPanel();
      } else {
        const errorEl = document.getElementById('pinErrorMsg');
        errorEl.classList.remove('hidden');
        document.getElementById('adminPinInput').value = '';
      }
    }

    function populateAndOpenAdminPanel() {
      document.getElementById('adminServingInput').value = state.nowServing;
      document.getElementById('adminBannerInput').value = state.bannerNotice;
      document.getElementById('adminDoctorName').value = state.doctorName;
      document.getElementById('adminDegrees').value = state.degrees;
      document.getElementById('adminPhone').value = state.phone;
      document.getElementById('adminFee').value = state.consultationFee;
      document.getElementById('adminAddress').value = state.address;
      document.getElementById('adminModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeAdminModal() {
      document.getElementById('adminModal').classList.add('hidden');
    }

    // Lock the panel immediately (requires PIN next time)
    function lockAdminPanel() {
      isDoctorAuthenticated = false;
      closeAdminModal();
      alert("Doctor panel has been locked.");
    }

    // Update PIN feature
    async function updatePin() {
      const newPin = document.getElementById('newPinInput').value.trim();
      if (newPin.length < 4) {
        alert("Please choose a PIN with at least 4 digits.");
        return;
      }
      const newHash = await hashPin(newPin);
      localStorage.setItem('auracare_admin_pin', newHash);
      document.getElementById('newPinInput').value = '';
      alert("Security PIN successfully updated!");
    }