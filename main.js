//Đối tượng validator
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  //Hàm validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);

    var errorMessage;
    var rules = selectorRules[rule.selector];

    //lặp qua các rule rồi kiểm tra
    // Nếu có lỗi thì dừng kiểm tra
    for (var i = 0; i < rules.length; ++i) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }

    return !errorMessage;
  }

  //Lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var IsFormValid = true;

      //Thực hiện và lặp qua từng rule
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          IsFormValid = false;
        }
      });

      if (IsFormValid) {
        //Trường hợp submit với js
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");

          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            values[input.name] = input.value;
            return values;
          },
          {});
          options.onSubmit(formValues);
          // submit với hành vi mặc định
          // } else {
          //   formElement.submit();
        }
      }
    };

    //Lặp qua mỗi rule
    options.rules.forEach(function (rule) {
      //Lưu lại các rule cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        // Xử lí blur ra khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        //Xử lí khi nhập vào input
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      }
    });
  }
}

//Định nghĩa các rules
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : "Hãy nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải là email.";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : "Vui lòng nhập tối thiểu 6 kí tự";
    },
  };
};
Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Nhập giá trị không chính xác";
    },
  };
};
