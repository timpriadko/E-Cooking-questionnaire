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

  function ifNotSpace(field) {
    var regex = /\S/;
    return regex.test(field);
  }

  if (!Array.prototype.includes) {
    //or use Object.defineProperty
    Array.prototype.includes = function (search) {
      return !!~this.indexOf(search);
    }
  }
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = (function (Object, max, min) {
      "use strict";
      return function indexOf(member, fromIndex) {
        if (this === null || this === undefined) throw TypeError("Array.prototype.indexOf called on null or undefined");

        var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len);
        if (i < 0) i = max(0, Len + i); else if (i >= Len) return -1;

        if (member === void 0) {
          for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i; // undefined
        } else if (member !== member) {
          for (; i !== Len; ++i) if (that[i] !== that[i]) return i; // NaN
        } else for (; i !== Len; ++i) if (that[i] === member) return i; // all else

        return -1; // if the value was not found, then return -1
      };
    })(Object, Math.max, Math.min);
  }

  // validate form
  var email = $('#email');
  var customerSubmitLabel = $('#customer_form_label');
  var customerSubmit = $('#customer_form_submit');
  var text_inputs = $('.details-form input[type=text]:not([name=address2])');
  var birth_date = $('#birth_date');
  var country_select = $('select[name=country]');
  var terms = $('#terms');

  var form_validation = function () {
    var text_inputs_filled_arr = [];
    var text_inputs_filled = false;

    // text inputs require validation
    text_inputs.each(function () {
      if ($(this).val() === '' || !ifNotSpace($(this).val())) {
        text_inputs_filled_arr.push(false);
        $(this).closest('div').addClass('required');
      } else {
        text_inputs_filled_arr.push(true);
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

    // birth_date validation
    if (birth_date.val() === '') {
      birth_date.closest('div').addClass('required');
    } else {
      birth_date.closest('div').removeClass('required');
    }

    // form validation
    if (isEmail(email.val()) &&
      ifNotSpace(email.val()) &&
      text_inputs_filled === true &&
      birth_date.val() !== '' &&
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

  email.on('change', function () {
    form_validation()
  });

  email.on('keyup', function () {
    form_validation()
  });

  text_inputs.on('keyup', function () {
    form_validation()
  });

  terms.on('click', form_validation);

  birth_date.on('change', function () {
    form_validation()
  });

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

  if (!Math.sign) {
    Math.sign = function (x) {
      // If x is NaN, the result is NaN.
      // If x is -0, the result is -0.
      // If x is +0, the result is +0.
      // If x is negative and not -0, the result is -1.
      // If x is positive and not +0, the result is +1.
      return ((x > 0) - (x < 0)) || +x;
      // A more aesthetic pseudo-representation:
      //
      // ( (x > 0) ? 1 : 0 )  // if x is positive, then positive one
      //          +           // else (because you can't be both - and +)
      // ( (x < 0) ? -1 : 0 ) // if x is negative, then negative one
      //         ||           // if x is 0, -0, or NaN, or not a number,
      //         +x           // then the result will be x, (or) if x is
      //                      // not a number, then x converts to number
    };
  }

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
  // console.log(currentTimeZoneOffsetInHours)

  // send timezone offset to server
  var setTimezoneReques_sent = sessionStorage.getItem('setTimezoneReques_sent');
  if (setTimezoneReques_sent !== 'true' && poll_session) {
    var base_url = window.location.origin;
    var setTimezoneRequest_Url = `${base_url}/bo/poll-sessions/${poll_session}/set-tz-offset/${currentTimeZoneOffsetInHours}/`;
    $.ajax({
      url: setTimezoneRequest_Url,
      type: "GET",
      success: function (data) {
        // console.log(data);
        // set setTimezoneReques_sent to true
        sessionStorage.setItem('setTimezoneReques_sent', 'true');
      },
      error: function (error_data) {
        console.log(error_data);
      }
    });
  }

  // popup open
  $('.popup-open').click(function (e) {
    e.preventDefault();

    $(this).closest('div').find('.popup-wrapper').addClass('opened');
    $('.main-contact').addClass('fixed');
  })

  // popup close
  $('.popup__close').click(function (e) {
    e.preventDefault();

    $('.popup-wrapper').removeClass('opened');
  })

  $('.popup-wrapper').click(function (e) {
    e.preventDefault();

    $('.popup-wrapper').removeClass('opened');
  })

  // datepicker
  if ($('#birth_date').length > 0) {
    $('#birth_date').datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: 'yy-mm-dd',
      yearRange: "-100:+0",
      maxDate: "+0m +0d",
      // beforeShow: function () { $('input').blur(); }
    });

    $('#birth_date').on('focus', function () {
      $(this).trigger('blur')
    })
  }

});
