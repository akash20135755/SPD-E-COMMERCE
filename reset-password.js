document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let resetCode = document.getElementById('resetCode').value;
    let newPassword = document.getElementById('newPassword').value;
    let confirmNewPassword = document.getElementById('confirmNewPassword').value;

    let resetCodeError = document.getElementById('resetCodeError');
    let newPasswordError = document.getElementById('newPasswordError');
    let confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    resetCodeError.style.display = 'none';
    newPasswordError.style.display = 'none';
    confirmNewPasswordError.style.display = 'none';

    let valid = true;

    if (resetCode.trim() === '') {
        resetCodeError.textContent = 'Reset code is required.';
        resetCodeError.style.display = 'block';
        valid = false;
    }

    if (newPassword.length < 6) {
        newPasswordError.textContent = 'Password must be at least 6 characters long.';
        newPasswordError.style.display = 'block';
        valid = false;
    }

    if (newPassword !== confirmNewPassword) {
        confirmNewPasswordError.textContent = 'Passwords do not match.';
        confirmNewPasswordError.style.display = 'block';
        valid = false;
    }

    if (valid) {
        // Submit the form
        console.log('Form is valid');
        // Here you can add your form submission logic, e.g., using fetch API to submit data to your server.
        // Example:
        // fetch('/api/reset-password', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         resetCode: resetCode,
        //         newPassword: newPassword
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // }).then(response => response.json()).then(data => {
        //     if (data.success) {
        //         alert('Password reset successful');
        //         window.location.href = 'login.html';
        //     } else {
        //         alert('Error resetting password');
        //     }
        // });
    }
});
