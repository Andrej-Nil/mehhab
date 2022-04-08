jQuery(document).ready(function ($) {



  // $('a[href^="#"]').click(function(event) {
  //   if(!$(this).hasClass('popup')){
  //     var id_clicked_element = $(this).attr('href');
  //     var destination = $(id_clicked_element).offset().top;
  //     $('html, body').animate({ scrollTop: destination }, 1000);
  //     return false;
  //   }
  // });



  $('.top__link').click(function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 1000);
  });

  //$('.popup').fancybox({});

  $('.burg').click(function () {
    $('body').toggleClass('menu__open');
  });


  function sidebarH() {
    var sidebarHeight = $('.sidebar__wrap').height();
    var mainBlock = $('.main');
    $(mainBlock).css({
      'min-height': sidebarHeight + 480 + 'px'
    });
  }
  sidebarH();




  function windowSize() {
    var windowWidth = window.innerWidth;
    // console.log(windowWidth);
    var mainBlock = $('.main');
    if (windowWidth <= 1070) {
      // console.log(0);
      $(mainBlock).css({
        'min-height': '0px'
      });
    } else {
      sidebarH();
    }
  }

  $(window).on('load', windowSize); // при загрузке
  $(window).on('resize', windowSize); // при изменении размеров
  // или "два-в-одном", вместо двух последних строк:


  //$('.sidebar__list').on('click', '.arr', function (e) {
  //  e.preventDefault();
  //  var link = $(this).closest('a');
  //  var li = $(link).closest('li');
  //  $(li).toggleClass('active');
  //  sidebarH();
  //});

  $('.tabs__nav a').click(function (e) {
    e.preventDefault();
    var dataTab = $(this).attr('data-tabs');
    console.log(dataTab);
    $('.product__item__hidden').removeClass('active');
    $('.tabs__nav a').removeClass('active');
    $(this).addClass('active');
    $('.' + dataTab).addClass('active');
  });

  $('.search__form > input').click(function () {
    $(this).closest('.search__form').addClass('open');
  });

  $(document).click(function (e) { // событие клика по веб-документу
    var div = $(".search__form"); // тут указываем ID элемента
    if (!div.is(e.target) // если клик был не по нашему блоку
      && div.has(e.target).length === 0) { // и не по его дочерним элементам
      $('.search__form').removeClass('open');
    }
  });



  $('.popular__goods__content .see__all').click(function (e) {
    e.preventDefault();
    $(this).closest('.popular__goods__content').addClass('open');
  });




  var big__slider__nav = new Swiper('.big__slider__nav', {
    // direction: 'vertical',
    spaceBetween: 10,
    // loop: true, bug too
    // centeredSlides: true,
    slidesPerView: 5,
    // touchRatio: 0.2,
    // slideToClickedSlide: true,
    allowTouchMove: false,
    // watchSlidesVisibility: true,
    // watchSlidesProgress: true,
  });


  var big__slider = new Swiper('.big__slider', {
    slidesPerView: 1,
    allowTouchMove: false,
    // effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    thumbs: {
      swiper: big__slider__nav
    },
  });

  $('.product__added .close').click(function (e) {
    e.preventDefault();
    $('.product__added').addClass('closed');
  });
  $('.catalog__item .catalog__item__link').click(function (e) {
    e.preventDefault();
    var th = $(this);
    var item = $(th).closest('.catalog__item');
    var sub = $(item).find('.catalog__items__sub');
    // var dataCatalog = $(th).attr('data-catalog');
    // $(sub).toggleClass('open');
    $('.catalog__items__sub').not(sub).removeClass('open').addClass('hidden');
    if ($(sub).hasClass('hidden')) {
      $(sub).addClass('open');
      $(sub).removeClass('hidden');
    } else {
      $(sub).removeClass('open');
      $(sub).addClass('hidden');
    }
  });
});