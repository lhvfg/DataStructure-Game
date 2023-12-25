export function handleRegister() {
    const _username = username.value.trim(); //trim()方法用于处理空格
    localStorage.setItem("username", _username);

    // store.username = _username;
    username.value = "";
    let request = {
        name: localStorage.getItem("username"),
    };
    if (validUsername.value && validPassword.value && validEmail.value) {
        Register.post
        alert('Registration successful');
    } else {
        alert('Registration failed');
    }
}

export function handleLogin() {
    // Implement login logic here
}