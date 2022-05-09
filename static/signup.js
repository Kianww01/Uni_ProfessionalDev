function showPassword() {
    const password = document.getElementById("password");
    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}

function showConfirmPassword() {
    const password = document.getElementById("confirmPassword");
    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}

function validatePassword() {
    let password = document.forms["signupForm"]["password"].value;
    let confirmPassword = document.forms["signupForm"]["confirmPassword"].value;

    if (password != confirmPassword) {
        alert("Your passwords do not match");
        return false;
    }
}