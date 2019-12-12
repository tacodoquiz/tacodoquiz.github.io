window.onload = function() {
  if (getQuizToken()) {
    updateSignInFormUI();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          let fullname = localStorage.getItem(QUIZ_USER);
          user.updateProfile({ displayName: fullname }).then(function() {
            let email = localStorage.getItem(QUIZ_EMAIL);
            user.updateEmail(email).then(function() {
              window.location.href = 'qna.html';
            })
          })
      } else {
        saveUserInfo('', '', '');
        firebase.auth().signOut();
        window.location.href = '/';
      }
    });
  } else {
    bindEvent();
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      'size': 'invisible',
      'callback': function(response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // isExistUser();
      }
    });

    recaptchaVerifier.render().then(function(widgetId) {
      window.recaptchaWidgetId = widgetId;
      updateSignInButtonUI();
    });
  }
}