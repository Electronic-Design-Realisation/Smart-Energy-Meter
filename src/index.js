// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirebaseConfig } from "./firebase-config";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const firebaseAppConfig = getFirebaseConfig();
const app = initializeApp(firebaseAppConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

//ELEMENTS
//sign up form elements
var sign_up_form_container = document.getElementById('sign_up_form_container');
var sign_up_company_name_txt = document.getElementById('sign_up_company_name_txt');
var sign_up_email_txt = document.getElementById('sign_up_email_txt');
var sign_up_pwd_txt = document.getElementById('sign_up_pwd_txt');
var sign_up_re_pwd_txt = document.getElementById('sign_up_re_pwd_txt');
var sign_up_submit_btn = document.getElementById('sign_up_submit_btn');
var sign_up_company_name_error_message_element_list = document.getElementById('company_name_error_message_space').children;
var sign_up_email_error_message_element_list = document.getElementById('email_error_message_space').children;
var sign_up_pwd_error_message_element_list = document.getElementById('password_error_message_space').children;

//login elements
var login_email_txt = document.getElementById('login_email_txt');
var login_pwd_txt = document.getElementById('login_pwd_txt');
var normal_login_btn = document.getElementById('n_login');
var login_email_error_message_element_list = document.getElementById('login_email_error_message_space').children;
var login_pwd_error_message_element_list = document.getElementById('login_pwd_error_message_space').children;

//EVENT LISTNERS
sign_up_submit_btn.addEventListener('click', sign_up_user);
normal_login_btn.addEventListener('click', login_user);

//FUNCTIONS
//signing in functions
function check_email_validitiy(email){
    if (email.indexOf('@') > -1){
        sign_up_email_txt.style.borderColor = '';
        for (let i=0; i<sign_up_email_error_message_element_list.length; i++){
            sign_up_email_error_message_element_list[i].setAttribute('hidden', '');
        }

        return true;
    }

    sign_up_email_txt.style.borderColor = '#ef1e1e';
    for (let i=0; i<sign_up_email_error_message_element_list.length; i++){
        sign_up_email_error_message_element_list[i].removeAttribute('hidden');
    }

    return false;
}

function check_pwd_similarity(pwd, re_pwd){
    if (pwd == re_pwd){
        sign_up_pwd_txt.style.borderColor = '';
        sign_up_re_pwd_txt.style.borderColor = '';
        for (let i=0; i<sign_up_pwd_error_message_element_list.length; i++){
            sign_up_pwd_error_message_element_list[i].setAttribute('hidden', '');
        }

        return true;
    }

    sign_up_pwd_txt.style.borderColor = '#ef1e1e';
    sign_up_re_pwd_txt.style.borderColor = '#ef1e1e';
    for (let i=0; i<sign_up_pwd_error_message_element_list.length; i++){
        sign_up_pwd_error_message_element_list[i].removeAttribute('hidden');
    }

    return false;
}

function check_form_validity(email, pwd, re_pwd){
    let is_email_valid = check_email_validitiy(email);
    let is_pwd_similar = check_pwd_similarity(pwd, re_pwd);
    if (is_email_valid && is_pwd_similar){
        return true;
    }
    return false;
}

function direct_to_dashboard_page(){
    window.location.href = 'dashboard.html';
}

function sign_up_user(){
    let company_name = sign_up_company_name_txt.value;
    let email = sign_up_email_txt.value;
    let pwd = sign_up_pwd_txt.value;
    let re_pwd = sign_up_re_pwd_txt.value;

    if (check_form_validity(email, pwd, re_pwd)){
        createUserWithEmailAndPassword(auth, email, pwd)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                
                direct_to_dashboard_page();
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                
                console.log('ERROR (%d): %s', errorCode, errorMessage);
            });
    }
}

//logging in functions
function notify_invalid_email(){
    login_email_txt.style.borderColor = "#ef1e1e";
    for (let i=0; i<login_email_error_message_element_list.length; i++){
        login_email_error_message_element_list[i].removeAttribute('hidden');
    }
    login_email_error_message_element_list[1].innerHTML = 'Invalid email address';
}

function rectify_email_error_msg(){
    login_email_txt.style.borderColor = '';
    for (let i=0; i<login_email_error_message_element_list.length; i++){
        login_email_error_message_element_list[i].setAttribute('hidden', '');
    }
} 

function notify_user_not_found(){
    login_email_txt.style.borderColor = "#ef1e1e";
    for (let i=0; i<login_email_error_message_element_list.length; i++){
        login_email_error_message_element_list[i].removeAttribute('hidden');
    }
    login_email_error_message_element_list[1].innerHTML = 'User not found';
}

function notify_empty_password(){
    login_pwd_txt.style.borderColor = "#ef1e1e";
    for (let i=0; i<login_pwd_error_message_element_list.length; i++){
        login_pwd_error_message_element_list[i].removeAttribute('hidden');
    }
    login_pwd_error_message_element_list[1].innerHTML = 'Enter the password';
}

function notify_wrong_password(){
    login_pwd_txt.style.borderColor = "#ef1e1e";
    for (let i=0; i<login_pwd_error_message_element_list.length; i++){
        login_pwd_error_message_element_list[i].removeAttribute('hidden');
    }
    login_pwd_error_message_element_list[1].innerHTML = 'Wrong password';
}

function rectify_pwd_error_msg(){
    login_pwd_txt.style.borderColor = '';
    for (let i=0; i<login_pwd_error_message_element_list.length; i++){
        login_pwd_error_message_element_list[i].setAttribute('hidden', '');
    }
}

function notify_too_many_failed_attempts(){
    login_email_txt.style.borderColor = "#ef1e1e";
    for (let i=0; i<login_email_error_message_element_list.length; i++){
        login_email_error_message_element_list[i].removeAttribute('hidden');
    }
    login_email_error_message_element_list[1].innerHTML = 'Login disabled. Please try again later.';
}

function notify_login_error(errorMessage){
    if (errorMessage.indexOf("invalid-email") > -1){
        rectify_pwd_error_msg();
        notify_invalid_email();
    }
    else if (errorMessage.indexOf("user-not-found") > -1){
        rectify_pwd_error_msg();
        notify_user_not_found();
    }
    else if (errorMessage.indexOf("internal-error") > -1){
        rectify_email_error_msg();
        notify_empty_password();
    }
    else if (errorMessage.indexOf("wrong-password") > -1){
        rectify_email_error_msg();
        notify_wrong_password();
    }
    else if (errorMessage.indexOf("too-many-requests") > -1){
        rectify_pwd_error_msg();
        notify_too_many_failed_attempts();
    }
}

function login_user(){
    let email = login_email_txt.value;
    let pwd = login_pwd_txt.value;

    signInWithEmailAndPassword(auth, email, pwd)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            
            direct_to_dashboard_page();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log(errorMessage);

            notify_login_error(errorMessage);
        });
}