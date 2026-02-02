const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = '/login.html';
}

let selectedType = 'Selling';

// Post type tabs
document.querySelectorAll('.post-type-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.post-type-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    selectedType = tab.dataset.type;
  });
});

// Form submission
document.getElementById('createPostForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const price = document.getElementById('price').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const urgency = document.getElementById('urgency').value;
  const availability = document.getElementById('availability').value;
  const imageUrl = document.getElementById('imageUrl').value;
  
  const newListing = {
    title,
    category,
    price: parseInt(price),
    description,
    location,
    urgency,
    availability,
    type: selectedType,
    images: imageUrl ? [imageUrl] : [],
    sellerId: user.id
  };
  
  fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newListing)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Post created successfully!');
      window.location.href = '/marketplace.html';
    } else {
      alert('Failed to create post');
    }
  })
  .catch(error => {
    console.error('Error creating post:', error);
    alert('An error occurred. Please try again.');
  });
});
