const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('user'));
if (!currentUser) {
  window.location.href = '/login.html';
}

// Get profile ID from URL or use current user
const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get('id') || currentUser.id;

function loadProfile() {
  fetch(`${API_URL}/users/${profileId}`)
    .then(response => response.json())
    .then(user => {
      if (user.error) {
        alert('User not found');
        window.location.href = '/marketplace.html';
        return;
      }
      
      renderProfile(user);
      loadUserListings();
    })
    .catch(error => {
      console.error('Error loading profile:', error);
    });
}

function renderProfile(user) {
  document.getElementById('profileAvatar').textContent = user.avatar;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileRating').textContent = user.rating || 'No ratings yet';
}

function loadUserListings() {
  fetch(`${API_URL}/users/${profileId}/listings`)
    .then(response => response.json())
    .then(listings => {
      const container = document.getElementById('userListings');
      
      if (listings.length === 0) {
        container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">No listings yet</p>';
        return;
      }
      
      container.innerHTML = listings.map(listing => `
        <div style="padding: 16px; border: 1px solid var(--border-gray); border-radius: 8px; cursor: pointer;" onclick="window.location.href='/detail.html?id=${listing.id}'">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 style="font-size: 1rem; font-weight: 600;">${listing.title}</h3>
            <span style="padding: 4px 8px; background-color: ${listing.status === 'sold' ? '#fee2e2' : '#d1fae5'}; color: ${listing.status === 'sold' ? '#991b1b' : '#065f46'}; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
              ${listing.status === 'sold' ? 'SOLD' : 'ACTIVE'}
            </span>
          </div>
          <p style="color: var(--text-gray); font-size: 0.85rem; margin-bottom: 8px;">${listing.description.substring(0, 80)}...</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--primary-green); font-weight: 600; font-size: 1.1rem;">₹${listing.price}</span>
            <span style="color: var(--text-gray); font-size: 0.8rem;">${listing.postedDate}</span>
          </div>
        </div>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading listings:', error);
    });
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

loadProfile();
