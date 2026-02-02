const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = '/login.html';
}

// Get listing ID from URL
const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get('id');

function loadListing() {
  fetch(`${API_URL}/listings/${listingId}`)
    .then(response => response.json())
    .then(listing => {
      if (listing.error) {
        alert('Listing not found');
        window.location.href = '/marketplace.html';
        return;
      }
      
      renderListing(listing);
    })
    .catch(error => {
      console.error('Error loading listing:', error);
      alert('Error loading listing');
    });
}

function renderListing(listing) {
  document.getElementById('listingTitle').textContent = listing.title;
  document.getElementById('listingPrice').textContent = `₹${listing.price}`;
  document.getElementById('listingDescription').textContent = listing.description;
  
  // Badges
  const badges = document.getElementById('badges');
  badges.innerHTML = `
    <div class="listing-badge badge-${listing.type.toLowerCase()}">${listing.type}</div>
    ${listing.urgency !== 'Low Urgency' ? `<div class="listing-badge" style="background-color: #fef3c7; color: #92400e;">${listing.urgency}</div>` : ''}
  `;
  
  // Meta information
  const meta = document.getElementById('listingMeta');
  meta.innerHTML = `
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
    <div class="meta-item">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      Posted ${listing.postedDate}
    </div>
  `;
  
  // Seller profile
  const sellerProfile = document.getElementById('sellerProfile');
  sellerProfile.innerHTML = `
    <div class="seller-avatar-large">${listing.sellerAvatar}</div>
    <div>
      <div style="font-weight: 600; font-size: 1.1rem;">${listing.sellerName}</div>
      <div class="seller-rating">
        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #fbbf24;">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${listing.sellerRating} rating
      </div>
    </div>
  `;
  
  // Make contact button functional
  const contactBtn = document.querySelector('.contact-btn');
  contactBtn.onclick = function() {
    // Redirect to chat with this seller
    window.location.href = `/chat.html?userId=${listing.sellerId}`;
  };
  
  // Category badge
  document.getElementById('categoryBadge').textContent = listing.category;
  
  // Related courses
  if (listing.relatedCourses && listing.relatedCourses.length > 0) {
    const relatedCoursesDiv = document.getElementById('relatedCourses');
    relatedCoursesDiv.innerHTML = `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-gray);">
        <h2 style="font-size: 1.25rem; margin-bottom: 12px;">Related Courses:</h2>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${listing.relatedCourses.map(course => `
            <span style="padding: 6px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
              ${course}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }
}

loadListing();
