const API_URL = 'http://localhost:3000/api';

let selectedIntent = 'buy';

// Intent tabs
document.querySelectorAll('.post-type-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.post-type-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    selectedIntent = this.dataset.intent;
  });
});

// Form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const year = document.getElementById('year').value;
  const branch = document.getElementById('branch').value;
  
  // Get selected courses
  const selectedCourses = Array.from(document.querySelectorAll('input[name="courses"]:checked'))
    .map(cb => cb.value);
  
  // Validate JIIT email
  if (!email.endsWith('@jiit.ac.in') && !email.endsWith('@mail.jiit.ac.in')) {
    alert('❌ Please use a valid JIIT email address (@jiit.ac.in or @mail.jiit.ac.in)');
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    alert('❌ Password must be at least 6 characters long');
    return;
  }
  
  const userData = {
    name: fullName,
    email: email,
    password: password,
    intent: selectedIntent,
    year: year,
    branch: branch,
    courses: selectedCourses
  };
  
  fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('✅ Account created successfully! You can now login.');
      window.location.href = '/login.html';
    } else {
      alert('❌ ' + (data.message || 'Failed to create account'));
    }
  })
  .catch(error => {
    console.error('Signup error:', error);
    alert('❌ An error occurred. Please try again.');
  });
});
