const QUIZ_API = 'https://us-central1-vn-site-short-url.cloudfunctions.net/widgets';
const QUIZ_TOKEN = 'quiz-token';
const QUIZ_USER = 'quiz-user';
const QUIZ_EMAIL = 'quiz-email';
const QUIZ_COUNTDOWN = 5 * 60 * 1000;

function getCodeFromUserInput() {
  return document.getElementById('verification-code').value;
}

function getPhoneNumberFromUserInput() {
  return document.getElementById('phone-country').innerText + document.getElementById('phone-number').value;
}

function getEmailFromUserInput() {
  return document.getElementById('email').value;
}

function getFullnameFromUserInput() {
  return document.getElementById('fullname').value;
}

function isPhoneNumberValid() {
  var pattern = /^\+[0-9\s\-\(\)]+$/;
  var phoneNumber = getPhoneNumberFromUserInput();
  return phoneNumber.length >= 12 && phoneNumber.search(pattern) !== -1 ;
}

function isEmail() {
  var pattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/;
  var email = getEmailFromUserInput();
  return email.search(pattern) !== -1;
}

function isFullname() {
  var fullname = getFullnameFromUserInput();
  return fullname;
}

function resetReCaptcha() {
  if (typeof grecaptcha !== 'undefined'
      && typeof window.recaptchaWidgetId !== 'undefined') {
    grecaptcha.reset(window.recaptchaWidgetId);
  }
}

function updateSignInFormUI() {
  if (firebase.auth().currentUser || window.confirmationResult || getQuizToken()) {
    document.getElementById('sign-in-form').style.display = 'none';
  } else {
    resetReCaptcha();
    document.getElementById('sign-in-form').style.display = 'block';
  }
}

function updateVerificationCodeFormUI() {
  if (!firebase.auth().currentUser && window.confirmationResult) {
    document.getElementById('verification-code-form').style.display = 'block';
  } else {
    document.getElementById('verification-code-form').style.display = 'none';
  }
}

function updateSignOutButtonUI() {
  if (firebase.auth().currentUser) {
    document.getElementById('sign-out-button').style.display = 'block';
  } else {
    document.getElementById('sign-out-button').style.display = 'none';
  }
}

function updateSignInButtonUI() {
  document.getElementById('sign-in-button').disabled =
      !isPhoneNumberValid() || !isEmail() || !isFullname() || !!window.signingIn;
}

function updateVerifyCodeButtonUI() {
  document.getElementById('verify-code-button').disabled =
        !!window.verifyingCode
        || !getCodeFromUserInput();
}

function onSignInSubmit() {
  if ( ! isPhoneNumberValid()) {
    return;
  }

    window.signingIn = true;

    var phoneNumber = getPhoneNumberFromUserInput();
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(function (confirmationResult) {
        window.confirmationResult = confirmationResult;
        window.signingIn = false;

        updateVerificationCodeFormUI();
        updateVerifyCodeButtonUI();
        updateSignInFormUI();
      }).catch(function (error) {
        // Error; SMS not sent
        window.alert('Error during signInWithPhoneNumber:\n\n'
            + error.code + '\n\n' + error.message);
        window.signingIn = false;
        updateSignInFormUI();

      });
}

function onVerifyCodeSubmit(e) {
  e.preventDefault();
  if (!!getCodeFromUserInput()) {
    window.verifyingCode = true;
    updateVerifyCodeButtonUI();
    var code = getCodeFromUserInput();
    confirmationResult.confirm(code).then(function (result) {
      // User signed in successfully.
      window.verifyingCode = false;
      window.confirmationResult = null;
      saveUserInfo(result.user.ma, getEmailFromUserInput(), getFullnameFromUserInput());
      window.location.href = '/';
    }).catch(function (error) {
      // User couldn't sign in (bad verification code?)
      window.alert('Error while checking the verification code:\n\n'
          + error.code + '\n\n' + error.message);
      window.verifyingCode = false;
      updateSignInButtonUI();
      updateVerifyCodeButtonUI();
    });
  }
}

function isExistUser() {
  let mobile = getPhoneNumberFromUserInput();
  fetch(`${QUIZ_API}/users/${mobile}`)
  .then(response => response.json())
  .then(result => {
    if (result) {
      document.getElementById('sign-in-button').disabled = true;
      document.getElementById('warnning-exist-user').style.display = 'block';
    } else {
      onSignInSubmit();
    }
  });
}

function setQuizToken() {
  let token = localStorage.getItem(QUIZ_TOKEN);
  $('#eroot').attr('token', token);
  $('#eroot').attr('data-json', `${QUIZ_API}/quiz`);
}

function getQuizToken() {
  return localStorage.getItem(QUIZ_TOKEN);
}

function saveUserInfo(token, email, fullname) {
  localStorage.setItem(QUIZ_USER, fullname);
  localStorage.setItem(QUIZ_EMAIL, email);
  localStorage.setItem(QUIZ_TOKEN, token);
}

function displayCountdown() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      if (user.photoURL) {
        window.location.href = 'score.html';
      }
      let lastLogin = new Date(user.metadata.lastSignInTime).getTime() + QUIZ_COUNTDOWN;
      let startCount = new Date(lastLogin);
      $('#countdown').countdown(startCount, function(event) {
        if (event.timeStamp > lastLogin) {
          window.location.href = 'score.html';
        }
        var $this = $(this).html(event.strftime(''
          + '<span class="h1 font-weight-bold">%M</span> Min'
          + '<span class="h1 font-weight-bold">%S</span> Sec'));
      });
    } else {
      window.location.href = 'index.html';
    }
  })
}

function displayScore() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      let score = user.photoURL ? user.photoURL.match(/\d+/) : 0;
      $("#score").data('percent', score/5*100).data('score',`${score}/5`).loading();
    } else {
      window.location.href = 'index.html';
    }
  })
}

function bindEvent() {
  document.getElementById('phone-number').addEventListener('keyup', updateSignInButtonUI);
  document.getElementById('phone-number').addEventListener('change', updateSignInButtonUI);
  document.getElementById('email').addEventListener('keyup', updateSignInButtonUI);
  document.getElementById('email').addEventListener('change', updateSignInButtonUI);
  document.getElementById('fullname').addEventListener('keyup', updateSignInButtonUI);
  document.getElementById('fullname').addEventListener('change', updateSignInButtonUI);
  document.getElementById('verification-code').addEventListener('keyup', updateVerifyCodeButtonUI);
  document.getElementById('verification-code').addEventListener('change', updateVerifyCodeButtonUI);

  document.getElementById('sign-in-button').addEventListener('click', isExistUser);
  document.getElementById('verify-code-button').addEventListener('click', onVerifyCodeSubmit);
}