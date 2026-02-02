const API_URL = 'http://localhost:3000/api';

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/marketplace.html';
    } else {
      alert(data.message || 'Login failed');
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    alert('An error occurred. Please try again.');
  });
});

document.getElementById('demoBtn').addEventListener('click', () => {
  document.getElementById('email').value = 'demo@jiit.ac.in';
  document.getElementById('password').value = 'demo123';
});
