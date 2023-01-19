// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirebaseConfig } from "./firebase-config";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { getDatabase, ref, set, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const firebaseAppConfig = getFirebaseConfig();
const app = initializeApp(firebaseAppConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getFirestore(app);
const real_time_database = getDatabase(app);

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

//department dashboard elements
var department_btns = [];

//device dashboard elements
var add_new_device_type_btn = document.getElementById('add_new_type_btn');

//new device type modal
var new_device_type_modal_txt = document.getElementById('new_type_add_modal_txt');
var new_device_type_modal_add_btn = document.getElementById('new_type_add_modal_submit_btn');
var new_device_type_modal_close_btn = document.getElementById('new_type_add_modal_close_btn');

//new device modal
var add_new_device_modal_device_id_txt = document.getElementById('device_add_modal_id_txt');
var add_new_device_modal_device_name_txt = document.getElementById('device_add_modal_name_txt');
var add_new_device_modal_type_select = document.getElementById('device_add_modal_type_select');
var add_new_device_modal_submit_btn = document.getElementById('add_new_device_btn');
var add_new_device_modal_close_btn = document.getElementById('device_add_modal_close_btn');
var add_new_device_modal_device_id_error_space = document.getElementById('device_id_error_message_space');

//individual device dashboard elements
var individual_device_dashboard_container = document.getElementById('individual_device_dashboard_container');
var device_switch = document.getElementById('device_switch'); 
var switch_on_time_txt = document.getElementById('switch_on_time_txt');
var switch_off_time_txt = document.getElementById('switch_off_time_txt');
var set_routine_btn = document.getElementById('set_routine_btn');

var primary_plot_data;
var primary_plot_layout;
var reactive_power_plot_data;
var reactive_power_plot_layout;
var voltage_fluctuations_plot_data;
var voltage_fluctuations_plot_layout;
var power_factor_fluctuations_plot_data;
var power_factor_fluctuations_plot_layout;
var timestamps;
var v_rms = [];
var i_rms = [];
var active_power = [];
var reactive_power = [];
var power_factor = [];

var daily_power_consumption_container = document.getElementById('daily_power_consumption_container');
var monthly_power_consumption_container = document.getElementById('monthly_power_consumption_container');

//EVENT LISTNERS
sign_up_submit_btn.addEventListener('click', sign_up_user);
normal_login_btn.addEventListener('click', login_user);
upper_login_btn.addEventListener('click', change_login_form);
new_device_type_modal_add_btn.addEventListener('click', add_new_device_type);
add_new_device_modal_submit_btn.addEventListener('click', add_new_device);
device_switch.addEventListener('change', switch_device);
set_routine_btn.addEventListener('click', set_device_routine);

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

function generate_device_first_row(device_names){
    let begin_html = '<div class="row row_extended"><div class="col content_centered"><button type="button" class="btn btn-light department_button" data-bs-toggle="modal" data-bs-target="#device_add_modal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/></svg></button></div>';
    let end_html = '</div>';
    let final_html = begin_html;

    for (let i=0; i<4; i++){
        if (i < device_names.length){
            final_html = final_html + generate_column_visible(device_names[i]);
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

function generate_device_dashboard_html(devices, num_rows){
    let begin_html = '<div class="container-lg device_dashboard_container">';
    let end_html = '</div>';
    let final_html = begin_html;


    for (let i=0; i<num_rows; i++){
        if(i==0){
            final_html = final_html + generate_device_first_row(devices.slice(0, 4));
        }
        else{
            final_html = final_html + generate_middle_row(devices.slice(5*i-1, 5*i+4));
        }
    }

    if (num_rows == 0){
        final_html = final_html + generate_first_row(devices.slice(0, 4));
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
    let temp_department_btns;


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

        temp_department_btns = document.getElementsByClassName('container-lg dashboard_container')[0].children;

        for (let i=0; i<temp_department_btns.length; i++){
            let actual_department_btns = temp_department_btns[i].children;

            for (let j=0; j<actual_department_btns.length; j++){
                if (i != 0 || j != 0){
                    if (!actual_department_btns[j].children[0].hasAttribute('hidden')){
                        actual_department_btns[j].children[0].addEventListener('click', load_devices);
                        department_btns.push(actual_department_btns[j].children[0]);
                    }
                }
            }
        }

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

        await addDoc(collection(database, "department_information"), {
            email_address: user.email,
            department: new_department,
        });

        new_dpt_modal_close_btn.click();
        new_dpt_modal_txt.value = "";

        console.log("success");
        window.location.reload();
    }
}

function generate_option_html(value){
    let begin_html = '<option value="';
    let middle_html = '">';
    let end_html = '</option>';

    return begin_html + value + middle_html + value + end_html
}

async function load_devices(event){
    let user = auth.currentUser;
    let department_dashboard_container = document.getElementsByClassName('container-lg dashboard_container')[0];
    let department_name = event.currentTarget.innerHTML;
    let devices;
    let device_count;
    let num_rows;
    let device_dashboard_html;
    let device_types;
    let temp_device_btns;

    if(user){
        department_dashboard_container.setAttribute('hidden', '');
        page_title.insertAdjacentHTML("beforeend", " | " + department_name); 
        add_new_device_type_btn.removeAttribute('hidden');
        add_new_device_modal_device_id_error_space.setAttribute('hidden', '');

        const querySnapshot_user_info = await getDocs(collection(database, "user_information"));
        querySnapshot_user_info.forEach((doc) => {
            if(doc.data().email_address == user.email){
                device_types = doc.data().device_types;
            }
        });

        if (typeof(device_types) !== 'undefined'){
            device_types = device_types.split(",");
        }
        else{
            device_types = [];
        }

        for (let i=0; i<device_types.length; i++){
            add_new_device_modal_type_select.insertAdjacentHTML("beforeend", generate_option_html(device_types[i]));
        }

        const querySnapshot = await getDocs(collection(database, "department_information"));
        querySnapshot.forEach((doc) => {
            if(doc.data().email_address == user.email && doc.data().department == department_name){
                devices = doc.data().devices;
            }
        });
        

        if (typeof(devices) !== 'undefined'){
            devices = devices.split(",");

            for (let i=0; i<devices.length; i++){
                let hold = devices[i].split(":");
                devices[i] = hold[1] + " [" + hold[0] + "]";
            }
        }
        else{
            devices = [];
        }
        
        device_count = devices.length;
        num_rows = Math.floor(device_count/5) + 1;

        device_dashboard_html = generate_device_dashboard_html(devices, num_rows);

        main_body_container.insertAdjacentHTML('beforeend', device_dashboard_html);

        temp_device_btns = document.getElementsByClassName('container-lg device_dashboard_container')[0].children;

        for (let i=0; i<temp_device_btns.length; i++){
            let actual_device_btns = temp_device_btns[i].children;

            for (let j=0; j<actual_device_btns.length; j++){
                if (i != 0 || j != 0){
                    if (!actual_device_btns[j].children[0].hasAttribute('hidden')){
                        actual_device_btns[j].children[0].addEventListener('click', load_individual_device_dashboard);
                    }
                }
            }
        }
    }
}

async function add_new_device_type(){
    let user = auth.currentUser;
    let new_device_type;
    let perv_device_types_record;
    let new_device_types_record;
    let doc_id;

    if(user){
        new_device_type = new_device_type_modal_txt.value;

        const querySnapshot = await getDocs(collection(database, "user_information"));
        querySnapshot.forEach((doc) => {
            if(doc.data().email_address == user.email){
                perv_device_types_record = doc.data().device_types;
                doc_id = doc.id;
            }
        });

        if(typeof(perv_device_types_record) !== 'undefined'){
            new_device_types_record = perv_device_types_record + ',' + new_device_type;
        }
        else{
            new_device_types_record = new_device_type;
        }

        await updateDoc(doc(database, "user_information", doc_id), { 
            device_types: new_device_types_record
        });

        new_device_type_modal_close_btn.click();
        new_device_type_modal_txt.value = "";

        window.location.reload();
    }
}

async function add_new_device(){
    let user = auth.currentUser;
    let device_name;
    let device_id;
    let device_type;
    let existing_device_ids;
    let existing_device_ids_list;
    let new_devices_ids;
    let doc_id;
    let department_name = page_title.innerHTML.split("|")[1].trim();
    let existing_devices_record;
    let new_devices_record;

    console.log(department_name);

    if (user){
        device_id = add_new_device_modal_device_id_txt.value;

        const querySnapshot = await getDocs(collection(database, "user_information"));
        querySnapshot.forEach((doc) => {
            if(doc.data().email_address == user.email){
                existing_device_ids = doc.data().devices;
                doc_id = doc.id;
            }
        });

        if (typeof(existing_device_ids) !== 'undefined'){
            existing_device_ids_list = existing_device_ids.split(",");

            if(existing_device_ids_list.indexOf(device_id) > -1){
                add_new_device_modal_device_id_error_space.removeAttribute('hidden');
                return;
            }

            new_devices_ids = existing_device_ids + "," + device_id;
        }
        else{
            new_devices_ids = device_id;
        }

        await updateDoc(doc(database, "user_information", doc_id), { 
            devices: new_devices_ids
        });

        device_name = add_new_device_modal_device_name_txt.value;
        device_type = add_new_device_modal_type_select.options[add_new_device_modal_type_select.selectedIndex].value;

        const querySnapshot_dpt_info = await getDocs(collection(database, "department_information"));
        querySnapshot_dpt_info.forEach((doc) => {
            if(doc.data().email_address == user.email && doc.data().department == department_name){
                existing_devices_record = doc.data().devices;
                doc_id = doc.id;
            }
        });

        if (typeof(existing_devices_record) !== 'undefined'){
            new_devices_record = existing_devices_record + "," + device_id + ":" + device_name + ":" + device_type;
        }
        else{
            new_devices_record = device_id + ":" + device_name + ":" + device_type;
        }

        await updateDoc(doc(database, "department_information", doc_id), { 
            devices: new_devices_record
        });

        add_new_device_modal_device_id_txt.value = "";
        add_new_device_modal_device_name_txt.value = "";
        add_new_device_modal_close_btn.click();
        window.location.reload();

    }
}

function check_two_dates(date_1, date_2){
    return (date_1.getFullYear() == date_2.getFullYear()) && (date_1.getMonth() == date_2.getMonth()) && (date_1.getDate() == date_2.getDate());
}

function check_two_months(date_1, date_2){
    return (date_1.getFullYear() == date_2.getFullYear()) && (date_1.getMonth() == date_2.getMonth());
}

function load_individual_device_dashboard(event){
    let user = auth.currentUser;
    let device_dashboard_container;
    let device_name;
    let device_id;
    let daily_power_consumption = 0;
    let monthly_power_consumption = 0;
    let prev_power_val_daily = 0;
    let prev_time_stamp_daily;
    let prev_power_val_monthly = 0;
    let prev_time_stamp_monthly;
    let today_date = new Date();

    if(user){
        device_dashboard_container = document.getElementsByClassName('container-lg device_dashboard_container')[0];
        device_dashboard_container.setAttribute('hidden', '');
        
        device_name = event.currentTarget.innerHTML;
        page_title.insertAdjacentHTML("beforeend", " | " + device_name); 
        add_new_device_type_btn.setAttribute('hidden', '');

        device_id = device_name.split('[')[1];
        device_id = device_id.substring(0, device_id.length-1);

        onValue(ref(real_time_database, 'state/' + device_id), (snapshot) => {
            const data = snapshot.val();
            
            if(data){
                if(data["on"]){
                    device_switch.checked = true;
                }
                else{
                    device_switch.checked = false;
                }
            }
        });

        individual_device_dashboard_container.removeAttribute('hidden');

        onValue(ref(real_time_database, 'data/' + device_id), (snapshot) => {
            const data = snapshot.val();

            if(data){
                timestamps = Object.keys(data);

                for (let i=0; i<timestamps.length; i++){
                    timestamps[i] = parseInt(timestamps[i]);
                    v_rms.push(parseFloat(data[timestamps[i]]["v_rms"]));
                    i_rms.push(parseFloat(data[timestamps[i]]["i_rms"]));
                    active_power.push(parseFloat(data[timestamps[i]]["active_power"]));
                    reactive_power.push(parseFloat(data[timestamps[i]]["reactive_power"]));
                    power_factor.push(Math.cos(Math.atan(reactive_power[i]/active_power[i])));

                    let hold_date = new Date(timestamps[i] * 1000);
                    timestamps[i] = hold_date.toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo'});

                    if (check_two_dates(today_date, hold_date)){
                        if(typeof(prev_time_stamp_daily) !== 'undefined'){
                            let time_difference = (hold_date.getTime() - prev_time_stamp_daily.getTime())/1000;
                            daily_power_consumption = daily_power_consumption + prev_power_val_daily * time_difference / 1000;
                        }

                        prev_time_stamp_daily = hold_date;
                        prev_power_val_daily = active_power[i];
                    }

                    if (check_two_months(today_date, hold_date)){
                        if(typeof(prev_time_stamp_monthly) !== 'undefined'){
                            let time_difference = (hold_date.getTime() - prev_time_stamp_monthly.getTime())/1000;
                            monthly_power_consumption = monthly_power_consumption + prev_power_val_monthly * time_difference / 1000;
                        }

                        prev_time_stamp_monthly = hold_date;
                        prev_power_val_monthly = active_power[i];
                    }
                }

                daily_power_consumption = daily_power_consumption / 3600;
                monthly_power_consumption = monthly_power_consumption / 3600;

                daily_power_consumption = Math.round(daily_power_consumption * 10000) / 10000;
                monthly_power_consumption = Math.round(monthly_power_consumption * 10000) / 10000;

                daily_power_consumption_container.innerHTML = "Daily Power Consumption: " + daily_power_consumption.toString() + " units (kWh)";
                monthly_power_consumption_container.innerHTML = "Monthly Power Consumption: " + monthly_power_consumption.toString() + " units (kWh)";

                console.log(daily_power_consumption);
                console.log(monthly_power_consumption);

                //timestamps = timestamps.map(Number);
                // v_rms = v_rms.map(Number);
                // i_rms = i_rms.map(Number);
                // active_power = active_power.map(Number);
                // reactive_power = reactive_power.map(Number);
                
    
                console.log(typeof(timestamps[0]));
                console.log(timestamps);
                console.log(v_rms);
                console.log(i_rms);
                console.log(active_power);
                console.log(reactive_power);

                primary_plot_data = [{
                    x: timestamps,
                    y: active_power,
                    type:"scatter"
                }];

                primary_plot_layout = {
                    yaxis: {title: "Watts"},  
                    title: "Power Consumption",
                    automargin: true,
                    autosize: false,
                    width: 750,
                    height: 500,
                    margin: {
                      l: 50,
                      r: 50,
                      b: 100,
                      t: 100,
                      pad: 4
                    },
                };

                reactive_power_plot_data = [{
                    x: timestamps,
                    y: reactive_power,
                    type:"scatter"
                }];

                reactive_power_plot_layout = {
                    yaxis: {title: "VA"},  
                    title: "Reactive Power",
                    automargin: true,
                    autosize: false,
                    width: 750,
                    height: 500,
                    margin: {
                      l: 50,
                      r: 50,
                      b: 100,
                      t: 100,
                      pad: 4
                    },
                };

                voltage_fluctuations_plot_data = [{
                    x: timestamps,
                    y: v_rms,
                    type:"scatter"
                }];

                voltage_fluctuations_plot_layout = {
                    yaxis: {title: "Volts"},  
                    title: "Voltage Fluctuations",
                    automargin: true,
                    autosize: false,
                    width: 750,
                    height: 500,
                    margin: {
                      l: 50,
                      r: 50,
                      b: 100,
                      t: 100,
                      pad: 4
                    },
                };
                
                power_factor_fluctuations_plot_data = [{
                    x: timestamps,
                    y: power_factor,
                    type:"scatter"
                }];

                power_factor_fluctuations_plot_layout = { 
                    title: "Power Factor Fluctuations",
                    automargin: true,
                    autosize: false,
                    width: 750,
                    height: 500,
                    margin: {
                      l: 50,
                      r: 50,
                      b: 100,
                      t: 100,
                      pad: 4
                    },
                };

                Plotly.newPlot("primary_plot", primary_plot_data, primary_plot_layout);
                Plotly.newPlot("reactive_power_plot", reactive_power_plot_data, reactive_power_plot_layout);
                Plotly.newPlot("voltage_fluctuations_plot", voltage_fluctuations_plot_data, voltage_fluctuations_plot_layout);
                Plotly.newPlot("power_factor_fluctuations_plot", power_factor_fluctuations_plot_data, power_factor_fluctuations_plot_layout);
                
            }
        });
    }
}

function set_state_in_database(device_id, state){
    set(ref(real_time_database, 'state/' + device_id), {
        on: state
    });
}

function switch_device(event){
    let user = auth.currentUser;
    let device_id;

    if(user){
        device_id = page_title.innerHTML.split('|')[2].split('[')[1];
        device_id = device_id.substring(0, device_id.length-1);

        set_state_in_database(device_id, event.target.checked);
    }
}

function set_device_routine(){
    let user = auth.currentUser;
    let device_id;

    if(user){
        device_id = page_title.innerHTML.split('|')[2].split('[')[1];
        device_id = device_id.substring(0, device_id.length-1);

        set(ref(real_time_database, 'routine/' + device_id), {
            switch_on_time: switch_on_time_txt.value,
            switch_off_time: switch_off_time_txt.value
        });

        switch_on_time_txt.value = "";
        switch_off_time_txt.value = "";
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