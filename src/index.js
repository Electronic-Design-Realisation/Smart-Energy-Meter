// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirebaseConfig } from "./firebase-config";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const firebaseAppConfig = getFirebaseConfig();
const app = initializeApp(firebaseAppConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getFirestore(app);

//ELEMENTS
//header and footer elements
var page_title = document.getElementById('page_title');

//sign up form elements
const upper_login_btn = document.getElementById('upper_login_btn');
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
var login_form_container = document.getElementById('login_form_container');
var login_email_txt = document.getElementById('login_email_txt');
var login_pwd_txt = document.getElementById('login_pwd_txt');
var normal_login_btn = document.getElementById('n_login');
var login_email_error_message_element_list = document.getElementById('login_email_error_message_space').children;
var login_pwd_error_message_element_list = document.getElementById('login_pwd_error_message_space').children;
var refreshed = true;

//new department modal elements
var new_dpt_modal_txt;
var new_dpt_modal_add_btn;
var new_dpt_modal_close_btn;
var main_body_container = document.getElementById('main_body_container');

//EVENT LISTNERS
sign_up_submit_btn.addEventListener('click', sign_up_user);
normal_login_btn.addEventListener('click', login_user);
upper_login_btn.addEventListener('click', change_login_form);

//VARIABLES
var login_page_state = 0; // 0: Login UI, 1: Sign Up UI, 2: Sign Out UI
var avatar_image_html = '\n<img src="images/img_avatar_male.png" class="img-fluid rounded profile_picture" alt="unkown user"> \n';
var company_name_registration_error = false;

//FUNCTIONS
//ui control functions
function change_login_form(){
    if (login_page_state == 0){
        upper_login_btn.innerHTML = avatar_image_html.concat("Login\n");
        login_form_container.setAttribute("hidden", ""); 
        sign_up_form_container.removeAttribute("hidden");
        login_page_state = 1;
    }
    else if(login_page_state == 1){
        upper_login_btn.innerHTML = avatar_image_html.concat("Sign up\n");
        login_form_container.removeAttribute("hidden");
        sign_up_form_container.setAttribute("hidden", "");
        login_page_state = 0;
    }
    else if(login_page_state == 2){
        signOut(auth).catch((error) => {
            console.log(error.message);
          });
    }
}

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
    sign_up_email_error_message_element_list[1].innerHTML = "Enter a valid email";
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

function display_email_already_in_use_error(){
    sign_up_email_txt.style.borderColor = '#ef1e1e';
    sign_up_email_error_message_element_list[1].innerHTML = "Email is already in use";
    for (let i=0; i<sign_up_email_error_message_element_list.length; i++){
        sign_up_email_error_message_element_list[i].removeAttribute('hidden');
    }
}

function remove_email_already_in_use_error(){
    sign_up_email_txt.style.borderColor = '';
    for (let i=0; i<sign_up_email_error_message_element_list.length; i++){
        sign_up_email_error_message_element_list[i].setAttribute('hidden', '');
    }
}

async function display_company_name_in_title_bar(user){
    const querySnapshot = await getDocs(collection(database, "user_information"));
    querySnapshot.forEach((doc) => {
        if(doc.data().email_address == user.email){
            page_title.innerHTML = doc.data().company;
        }
    });
}

function display_dashboard(user){
    sign_up_form_container.setAttribute("hidden", "");
    login_form_container.setAttribute("hidden", "");
    login_page_state = 2;
    upper_login_btn.innerHTML = upper_login_btn.innerHTML = avatar_image_html.concat("Sign out\n");

    display_company_name_in_title_bar(user);
}

async function sign_up_user(){
    let company_name = sign_up_company_name_txt.value;
    let email = sign_up_email_txt.value;
    let pwd = sign_up_pwd_txt.value;
    let re_pwd = sign_up_re_pwd_txt.value;

    remove_email_already_in_use_error();

    if (check_form_validity(email, pwd, re_pwd)){
        try {
            const doc_reference = await addDoc(collection(database, "user_information"), {
              email_address: email,
              company: company_name,
              departments: "",
            });
            console.log("Document written with ID: ", doc_reference.id);

            company_name_registration_error = false;
        } 
        catch (e) {
            company_name_registration_error = true;
            console.error("Error adding document: ", e);
            console.log(e);
        }

        if(!company_name_registration_error){
            createUserWithEmailAndPassword(auth, email, pwd)
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                
                console.log('ERROR (%d): %s', errorCode, errorMessage);

                if(errorMessage.indexOf("email-already-in-use") > -1){
                    display_email_already_in_use_error();
                }
            });
        }
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
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log(errorMessage);

            notify_login_error(errorMessage);
        });
}

function display_login(){
    if (!refreshed){
        window.location.reload();
        refreshed = true;
    }

    sign_up_form_container.setAttribute("hidden", "");
    login_form_container.removeAttribute("hidden");
    login_page_state = 0;
    upper_login_btn.innerHTML = avatar_image_html.concat("Sign up\n");
    page_title.innerHTML = "Smart Energy Meter Dashboard";
}

function empty_login_sign_up_text_fields(){
    login_email_txt.value = "";
    login_pwd_txt.value = "";
    sign_up_company_name_txt.value = "";
    sign_up_email_txt.value = "";
    sign_up_pwd_txt.value = "";
    sign_up_re_pwd_txt.value = "";
}

//dashboard control functions
function generate_column_hidden(){
    let begin_html = '<div class="col content_centered"><button type="button" class="btn btn-light department_button" hidden>';
    let end_html = '</button></div>';

    return begin_html + end_html;
}

function generate_column_visible(dpt_name){
    let begin_html = '<div class="col content_centered"><button type="button" class="btn btn-light department_button">';
    let end_html = '</button></div>';

    return begin_html + dpt_name + end_html;
}

function generate_first_row(dpt_names){
    let begin_html = '<div class="row row_extended"><div class="col content_centered"><button type="button" class="btn btn-light department_button" data-bs-toggle="modal" data-bs-target="#department_name_modal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/></svg></button></div>';
    let end_html = '</div>';
    let final_html = begin_html;

    for (let i=0; i<4; i++){
        if (i < dpt_names.length){
            final_html = final_html + generate_column_visible(dpt_names[i]);
        }
        else{
            final_html = final_html + generate_column_hidden();
        }
    }

    final_html = final_html + end_html;

    return final_html;
}

function generate_middle_row(dpt_names){
    let begin_html = '<div class="row row_extended">';
    let end_html = '</div>';
    let final_html = begin_html;

    for (let i=0; i<5; i++){
        if (i < dpt_names.length){
            final_html = final_html + generate_column_visible(dpt_names[i]);
        }
        else{
            final_html = final_html + generate_column_hidden();
        }
    }

    final_html = final_html + end_html;

    return final_html;
}

function generate_dashboard_html(departments, num_rows){
    let begin_html = '<div class="container-lg dashboard_container">';
    let end_html = '</div>';
    let final_html = begin_html;


    for (let i=0; i<num_rows; i++){
        if(i==0){
            final_html = final_html + generate_first_row(departments.slice(0, 4));
        }
        else{
            final_html = final_html + generate_middle_row(departments.slice(5*i-1, 5*i+4));
        }
    }

    if (num_rows == 0){
        final_html = final_html + generate_first_row(departments.slice(0, 4));
    }

    final_html  = final_html + end_html;

    return final_html;
}

async function load_departments(user){
    //let user = auth.currentUser;
    let departments;
    let department_count;
    let num_rows;
    let dashboard_html;


    if(user){
        const querySnapshot = await getDocs(collection(database, "user_information"));
        querySnapshot.forEach((doc) => {
            if(doc.data().email_address == user.email){
                departments = doc.data().departments;
            }
        });
        

        if (typeof(departments) !== 'undefined'){
            departments = departments.split(",");
        }
        else{
            departments = [];
        }
        
        department_count = departments.length;
        num_rows = Math.floor(department_count/5) + 1;


        dashboard_html = generate_dashboard_html(departments, num_rows);

        main_body_container.insertAdjacentHTML('beforeend', dashboard_html);

        new_dpt_modal_txt = document.getElementById('new_department_txt');
        new_dpt_modal_add_btn = document.getElementById('add_new_dpt_btn');
        new_dpt_modal_close_btn = document.getElementById('new_department_close_btn');
        new_dpt_modal_add_btn.addEventListener('click', add_new_department);
        
        return true;
    }
    
    return false;
}

async function add_new_department(){
    let user = auth.currentUser;
    let doc_id;
    let prev_department_record;
    let new_department = new_dpt_modal_txt.value;
    let new_department_record;

    if(user){
        const querySnapshot = await getDocs(collection(database, "user_information"));
        querySnapshot.forEach((doc) => {
            if(doc.data().email_address == user.email){
                prev_department_record = doc.data().departments;
                doc_id = doc.id;
            }
        });

        console.log(prev_department_record);

        if(typeof(prev_department_record) !== 'undefined'){
            new_department_record = prev_department_record + ',' + new_department;
        }
        else{
            new_department_record = new_department;
        }
        
        await updateDoc(doc(database, "user_information", doc_id), { 
            departments: new_department_record
        });

        new_dpt_modal_close_btn.click();
        new_dpt_modal_txt.value = "";

        console.log("success");
        window.location.reload();
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        refreshed = false;
        remove_email_already_in_use_error();
        empty_login_sign_up_text_fields();
        display_dashboard(user);
        load_departments(user);
    } 
    else {
        display_login();
    }
  });