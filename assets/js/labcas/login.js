Cookies.set("token", "None");
$(document).ready(function(){
$.getJSON( '/clinical-ui/assets/conf/environment.cfg?2', function(json) {
	$.each( json, function( key, val ) {
		console.log(key);
		localStorage.setItem(key, val);
	});
}, 'text').done(function(d) {
                console.log("Config done");
            }).fail(function(d, textStatus, error) {
                console.error("Config failed, status: " + textStatus + ", error: "+error);
            }).always(function(d) {
                console.log("Config complete");
            });
	$('#loginerror').html(localStorage.getItem("login_msg"));
});
$('#loginform').submit(function (e) {
	e.preventDefault();
	Cookies.set("user", $('#username').val());
	Cookies.set("userletters", $('#username').val().substr(0, 2).toUpperCase());
    Cookies.set("Authorization", "Basic " + btoa($('#username').val() + ":" + $('#password').val()));
    Cookies.set("logout_alert","Off");
    //Get user data, then redirect
    user_data = {"FavoriteCollections":[],"FavoriteDatasets":[],"FavoriteFiles":[]};
    if (!user_data["FavoriteCollections"]){
        user_data["FavoriteCollections"] = [];
    }
    if (!user_data["FavoriteDatasets"]){
        user_data["FavoriteDatasets"] = [];
    }
    if (!user_data["FavoriteFiles"]){
        user_data["FavoriteFiles"] = [];
    }
    console.log("userdata");
    console.log(user_data);
    localStorage.setItem("userdata",  JSON.stringify(user_data));
    if (Cookies.get("login_redirect")){
        window.location.replace(Cookies.get("login_redirect"));
    }else{
        window.location.replace("/clinical-ui/m/index.html");
    }
});
