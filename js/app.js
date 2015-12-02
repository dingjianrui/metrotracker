/**
 * Created by Jason on 2015-11-29.
 */
function ViewModel() {
    var self = this;
    var apiUrl = 'http://securedwebapi.azurewebsites.net';
    //apiUrl = 'http://localhost:3790';

    var tokenKey = 'accessToken';

    self.result = ko.observable();
    self.user = ko.observable();

    self.registerEmail = ko.observable();
    self.registerPassword = ko.observable();
    self.registerPassword2 = ko.observable();
    self.shouldShowMessage = ko.observable();
    self.displayMessage = ko.observable();


    if ($.cookie('mt_userName') != undefined) {
        $("#rememberMe").attr("checked", true);
        //read cookie
        self.loginEmail = ko.observable($.cookie('mt_userName'));
        self.loginPassword = ko.observable($.cookie('mt_password'));
        self.rememberMe = ko.observable('checked');
    } else {
        $("#rememberMe").attr("checked", false);
        self.loginEmail = ko.observable();
        self.loginPassword = ko.observable();
        self.rememberMe = ko.observable();
    }

    //remember me event
    $("#rememberMe").click(function () {
        if ($('#rememberMe:checked').length > 0) {//set cookie
            $.cookie('mt_userName', $('#username').val());
            $.cookie('mt_password', $('#password').val());
        } else {//clear cookie
            $.removeCookie('mt_userName');
            $.removeCookie('mt_password');
        }
    });

    function showError(jqXHR) {
        self.result(jqXHR.status + ': ' + jqXHR.statusText);
    }

    function isValidEmailAddress(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(emailAddress);
    }

    self.callApi = function () {
        self.result('');

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: '/api/values',
            headers: headers
        }).done(function (data) {
            self.result(data);
        }).fail(showError);
    }

    self.register = function () {
        self.result('');
        self.shouldShowMessage(false);
        self.displayMessage('');

        if(!isValidEmailAddress(self.registerEmail())){
            self.shouldShowMessage(true);
            self.displayMessage('Email is not valid!');
            return;
        }

        if (self.registerPassword() != self.registerPassword2()) {
            self.shouldShowMessage(true);
            self.displayMessage('Password does not match!');
            return;
        }

        var data = {
            Email: self.registerEmail(),
            Password: self.registerPassword(),
            ConfirmPassword: self.registerPassword2()
        };

        $.ajax({
            type: 'POST',
            url: apiUrl + '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.loginEmail = ko.observable(self.registerEmail());
            self.loginPassword = ko.observable(self.registerPassword());
            self.login();
        }).fail(showError);
    }

    self.login = function () {
        self.result('');

        var loginData = {
            grant_type: 'password',
            username: self.loginEmail(),
            password: self.loginPassword()
        };

        //var headers1 = {'Access-Control-Allow-Origin: *'};
        //headers.Authorization = 'Bearer ' + token;

        $.ajax({
            type: 'POST',
            url: apiUrl + '/Token',
            data: loginData,
            crossDomain: true
            //headers: headers1//('Access-Control-Allow-Origin: *')
        }).done(function (data) {
            self.user(data.userName);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            window.location.href = "index.html";
        }).fail(showError);
    }

    self.logout = function () {
        self.user('');
        sessionStorage.removeItem(tokenKey)
    }
}

var app = new ViewModel();
ko.applyBindings(app);
