'use strict';
const body = document.querySelector('body');

class Debaunce {
  constructor() { }
  debaunce = (fn, ms) => {
    let timeout;
    return function () {
      const fnCall = () => {
        fn(arguments[0])
      }
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, ms)
    };
  }
}

class WordEndingsInstaller {
  constructor() {
    this.endOfWords = ['', 'а', 'ов'];
  }

  convertEnding = (num, word) => {
    const ending = this.getEnding(num);
    return word + ending
  }

  getEnding(number) {
    const cases = [2, 0, 1, 1, 1, 2];
    return this.endOfWords[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }
}

class Server {
  constructor() {
    this.POST = 'GET';
    this.GET = 'GET';
    this.menuApi = '../json/sidebar.json';
    this.searchApi = '../json/search.json';
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

  getSearchPropuct = async (value) => {
    const data = this.dataCreator.createFormData({ value });
    return this.getResponse(this.POST, data, this.searchApi);
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

  renderMenuList = ($parent, list) => {

    this._render($parent, this.getMenuListHtml, list);
  }

  renderMenuItemList = ($parent, list) => {

    this._render($parent, this.getMenuItemListHtml, list);
  }

  renderCatalogSubitem = ($parent, list) => {
    this._render($parent, this.getCatalogSubitemHtml, list)
  }

  renderSearchList = ($searchList, response) => {
    this.clearParent($searchList);
    this._render($searchList, this.getSearchListHtml, response)
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

  getCatalogSubitemHtml = (item) => {
    return (/*html */`
    <p class="catalog-subitem">
      <a href="${item.slug}" class="catalog-subitem__link">${item.title}</a>
    </p>
    `)
  }

  getSearchListHtml = (response) => {
    const searchCardList = this.getMarkList(this.getSearchCardListHtml, response.content);
    const searchListFooter = this.getSearchListFooterHtml(response);
    return searchCardList + searchListFooter;

  }

  getSearchCardListHtml = (item) => {
    const isInBasket = item.isBasket ? 'checked' : '';
    const isInFavorite = item.isFavorite ? 'checked' : '';
    return (/*html */`
    <div data-product="${item.id}" class="search__form__sub__item">
    <a href="${item.slug}" class="name">${item.title}</a>
    <div class="sub__item__nav">
        <label for="" class="add__cart">
            <input data-basket type="checkbox" ${isInBasket}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M20.0815 12.3356L20.0803 12.3377C19.8158 12.8202 19.3001 13.1429 18.7071 13.1429H9.12857H8.5373L8.25236 13.6609L6.83807 16.2324L6.25605 17.2906C6.0929 16.8795 6.09838 16.3953 6.34103 15.9481L8.075 12.8141L8.32343 12.3651L8.10352 11.9015L3.47495 2.14288L3.2039 1.57143H2.57143H1V1H3.56934L4.50783 2.99679L4.77791 3.57143H5.41286H24.4414C24.6566 3.57143 24.7886 3.80525 24.6877 3.98528L24.6877 3.98527L24.6844 3.99128L20.0815 12.3356ZM7.71429 18.2857C7.21293 18.2857 6.78666 18.0578 6.50539 17.7143H7.71429H22.1429V18.2857H7.71429ZM6.15571 23.1429C6.15571 22.2743 6.8588 21.5714 7.71429 21.5714C8.57629 21.5714 9.28571 22.2809 9.28571 23.1429C9.28571 24.0049 8.57629 24.7143 7.71429 24.7143C6.8588 24.7143 6.15571 24.0114 6.15571 23.1429ZM19.0129 23.1429C19.0129 22.2743 19.7159 21.5714 20.5714 21.5714C21.4334 21.5714 22.1429 22.2809 22.1429 23.1429C22.1429 24.0049 21.4334 24.7143 20.5714 24.7143C19.7159 24.7143 19.0129 24.0114 19.0129 23.1429Z"
                    stroke="white" stroke-width="2" />
            </svg>
        </label>
        <label for="" class="favorite">
            <input data-favorite type="checkbox" ${isInFavorite}>
            <svg width="26" height="23" viewBox="0 0 26 23" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12.25 3.28161L12.9995 4.13022L13.749 3.28161C14.978 1.89016 16.8769 1 18.8495 1C22.3359 1 24.9995 3.61962 24.9995 6.89373C24.9995 8.92207 24.0626 10.847 22.1901 13.0544C20.3073 15.2738 17.5945 17.6479 14.2263 20.5927L14.2249 20.5939L12.997 21.6716L11.7735 20.6059C11.7731 20.6055 11.7727 20.6052 11.7723 20.6048C8.40445 17.654 5.69197 15.2771 3.80917 13.0562C1.93638 10.8471 0.999512 8.92209 0.999512 6.89373C0.999512 3.61962 3.66308 1 7.14951 1C9.12211 1 11.021 1.89016 12.25 3.28161Z"
                    stroke="white" stroke-width="2" />
            </svg>
        </label>
    </div>
    <span class="cost">${item.price} ₽</span>
</div>
     `)
  }

  getSearchListFooterHtml = (response) => {
    const wordThisEnding = wordEndingsInstaller.convertEnding(response.count, 'товар');
    return (/*html */`
      <button href="#" type="submit" class="view__all">Показать все результаты (${response.count} ${wordThisEnding})</button>
    `);
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

  clearParent = ($el) => {
    $el.innerHTML = ''
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
    this.init();
  }

  init = () => {
    if (!this.$modal) return;

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
    //document.addEventListener('click', this.open)

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

class CallbackModal extends ModalWithForm {
  constructor(id, formId) {
    super(id, formId)
    this.init()
  }
  init = () => {
    this.listeners()
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-callback-btn]')) {
      this.open();
    }
  }
  listeners = () => {
    document.addEventListener('click', this.clickHandler);
  }
}

class FastOrderModal extends ModalWithForm {
  constructor(id, formId) {
    super(id, formId)
    this.init()
  }
  init = () => {
    this.$inputId = this.$modal.querySelector('[name="id"]');
    this.listeners()
  }

  openFastOrder = (target) => {
    const id = target.closest('[data-product]').dataset.product;
    this.$inputId.value = id;
    this.open();
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-fast-btn]')) {
      this.openFastOrder(e.target);
    }
  }
  listeners = () => {
    document.addEventListener('click', this.clickHandler);
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

class CatalogList {
  constructor(id) {
    this.catalogList = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.catalogList) return;

    this.$itemList = this.catalogList.querySelectorAll('[data-sublist]');
    this.$activeItem = null;
    this.listener();
  }

  toggleSublist = ($btn) => {
    const $item = $btn.closest('[data-item]');
    if ($item.dataset.load == 0) {
      this.createSublist($item);
    }
    if ($item.classList.contains("open")) {
      this.closeSublist($item);
    } else {
      this.openSublist($item);
    }
  }

  openSublist = ($item) => {
    $item.classList.add('open');

    if (this.$activeItem != $item) {
      this.closeSublist(this.$activeItem);
      this.$activeItem = $item;
    }

  }

  closeSublist = ($item) => {
    if ($item) {
      $item.classList.remove('open');
    }
  }

  createSublist = async ($item) => {

    const $message = $item.querySelector('[data-message]');
    const id = $item.dataset.id
    message.showMessage($message);

    const response = await server.getMenuList(id);
    this.resultHandler($message, $item, response);
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-label]')) {
      this.toggleSublist(e.target);
    }
    if (!e.target.closest('[data-label]')) {
      this.closeSublist(this.$activeItem);
    }
  }

  resultHandler = ($message, $item, response) => {
    if (!response) {
      message.showError($message);
    }

    if (response.status) {
      message.setErrorText($message, 'Произошла ошибка, попробуйте обновить сраницу.');
    } else if (response.rez == 0) {
      message.setErrorText($message, response.error.desc);
    } else {
      this.sucssesResponse($message, $item, response.content);
    }
  }

  sucssesResponse = ($message, $item, data) => {
    const $catalogSublist = $item.querySelector('[data-sublist]');
    message.hideMessage($message);
    render.renderCatalogSubitem($catalogSublist, data);
    $item.dataset.load = "1";
  }

  listener = () => {
    document.addEventListener('click', this.clickHandler);
  }
}

class Search {
  constructor(id) {
    this.$form = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.$form) return;

    this.$input = this.$form.querySelector('input');
    this.$searchList = this.$form.querySelector('.search__form__sub');
    this.value = '';
    this.response = null;
    this.listeners()
  }


  changeValueHandler = () => {
    this.value = this.getPreparedValue();
    if (this.value.lenght < 2) return;
    this.createProductList();
  }

  getPreparedValue = () => {
    return this.$input.value.trim().toLowerCase();
  };

  createProductList = async () => {
    this.response = await server.getSearchPropuct(this.value);
    this.resultHandler();
  }

  resultHandler = () => {
    if (this.response.rez == '1') {
      this.succesHandler();
    } else {
      return;
    }
  }

  succesHandler = () => {
    render.renderSearchList(this.$searchList, this.response);
    this.openList();
  }

  clickHandler = (e) => {
    if (!e.target.closest('form')) {
      this.closeList()
    }
  }

  listeners = () => {
    const changeValueHandler = debaunce.debaunce(this.changeValueHandler, 300);
    this.$input.addEventListener('input', changeValueHandler);
    document.addEventListener('click', this.clickHandler)
  }

  openList = () => {
    this.$form.classList.add('open');
  }

  closeList = () => {
    this.$form.classList.remove('open');
  }
}

class СontentSwitch {
  constructor(id) {
    this.$block = document.querySelector(id);
    this.init()
  }

  init = () => {
    if (!this.$block) return;

    this.$tabsWrap = this.$block.querySelector('[data-tabs]');
    this.$tabsList = this.$tabsWrap.querySelectorAll('[data-tab]');
    this.$contentItems = this.$block.querySelectorAll('[data-item]');
    this.listeners();
  }

  changeTab = ($el) => {
    const $tab = this.$tabsList[$el.dataset.tab];
    if ($tab.classList.contains('active')) return;
    this.toggleTabs($tab);
    contentSwitchSelect.changeOption($tab);
  }

  toggleTabs = ($tab) => {
    this.$tabsList.forEach(($item) => {
      this.closeTab($item);
    });
    this.openTab($tab);
  }

  openTab = ($item) => {
    $item.classList.add('active');
    this.$contentItems[$item.dataset.tab].classList.add('active');
  }

  closeTab = ($item) => {
    $item.classList.remove('active');
    this.$contentItems[$item.dataset.tab].classList.remove('active');

  }

  clickHandler = (e) => {
    if (e.target.closest('[data-tab]')) {
      this.changeTab(e.target);
    }
  }
  listeners = () => {
    this.$tabsWrap.addEventListener('click', this.clickHandler);
  }
}

class СontentSwitchSelect {
  constructor(id) {
    this.$select = document.querySelector(id);
    this.init()
  }

  init = () => {
    if (!this.$select) return;
    this.$btn = this.$select.querySelector('[data-btn]');
    this.$link = this.$select.querySelector('[data-content-link]');
    this.$optionsWrap = this.$select.querySelector('[data-options]');
    this.$optionsList = this.$select.querySelectorAll('[data-tab]');
    this.listeners()
  }

  toggleOptionWrap = () => {
    if (this.$btn.dataset.btn == 'close') {
      this.openOptionsWrap()
    } else {
      this.closeOptionsWrap()
    }
  }

  openOptionsWrap = () => {
    this.$optionsWrap.classList.add('active');
    this.$btn.dataset.btn = 'open';
  }

  closeOptionsWrap = () => {
    this.$optionsWrap.classList.remove('active');
    this.$btn.dataset.btn = 'close';
  }

  changeOption = ($el) => {

    const $tab = this.$optionsList[$el.dataset.tab];
    const title = $tab.innerHTML;
    const link = $tab.dataset.link;
    if (title === this.$btn.innerHTML) {
      this.closeOptionsWrap();
      return;
    }
    this.$btn.innerHTML = title;
    this.$link.href = link;
    this.closeOptionsWrap();
    popularGoodsSwitch.changeTab($el);
  };

  clickHandler = (e) => {
    if (e.target.closest('[data-tab]')) {
      this.changeOption(e.target)
    }
  }

  listeners = () => {
    this.$btn.addEventListener('click', this.toggleOptionWrap);
    this.$optionsWrap.addEventListener('click', this.clickHandler)
  }

}






const debaunce = new Debaunce();
const server = new Server();
const message = new Message();
const wordEndingsInstaller = new WordEndingsInstaller()
const render = new Render();
const sidebarMenu = new SidebarMenu();
const callbackModal = new CallbackModal('#callback__popup', '#callback__form');
const callbackModalSucsses = new Modal('#thanks__callback__popup');

const fastOrderModal = new FastOrderModal('#fastbay__popup', '#fastbay__form');
const fastOrdekModalSucsses = new Modal('#thanks__fastbay__popup');


const catalogList = new CatalogList('#catalogList');
const search = new Search('#searchProduct');
const popularGoodsSwitch = new СontentSwitch('#popularGoods');
const contentSwitchSelect = new СontentSwitchSelect('#popularSelect');



