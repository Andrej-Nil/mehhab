'use strict';
const body = document.querySelector('body');

class Server {
  constructor() {
    this.POST = 'GET';
    this.GET = 'GET';
    this.dataCreator = new DataCreator()
  }


  sendForm = async ($form) => {
    const data = this.dataCreator.getFormData($form);
    return await this.getResponse(this.POST, data.data, data.api);
  }

  getResponse = async (method, data, api) => {
    return await new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      let response = null;
      xhr.open(method, api, true);
      xhr.send(data);
      xhr.onload = () => {
        if (xhr.status != 200) {
          console.log('Ошибка: ' + xhr.status);
          response = { status: xhr.status }
          resolve(response);
        } else {
          response = JSON.parse(xhr.response);
          resolve(response);
          if (response) {
            console.log("Запрос отправлен");
          } else {
            console.log("Неудачная отправка");
          }
        }
      };
      xhr.onerror = () => {
        reject(new Error("Network Error"))
      };
    })
  }
}

class DataCreator {
  constructor() {
    this._token = this.getToken();
  }

  getFormData = ($form) => {
    const data = new FormData($form);
    data.append('_token', this._token);
    return {
      data: data,
      api: $form.action
    }
  }
  getToken = () => {
    return document.querySelector('[name="csrf-token"]').content;
  }
}

class Form {
  constructor(id) {
    this.$form = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.$form) return;
    this.regTel = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{5,10}$/;
    this.regMail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
    this.$inputs = this.$form.querySelectorAll('input');
    this.listeners();
  }


  checkInput = ($input) => {
    let result = true;
    switch ($input.name) {
      case ('name'): {
        result = this.checkValue($input.value);
        this.visualizationInputStatus($input, result);
        break;
      }
      case ('tel'): {
        result = this.checkValue($input.value, this.regTel);
        this.visualizationInputStatus($input, result);
        break;
      }
      case ('consent'): {
        result = $input.checked;
        this.visualizationCheckboxStatus($input);
        break;
      }
      default: result = true;
    }

    return result;
  }

  checkValue = (value, reg) => {
    value = value.trim();
    if (value == '') {
      return false;
    } else if (reg) {
      return reg.test(value);
    } else {
      return true;
    }
  }

  checkForm = () => {
    let rez = true;
    this.$inputs.forEach(($input) => {
      rez = this.checkInput($input) && rez;
    });
    return rez;
  }

  send = async () => {
    if (this.checkForm()) {
      return await server.sendForm(this.$form)
    }
    return false;
  }

  visualizationInputStatus = ($input, result) => {
    if (result) {
      $input.classList.remove('error');
    } else {
      $input.classList.add('error');
    }

  }

  visualizationCheckboxStatus = ($checkbox) => {
    if ($checkbox.checked) return;

    this.showCheckboxAnimation($checkbox);
  };

  showCheckboxAnimation = ($checkbox) => {
    const $label = $checkbox.closest('.check__agree');
    $label.classList.add('shake');
    setTimeout(() => {
      $label.classList.remove('shake');
    }, 800)
  }

  clear = () => {
    this.$inputs.forEach(($input) => {
      $input.value = '';
    });
  }

  inputHandler = (e) => {
    if (e.target.closest('[data-input]')) {
      this.checkInput(e.target)
    }

  }


  listeners = () => {
    this.$form.addEventListener('input', this.inputHandler);
    this.$form.addEventListener('submit', this.sendHanler);
  }
}

class Modal {
  constructor(id) {
    this.$modal = document.querySelector(id);
    this.id = id
    this.init();
  }

  init = () => {
    if (!this.$modal) return;
    this.$btnForOpen = document.querySelector(`[data-id="${this.id}"]`);
    this.listener();
  }

  open = () => {
    this.$modal.classList.add('open');
    this.$modal.classList.add('hiding');
    body.classList.add('no-scroll');
  }

  close = () => {
    this.$modal.classList.remove('open');

    setTimeout(() => {
      this.$modal.classList.remove('hiding');
      body.classList.remove('no-scroll');
    }, 300);
  }

  clickHandler = (e) => {
    if (e.target.closest('.close')) {
      this.close();
    }
  }

  listener = () => {
    document.addEventListener('click', this.clickHandler);
    if (this.$btnForOpen) {
      this.$btnForOpen.addEventListener('click', this.open);
    }

  }
}

class ModalWithForm extends Modal {
  constructor(id, formId) {
    super(id);
    this.form = new Form(formId);
    this.init();
    this.listener();
  }

  init = () => {
    this.$submitBtn = this.$modal.querySelector('[type="button"]');
    this.$message = this.$modal.querySelector('[data-message]');
    this.response = null;
    this.loadText = "Идет отправка..."
    this.errorText = "Произошла ошибка, повторите позже."
  }

  sendForm = async () => {
    this.showMessage(this.loadText);
    this.response = await this.form.send();
    this.resSendFormHandler();
  }

  resSendFormHandler = () => {
    if (!this.response) {
      this.hideMessage();
      return;
    }

    if (this.response.status) {
      this.failSending(this.errorText);
    } else if (this.response.rez == 0) {
      this.failSending(this.response.error.desc);
    } else {
      this.sucssesSending();
    }
  }

  sucssesSending = () => {
    this.close();
    setTimeout(() => {
      this.form.clear();
      this.hideMessage();
      callbackModalSucsses.open();
    }, 300);
  }

  failSending = (text = '') => {
    this.$message.innerHTML = text;
  };

  showMessage = (text) => {
    this.$message.innerHTML = text;
    this.$message.classList.add('show');
  }

  hideMessage = () => {
    this.$message.classList.remove('show');
    this.$message.innerHTML = '';
  }
  listener = () => {
    this.$submitBtn.addEventListener('click', this.sendForm);
  }
}



const server = new Server();
const callbackModal = new ModalWithForm('#callback__popup', '#callback__form');
const callbackModalSucsses = new Modal('#thanks__callback__popup');


