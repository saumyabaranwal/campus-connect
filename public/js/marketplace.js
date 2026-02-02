const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = '/login.html';
}

document.getElementById('welcomeText').textContent = `Welcome, ${user.name}`;

let allListings = [];
let currentCategory = 'All';

// Load listings
function loadListings() {
  fetch(`${API_URL}/listings`)
    .then(response => response.json())
    .then(data => {
      allListings = data;
      renderListings();
    })
    .catch(error => {
      console.error('Error loading listings:', error);
    });
}

function renderListings() {
  const grid = document.getElementById('listingsGrid');
  let filtered = allListings;
  
  if (currentCategory !== 'All') {
    filtered = allListings.filter(l => l.category === currentCategory);
  }
  
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(l => 
      l.title.toLowerCase().includes(searchTerm) ||
      l.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">No listings found</p>';
    return;
  }
  
  grid.innerHTML = filtered.map(listing => `
    <div class="listing-card" onclick="window.location.href='/detail.html?id=${listing.id}'">
      <div class="listing-image">
        <div class="listing-badge badge-${listing.type.toLowerCase()}">${listing.type}</div>
        ${listing.urgency !== 'Low Urgency' ? `<div class="listing-tag">${listing.urgency}</div>` : ''}
        ${listing.status === 'sold' ? '<div class="sold-overlay">SOLD</div>' : ''}
      </div>
      <div class="listing-content">
        <h3>${listing.title}</h3>
        <p>${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>
        <div class="listing-price">₹${listing.price}</div>
        <div class="listing-meta">
          <div class="meta-item">
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${listing.location}
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${listing.availability}
          </div>
        </div>
        <div class="listing-footer">
          <div class="seller-info">
            <div class="seller-avatar">${listing.sellerAvatar}</div>
            <div>
              <div class="seller-name">${listing.sellerName}</div>
              <div class="seller-rating">
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                ${listing.sellerRating}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Category tabs
document.querySelectorAll('.category-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    renderListings();
  });
});

// Search
document.getElementById('searchInput').addEventListener('input', renderListings);

// Profile button
document.getElementById('profileBtn').addEventListener('click', () => {
  window.location.href = `/profile.html?id=${user.id}`;
});

// Initial load
loadListings();
