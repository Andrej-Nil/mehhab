'use strict';
const body = document.querySelector('body');

class Server {
  constructor() {
    this.POST = 'GET';
    this.GET = 'GET';
    this.menuApi = '../json/sidebar.json';
    this.dataCreator = new DataCreator();
  }


  sendForm = async ($form) => {
    const data = this.dataCreator.getFormData($form);
    return await this.getResponse(this.POST, data.data, data.api);
  }

  getMenuList = async (id) => {
    const data = this.dataCreator.createFormData({ id });
    return this.getResponse(this.POST, data, this.menuApi);
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
};

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

  createFormData = (data) => {
    data._token = this._token;
    const formData = new FormData();
    for (let key in data) {
      formData.append(`${key}`, data[key])
    }
    return formData;
  }

  getToken = () => {
    return document.querySelector('[name="csrf-token"]').content;
  }
}

class Render {
  constructor() {

  }

  renderMenuList = ($parent, list) => {

    this._render($parent, this.getMenuListHtml, list);
  }

  renderMenuItemList = ($parent, list) => {

    this._render($parent, this.getMenuItemListHtml, list);
  }

  getMenuListHtml = (item) => {

    let subMenuOpen = '';
    let subMenuList = '';
    if (item.isSubmenu) {
      subMenuOpen = `<img src="img/arr-bottom.svg" alt="" class="arr" data-status="close" ></img>`
      subMenuList = (/*html*/`
        <div data-id=${item.id} class="sidebar__list__content">
          
          <ul data-load="0" class="sidebar__list__sub">
            <span data-message class="message sidebar__message"></span>
          </ul>
          
        </div>
      `)
    }
    return (/*html*/ `
      <li>
        <p>
          <a href=${item.slug}>${item.title}</a>
          ${subMenuOpen}
        </p>
        ${subMenuList}
      </li>
    `)
  }

  getMenuItemListHtml = (item) => {
    return (/*html*/`
      <li>
        <p>
          <a href=${item.slug}>${item.title}</a>
        </p>
      </li>
    `)

  }

  getMarkList = (getMarkFun, arr) => {
    let htmlStr = ''
    arr.forEach((item) => {
      htmlStr += getMarkFun(item);
    })
    return htmlStr;
  }

  _render($parent, getMarkFun, argForGetMarkFun = null, where = 'beforeend') {
    let htmlStr = '';
    if (argForGetMarkFun === null) {
      htmlStr = getMarkFun();
    } else if (Array.isArray(argForGetMarkFun)) {
      htmlStr = this.getMarkList(getMarkFun, argForGetMarkFun);
    } else {
      htmlStr = getMarkFun(argForGetMarkFun);
    }
    $parent.insertAdjacentHTML(where, htmlStr);
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

class Message {
  constructor() {
    this.loadText = "Загружаю...";
    this.errorText = "Произошла ошибка, повторите позже.";
  }

  showMessage = ($message, text = this.loadText) => {
    this.setText($message, text);
    $message.classList.add('show');
  }

  hideMessage = ($message, text = '') => {
    $message.classList.remove('show');
    this.setText($message, text);
  }

  setErrorText = ($message, text = this.errorText) => {
    this.setText($message, text)
  }

  setText = ($message, text = this.loadText) => {
    $message.innerHTML = text;
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
    this.$modal.addEventListener('click', this.clickHandler);
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

  }

  sendForm = async () => {
    message.showMessage(this.$message, 'Идет отправка...');
    this.response = await this.form.send();
    this.resSendFormHandler();
  }

  resSendFormHandler = () => {
    if (!this.response) {
      message.hideMessage(this.$message);
      return;
    }

    if (this.response.status) {
      message.setErrorText(this.$message);
    } else if (this.response.rez == 0) {
      message.setErrorText(this.$message, this.response.error.desc);
    } else {
      this.sucssesSending();
    }
  }

  sucssesSending = () => {
    this.close();
    setTimeout(() => {
      this.form.clear();
      message.hideMessage(this.$message);
      callbackModalSucsses.open();
    }, 300);
  }

  clickHandler = (e) => {
    if (e.target.closest('.close')) {
      message.hideMessage(this.$message);
    }
  }

  listener = () => {
    this.$submitBtn.addEventListener('click', this.sendForm);
    this.$modal.addEventListener('click', this.clickHandler);
  }
}

class SidebarMenu {
  constructor() {
    this.$sidebarMenu = document.querySelector('#sidebarMenu');
    this.init();
  }

  init = () => {
    if (!this.$sidebarMenu) return;

    this.$sidebarList = this.$sidebarMenu.querySelector('#sidebarList');
    this.$message = this.$sidebarMenu.querySelector('[data-message]');
    this.listener();
    this.createSidebarList()
  }

  createSidebarList = async () => {
    message.showMessage(this.$message);
    const id = this.$sidebarMenu.dataset.id
    const response = await server.getMenuList(id);
    this.resultHandler(this.sucssesSidebarResponse, this.$message, this.$sidebarList, response);
  }

  toggleSubmenu = ($btn) => {
    if ($btn.dataset.status == 'close') {
      this.openSubmenu($btn);
    } else {
      this.closeSubmenu($btn);
    }

  }

  openSubmenu = ($btn) => {
    const $li = $btn.closest('li');
    const $subContent = $li.querySelector('.sidebar__list__content');
    const $sublist = $li.querySelector('.sidebar__list__sub');
    if ($sublist.dataset.load == 0) {
      this.createSubmenuList($sublist);
    }
    const sublistHeight = $sublist.offsetHeight;
    $li.classList.add('active');
    $subContent.style.height = sublistHeight + 'px';
    $btn.dataset.status = 'open';
  }

  closeSubmenu = ($btn) => {
    const $li = $btn.closest('li');
    const $subContent = $li.querySelector('.sidebar__list__content');
    $li.classList.remove('active');
    $subContent.style.height = '0px';
    $btn.dataset.status = 'close';
  }

  createSubmenuList = async ($sublist) => {
    const $message = $sublist.querySelector('[data-message]');
    const id = $sublist.dataset.id
    message.showMessage($message);
    const response = await server.getMenuList(id);
    this.resultHandler(this.sucssesSubmenuResponse, $message, $sublist, response);
  }

  sucssesSidebarResponse = ($message, $list, data) => {
    message.hideMessage($message);
    render.renderMenuList($list, data);
  };

  sucssesSubmenuResponse = ($message, $list, data) => {
    $list.dataset.load = 1;
    message.hideMessage($message);
    render.renderMenuItemList($list, data);
    this.openSubmenu($list);
  }

  resultHandler = (sucssesFun, $message, list, response) => {
    if (!response) {
      message.hideMessage($message);
      return;
    }

    if (response.status) {
      message.setErrorText($message, 'Произошла ошибка, попробуйте обновить сраницу.');
    } else if (response.rez == 0) {
      message.setErrorText($message, response.error.desc);
    } else {
      sucssesFun($message, list, response.content);
    }
  }

  clickHandler = (e) => {
    if (e.target.closest('.arr')) {
      this.toggleSubmenu(e.target);
    }
  }

  listener = () => {
    this.$sidebarMenu.addEventListener('click', this.clickHandler)
  }
}

const server = new Server();
const message = new Message();
const render = new Render();
const sidebarMenu = new SidebarMenu();
const callbackModal = new ModalWithForm('#callback__popup', '#callback__form');
const callbackModalSucsses = new Modal('#thanks__callback__popup');


