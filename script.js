document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let emailError = document.getElementById('emailError');
    let passwordError = document.getElementById('passwordError');
    
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    
    let valid = true;
    
    if (!validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.style.display = 'block';
        valid = false;
    }
    
    if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long.';
        passwordError.style.display = 'block';
        valid = false;
    }
    
    if (valid) {
        // Submit the form
        console.log('Form is valid');
        // Here you can add your form submission logic, e.g., using fetch API to submit data to your server.
    }
});

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}
 