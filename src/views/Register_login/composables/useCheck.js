 export function checkUsername(value) {
     const regex = /^[a-zA-Z0-9]{1,12}$/;
     validUsername.value = regex.test(value);
     usernameValidationText.value = validUsername.value ?
         'right!' :
         'Username should be 1-12 English characters or numbers';
 }

 export function checkPassword(value) {
     const regex = /^[a-zA-Z0-9]{8,15}$/;
     validPassword.value = regex.test(value);
     passwordValidationText.value = validPassword.value ?
         'right!' :
         'Password should be English characters or numbers more than 8 words and within 15 words';
 }

 export function checkEmail(value) {
     const regex = /^[1-9]\d{7,10}@qq\.com$/;
     validEmail.value = regex.test(value);
     EmailValidationText.value = validEmail.value ?
         'right!' :
         'Please input your QQ-Email in the correct format';
 }