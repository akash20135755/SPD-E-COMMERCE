document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let emailError = document.getElementById('emailError');
    let passwordError = document.getElementById('passwordError');
    
    // Reset any previous error messages
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    
    let valid = true;

    // Email validation
    if (!validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.style.display = 'block';
        valid = false;
    }

    // Password length validation
    if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long.';
        passwordError.style.display = 'block';
        valid = false;
    }

    // If validation passes, proceed with form submission logic
    if (valid) {
        console.log('Form is valid');
        // You can submit the form using Fetch API or other methods
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to home page if successful
                window.location.href = 'home_page.html';
            } else {
                emailError.textContent = data.message || 'Login failed';
                emailError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            emailError.textContent = 'An error occurred. Please try again.';
            emailError.style.display = 'block';
        });
    }
});

// Email validation function using a regular expression
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}
