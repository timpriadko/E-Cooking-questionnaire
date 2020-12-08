'use strict';

$(document).ready(function () {
  //disable context
  $(document).bind("contextmenu", function (e) {
    return false;
  });

  // form-input
  $('input').focus(function () {
    $(this).parents('.form-group').addClass('focused');
  });

  $('input').blur(function () {
    var inputValue = $(this).val();
    if (inputValue == "") {
      $(this).removeClass('filled');
      $(this).parents('.form-group').removeClass('focused');
    } else {
      $(this).addClass('filled');
    }
  });

  //validate email
  function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,6})+$/;
    return regex.test(email);
  };

  // validate form
  var email = $('#email');
  var customerSubmitLabel = $('#customer_form_label');
  var customerSubmit = $('#customer_form_submit');
  var text_inputs = $('.details-form input[type=text]:not([name=address2])');
  // var gender_select = $('select[name=gender]');
  // var birth_date = $('#birth_date');
  var country_select = $('select[name=country]');
  // var confirm_email = $('input[name=confirm_email]');
  var terms = $('#terms');

  var form_validation = function () {
    var text_inputs_filled_arr = [];
    var text_inputs_filled = false;

    // text inputs require validation
    text_inputs.each(function () {
      if ($(this).val() === '') {
        text_inputs_filled_arr.push(false)
        $(this).closest('div').addClass('required');
      } else {
        text_inputs_filled_arr.push(true)
        $(this).closest('div').removeClass('required');
      }
    })

    // check if all text inputs are filled
    text_inputs_filled = !text_inputs_filled_arr.includes(false);

    // email validation
    if (!isEmail(email.val()) && !email.hasClass('required')) {
      email.closest('div').addClass('invalid-email');
    } else {
      email.closest('div').removeClass('invalid-email');
    }

    // form validation
    if (isEmail(email.val()) &&
      text_inputs_filled === true &&
      country_select.val() !== "" &&
      $(terms).is(':checked')
    ) {
      customerSubmit.removeAttr('disabled');
      customerSubmitLabel.removeClass('disabled');
    } else {
      customerSubmit.attr('disabled', 'disabled');
      customerSubmitLabel.addClass('disabled');
    }
  };

  email.change(function () {
    form_validation()
  });

  email.keyup(function () {
    form_validation()
  });

  text_inputs.keyup(function () {
    form_validation()
  });

  terms.click(form_validation);

  /* setup modal */
  var termsBtn = $('.terms-btn');
  var policyBtn = $('.policy-btn');
  var informationProvided = $('.information-provided');
  var termsModal = $('#modal-terms');
  var policyModal = $('#modal-policy');
  var modalInformation = $('#modal-information');
  var closeBtn = $('.ui-close-modal');

  termsBtn.on('click', function () {
    termsModal.addClass('show');
  });

  policyBtn.on('click', function () {
    policyModal.addClass('show');
  });

  informationProvided.on('click', function () {
    modalInformation.addClass('show');
  });

  closeBtn.on('click', function () {
    termsModal.removeClass('show');
    policyModal.removeClass('show');
    modalInformation.removeClass('show');
  });

  // close modal by clicking outside the modal window
  $('.modal-wrap').click(function (e) {
    if (e.target === $('.modal-wrap.show')[0]) {
      $('.modal-wrap').removeClass('show');
    }
  })

  // question functionality
  var btns_incorrect = $('.question input[type=radio]:not([data-answer=correct])');
  var btn_correct = $('.question input[type=radio][data-answer=correct]');
  var btn_submit = $('.submit');
  var answer_box = $('.question .answer');
  var all_btns = $(".question input[type='radio']");
  var question_form_submitted = false;

  function questionHandler(e) {
    e.preventDefault();

    var form = $(this).closest('form');
    var selected_radio_button = $(".question input[type='radio']:checked");
    var selected_radio_button_label = $(".question input[type='radio']:checked").closest('label');
    var btns_not_checked = $(".question input[type='radio']:not(:checked)");

    // selected_radio_button_label.addClass('checked');

    function disableBtns() {
      btns_not_checked.attr('readonly', true);
    }


    if (selected_radio_button.val() === btn_correct.val()) {
      disableBtns();
      answer_box.addClass('answer__correct').text('Correct');
    } else {
      disableBtns();
      answer_box.addClass('answer__incorrect').text('Incorrect');
      btn_correct.closest('label').addClass('green-border');
    }

    question_form_submitted = true;

    // submit form
    setTimeout(function () {
      form.submit();
    }, 1500);
  }

  btn_submit.click(questionHandler)

  // button Highlight
  function buttonHighlight() {
    if (question_form_submitted === false) {
      all_btns.each(function () {
        $(this).closest('label').removeClass('checked');
      })
      $(this).closest('label').addClass('checked');
    }
  }

  all_btns.click(buttonHighlight)

  /* end modal */

  // get poll_session
  var req = new XMLHttpRequest();
  req.open('GET', document.location, false);
  req.send(null);
  var headers = req.getAllResponseHeaders().toLowerCase();
  var headersArr = headers.trim().split('\n');

  function getPollSession(arr) {
    var poll_session;

    arr.forEach(function (item) {
      var ItemKey = item.split(':')[0];
      var itemValue = item.split(':')[1];

      if (ItemKey === 'poll-session') {
        poll_session = itemValue;
      }
    })
    return poll_session;
  }

  var poll_session = getPollSession(headersArr) !== undefined ? getPollSession(headersArr).trim() : false;

  // get timezone offset
  var date = new Date();
  const currentTimeZoneOffsetInHours_func = () => {
    let offset = date.getTimezoneOffset() / 60;
    if (Math.sign(offset) === -1) {
      return Math.abs(offset);
    }
    if (Math.sign(offset) === 1) {
      return -Math.abs(offset);
    }
    if (Math.sign(offset) === 0 && Math.sign(offset) === -0) {
      return Math.abs(offset);
    }
  };

  const currentTimeZoneOffsetInHours = currentTimeZoneOffsetInHours_func();
  console.log(currentTimeZoneOffsetInHours)

  // send timezone offset to server
  var setTimezoneReques_sent = sessionStorage.getItem('setTimezoneReques_sent');
  if (setTimezoneReques_sent !== 'true' && poll_session) {
    var base_url = window.location.origin;
    var setTimezoneRequest_Url = `${base_url}/bo/poll-sessions/${poll_session}/set-tz-offset/${currentTimeZoneOffsetInHours}/`;
    $.ajax({
      url: setTimezoneRequest_Url,
      type: "GET",
      success: function (data) {
        console.log(data);
        // set setTimezoneReques_sent to true
        sessionStorage.setItem('setTimezoneReques_sent', 'true');
      },
      error: function (error_data) {
        console.log(error_data);
      }
    });
  }

});
