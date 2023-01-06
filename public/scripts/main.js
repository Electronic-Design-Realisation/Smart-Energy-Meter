//elements
const upper_login_btn = document.getElementById('upper_login_btn');
const login_form_container = document.getElementById('login_form_container');
const sign_up_form_container = document.getElementById('sign_up_form_container');

//event listeners
upper_login_btn.addEventListener('click', change_login_form);


//variables
var login_page_state = 0; // 0: Login UI, 1: Sign Up UI
var avatar_image_html = '\n<img src="images/img_avatar_male.png" class="img-fluid rounded profile_picture" alt="unkown user"> \n';

//functions
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
}