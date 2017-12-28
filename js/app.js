// window.onbeforeunload = function() {
//     return 'Данные не сохранены. Точно перейти?';
// }

// pickadate plugin defaults
jQuery.extend( jQuery.fn.pickadate.defaults, {
	monthsFull: [ 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря' ],
	monthsShort: [ 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек' ],
	weekdaysFull: [ 'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота' ],
	weekdaysShort: [ 'вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб' ],
	today: 'сегодня',
	clear: 'удалить',
	close: 'закрыть',
	firstDay: 1,
	format: 'dd.mm.yyyy',
	formatSubmit: 'dd.mm.yyyy'
});

//SET CURSOR POSITION plugin
// $.fn.setCursorPosition = function(pos) {
//   this.each(function(index, elem) {
//     if (elem.setSelectionRange) {
//       elem.setSelectionRange(pos, pos);
//     } else if (elem.createTextRange) {
//       var range = elem.createTextRange();
//       range.collapse(true);
//       range.moveEnd('character', pos);
//       range.moveStart('character', pos);
//       range.select();
//     }
//   });
//   return this;
// };

var 
	 $window = $(window)
	,BREAKPOINT_XS = 767	// mobile devices breakpoint
	;

$(document).ready(function(){
    // data-href replace module
    var dataHref = function(){
        $('a[data-href]').each(function(){
            $(this).attr('href', $(this).attr('data-href'));
            $(this).removeAttr('data-href');
        });
    };

    dataHref(); // replacing data-href attributes with href
    
	// header module
	var headerModule = (function(){
		var obj = {};	// module returned object

		// menu hiding/appearance
		obj.$header = $("#headerWrapper");	// header
		obj.$mainMenu = $("#mainMenu");		// menu
		obj.$menuBtn = $("#menuBtn");		
		obj.$closeIcon = obj.$menuBtn.find(".b-icon_bars");
		obj.$openIcon = obj.$menuBtn.find(".fa-times");

		// menu btn icon toggle
		obj.menuBtnToggle = function(){
			if (obj.$mainMenu.hasClass("opened")){
				obj.$closeIcon.fadeOut(200);
				obj.$openIcon.fadeIn(200);
			} else {
				obj.$openIcon.fadeOut(200);
				obj.$closeIcon.fadeIn(200);
			}
		};
		// menu open
		obj.openMenu = function(){
			var  $menuList = obj.$mainMenu.children("ul")
				,$menuCallback = obj.$mainMenu.children(".js-btn_callback")
				,height = $menuList.outerHeight() + ($menuCallback.is(":visible")?$menuCallback.outerHeight():0)
				;

			obj.$mainMenu.css("top", "100%");
			obj.$mainMenu.animate({
				height: height
			}, 200);
			obj.$mainMenu.addClass("opened");
			obj.menuBtnToggle();
		};
		// menu close
		obj.closeMenu = function(){
			obj.$mainMenu.animate({
				height: "0"
			}, 200, function(){
				obj.$mainMenu.css("top", "-9999px");
			});
			obj.$mainMenu.removeClass("opened");
			obj.menuBtnToggle();
		};
		// menu close after some scroll
		obj.closeAfterScroll = new function(){
			var  o = this
				,startCoor
				;

			o.SCROLL_VAL_PX = 100;	// close after 100px scroll

			o.menuScrollHandler = function (){
				var currentCoor = $(document).scrollTop();

				if (Math.abs(currentCoor - startCoor) >= o.SCROLL_VAL_PX){
					obj.closeMenu();
					$(document).off("scroll", o.menuScrollHandler);
				}
			}
			o.init = function(){
				startCoor = $(document).scrollTop();
				$(document).on("scroll", o.menuScrollHandler);
			};
		};

		obj.menuToggler = function(){
			// open/close menu on event
			obj.$menuBtn.on("click", function(){
				if (obj.$mainMenu.hasClass("opened")){
					obj.closeMenu();
				} else {
					obj.openMenu();
				};
				if (obj.$mainMenu.hasClass("opened")){
					obj.closeAfterScroll.init();
				}
			});
			// close menu after click on close btn
			obj.$mainMenu.find(".js-menu__close").on("click", obj.closeMenu);

			$(window).on("resize", function(){	// close menu - prevent visible menu height overflow
				obj.closeMenu();
			});
		};

		obj.init = function(){
			// obj.headerStick();	// stick header
			obj.menuToggler();	// menu open/close functionality 
		}

		return obj;	// return object with menu methods and buttons
	})();
	
	headerModule.init();
	
// Global variables
	var  $containerAjax = $(".js-ajax_calculator")
		;

	// Functions for the calc-choose-buy block AJAX loads and js-functional inits on them
	var hideContainerAjax = function($containerAjax){
		$("#toTop").trigger("click");	// прокручуємо сторінку нагору
		$containerAjax.animate({
				opacity: 0,
			},{
				duration: 400,
				queue: "ajax",
			}
		);
	};
	var showContainerAjax = function($containerAjax){
		$containerAjax.animate({
				opacity: 1,
			},{
				duration: 400,
				queue: "ajax"
			}
		);
	};

	// OSAGO propositions
	var showPropositions = function($containerAjax){	// ф-я для підвантаження пропозицій
		hideContainerAjax($containerAjax);

            var 
            	 type = $("#vehicleForm input[name='type']:checked").val()
            	,franshiza = $("#vehicleForm").find("input[name='franshiza']").val()
            	,notTaxi = $("#vehicleForm [name='notTaxi']").is(':checked') ? 1 : 0
            	,city = $("#vehicleForm #cityId").val()
            	,cityName = $("#vehicleForm #regCity").val()
            	,zone = $("#vehicleForm #zoneId").val()
            	;

		$containerAjax.queue("ajax", function(){

			$.ajax({
            	type: "get",
            	data: {type: type, franshiza: franshiza, notTaxi: notTaxi, city: city, cityName: cityName, zone: zone},
            	url : "./ajax/__propositions.html",
            	error : function(){
            	    alert('error');
            	},
            	success: function(response){
            		dataLayer.push({'event': 'GAevent', 'eventCategory': 'OsagoChoise', 'eventAction': 'buttonClick'});
            	    $containerAjax.html(response);
            	    propositionsInit($containerAjax);
            	},
            	complete: function(){
            		showContainerAjax($containerAjax);
            		$containerAjax.dequeue("ajax");
            	}
            });
		});

		$containerAjax.dequeue("ajax");	// запустимо чергу
	};

	var fillStar = function(){	// ф-я для зафарбовування зірочок для кожного контейнера $("РейтингКонтейнер").each(fillStar)
		var  starsNum = $(this).attr("data-rating")	// к-ть зірочок для зафарбування в атрибуті "data-rating" контейнера
			,$stars = $(this).children("span.fa")
			,i
			;
		// 	fa-star-o контур зірочки
		// 	fa-star зафарбований контур зірочки
		for (i=0; i<starsNum; ++i){
			$stars.eq(i).removeClass("fa-star-o").addClass("fa-star");
		}
	};

	// ф-я заповнення зірочок відповідно до рейтинга
	var fillAllStars = function(sSelector){	// sSelector - селектор контейнера із зрочками
		var $ratings = $(sSelector);	// контейнер із зірочками
			$ratings.each(fillStar);
	}

	var propositionsInit = function($containerAjax){	// ф-я ініціалізації js-функціоналу на підвантаженому блоці пропозицій
		var 
			 $propositionsBlock = $containerAjax.find("#propositions")
			,$proposListContainer = $("#propositionsList")	// контейнер списку пропозицій
			,$proposList = $propositionsBlock.find(".js-list_propositions")	// список пропозицій
			,$proposListItems = $proposList.children(".js-proposition")	// елементи списку пропозицій
			,iVisItemsNum = 5	// кількість елементів, що відображаються при згортанні (мінус 2)
			
			,$moreProposBtn = $propositionsBlock.find("#morePropositions")	// "Больше предложений" button
			,$vehicleSelect = $("#vehicle")
			,$vehicleForm = $("#vehicleForm")
			,$toggleFilters = $("#toggleFilters")
			,$oneClickForm = $("#oneClickForm").find("form.callback__inner")
			,$cityName = $vehicleForm.find("#regCity")
			,$cityId = $vehicleForm.find("#cityId")
			,$cityZone = $vehicleForm.find("#zoneId")
			,$vehicleParameters = $vehicleForm.find(".js-vehicle__block")	// блоки з параметрами ТЗ
			,$vehicleParamSelects = $vehicleParameters.find(".js-selectric")	// селекти параметрів ТЗ
			,$carParameters = $vehicleParameters.filter(".js-car")
			,$carParamSelect = $vehicleParamSelects.filter(".js-selectric_car")
			,$trailerParameters = $vehicleParameters.filter(".js-trailer")
			,$trailerParamSelect = $vehicleParamSelects.filter(".js-selectric_trailer")
			,$busParameters = $vehicleParameters.filter(".js-bus")
			,$busParamSelect = $vehicleParamSelects.filter(".js-selectric_bus")
			,$motoParameters = $vehicleParameters.filter(".js-moto")
			,$motoParamSelect = $vehicleParamSelects.filter(".js-selectric_moto")

			,$buyBtns = $("#propositions").find(".js-proposition__buy")						// кнопка оформлення покупки
			,$quickDelivBtns = $("#propositions").find(".js-proposition__delivery_quick")	// кнопка оформлення швидкої доставки
			,$makeBtns = $().add($buyBtns).add($quickDelivBtns)							// кнопки оформлення
			,$franshiza = $(".js-range_franshiza").ionRangeSlider()			// слайдер Франшизи
			;

			// modals
			var	 $modalOvl = $(".b-overlay_modal")
			,$modals = $modalOvl.find(".b-modal")
			,$modalError = $modals.filter(".b-modal_error")
			,$modalCallbackSuccess = $modals.filter(".b-modal_callbackSuccess")
			;

		$oneClickForm.find("input[type='tel']").mask("+38 (099) 999-99-99");
		
		// callback form submission
		$oneClickForm.submit(function(event){
			event.preventDefault();
			var data = $(this).serialize();

			$.ajax({
					// type : 'post',
					type : 'get',
					url: './ajax/create-callback.json',
					data : data,
					cache : false,
					success : function(response){
							if(response.status == true)
							{
									// in a case of Ajax success:
									$modals.fadeOut();	// ховаємо видимі модалки
									$modalOvl.fadeIn();
									$modalCallbackSuccess.fadeIn();	// show success modal
									$oneClickForm.find('input[type="tel"]').val('');
							} 
							else
							{
								$modals.fadeOut();	// ховаємо видимі модалки
								$modalOvl.fadeIn();
								$modalError.fadeIn();	// show error modal
							}
					},
					error: function(){
							alert('There is an error!');
					}
			});
		})

		// ф-я ініціалізації функціонала кнопок купівлі і доставки
		var buyBtnsInit = function(){
			 var init = function(){
				// GTM variables
				var  nameOfCompany = $(this).parents(".js-proposition").attr("data-name")
					,price = $(this).find(".b-text_btn").attr("data-fullprice")
					;
				dataLayer.push({'event': 'buySC', 'eventCategory': 'buyOsagoLanding', 'eventAction': nameOfCompany, 'eventLabel': price});	// GTM

				var proposNum = $(this).attr("data-proposition");	// номер пропозиції для підвантаження потрібної пропозиції
				showOrderBlock(proposNum, $containerAjax);	// показуємо блок оформлення
			};

			$makeBtns.on("click", function(){
				init.call(this);
			});
		};

		// ф-я приховування параметрів необраних ТЗ
		var vehicleChange = function(){
			var sVehicle = $(this).val();
				switch (sVehicle) {
					case "car":	// авто
						$vehicleParameters.css("display", "none");	// ховаємо всі блоки з параметрами ТЗ
						$vehicleParamSelects.prop("disabled", true);// відключаємо поля параметрів

						$carParameters.css("display", "block");		// показуємо блок параметрів легкового авто
						$carParamSelect.prop("disabled", false);	// вмикаємо поля параметрів легкового авто
						break;
					case "trailer":	// вантажівка
						$vehicleParameters.css("display", "none");	// ховаємо всі блоки з параметрами ТЗ
						$vehicleParamSelects.prop("disabled", true);// відключаємо поля параметрів

						$trailerParameters.css("display", "block");
						$trailerParamSelect.prop("disabled", false);
						break;
					case "bus":	// автобус
						$vehicleParameters.css("display", "none");	// ховаємо всі блоки з параметрами ТЗ
						$vehicleParamSelects.prop("disabled", true);// відключаємо поля параметрів

						$busParameters.css("display", "block");
						$busParamSelect.prop("disabled", false);
						break;
					case "moto": //мотоцикл
						$vehicleParameters.css("display", "none");	// ховаємо всі блоки з параметрами ТЗ
						$vehicleParamSelects.prop("disabled", true);// відключаємо поля параметрів

						$motoParameters.css("display", "block");
						$motoParamSelect.prop("disabled", false);
						break;
				}
		};

		// hide "Больше предложений" button if less then 5 propositions
		var moreBtnHideCheck = function(){
			if ($proposListItems.length <= iVisItemsNum){
				$moreProposBtn.css("display", "none")
			} else{
				$moreProposBtn.css("display", "block")
			}
		};


		var proposTableInit = function(bSortInitialize){
			var	 $sortBtns = $propositionsBlock.find(".js-filter")	// кнопки сортування
				,$sortBtnByName = $sortBtns.filter(".js-filter_name")
				,$sortBtnByPrice = $sortBtns.filter(".js-filter_price")
				,$sortBtnByRating = $sortBtns.filter(".js-filter_rating")
				;
			
				// форма заказать в 1 клик
				$('.link-oneclick').on('click', function(event){
					event.preventDefault();
					
					if ( $(this).parents('.b-proposition_row').hasClass('is--current') ) {
						$('.b-proposition_row').removeClass('is--current');
					} else {
						$('.b-proposition_row').removeClass('is--current');
						$(this).parents('.b-proposition_row').addClass('is--current');
						$(this).parent().append( $('#oneClickForm') );
					}
				});
				
				$("input[type='tel']").mask("+38 (099) 999-99-99");
			// сортування таблиці пропозицій
				// функція сортування
				// sName - ім'я властивості
				// $parent - контейнер елементів, які сортуємо
				// $children - елементи, які сортуємо
				// bHasOrderIcon - чи є поле з сигналізацією зміни порядка
			var sortByField = function(sName, $parent, $children, bHasOrderIcon){
				var bDesc = $(this).attr("data-order")=="asc";	// check previous sort order
				$(this).attr("data-order", (bDesc)?"desc":"asc");	// first sort in ascending order (default icon - ascending)
				var $orderIcon = $(this).children(".js-order");
				
				$children.sort(function(a,b){
					if (bDesc){
						return $(b).data(sName) > $(a).data(sName)
					} else{
				  		return $(a).data(sName) > $(b).data(sName)
				 	}
				}).appendTo($parent);

				// change sort icon
				if (bHasOrderIcon){
					if (bDesc) {
						$orderIcon.addClass("b-order__" + sName + "_revert");
					} else {
						$orderIcon.removeClass("b-order__" + sName + "_revert");
					}
				}
			};
			// перевіряємо чи це первинна ініціалізація
			// щоб не додавати по кілька однакових event listeners на поля сортування при завантаження нових таблиць пропозицій
			if (bSortInitialize){
				$sortBtnByName.on("click", function(){
					sortByField.call(this, "name", $proposList, $proposListItems, true);
					$proposListItems = $proposList.children(".js-proposition");
					if (!$moreProposBtn.hasClass("js-rolled")) {
						$proposListItems.not(":gt("+(iVisItemsNum-1)+")").slideDown(400);
						$proposListItems.filter(":gt("+(iVisItemsNum-1)+")").slideUp(400);
					}
				});
				$sortBtnByPrice.on("click", function(){
					$(this).find(".fa").toggleClass("fa-sort-amount-asc fa-sort-amount-desc");
					sortByField.call(this, "price", $proposList, $proposListItems, true);
					$proposListItems = $proposList.children(".js-proposition");
					if (!$moreProposBtn.hasClass("js-rolled")) {
						$proposListItems.not(":gt("+(iVisItemsNum-1)+")").slideDown(400);
						$proposListItems.filter(":gt("+(iVisItemsNum-1)+")").slideUp(400);
					}
				});
				$sortBtnByRating.on("click", function(){
					sortByField.call(this, "rating", $proposList, $proposListItems, true);
					$proposListItems = $proposList.children(".js-proposition");
					if (!$moreProposBtn.hasClass("js-rolled")) {
						$proposListItems.not(":gt("+(iVisItemsNum-1)+")").slideDown(400);
						$proposListItems.filter(":gt("+(iVisItemsNum-1)+")").slideUp(400);
					}
				});
			};

			// розгортання і згортання деталей пропозиції
			$(".js-propos__btn_about").on("click", function(){
				$(this).find(".fa").toggleClass("fa-angle-down").toggleClass("fa-angle-up");
				// $(this).next(".b-details__list_propos").fadeToggle(200)
				$(this).parents(".js-proposition").find(".b-details__list_propos").slideToggle(200)
			})
		};

		// ф-я підвантаження нової таблиці пропозицій
		var reloadPropositionsTable = function(){
			hideContainerAjax($proposListContainer);

			$proposListContainer.queue("ajax", function(){
				var 
					 $type = $vehicleParamSelects.filter(":not([disabled])")
					,type = $vehicleParamSelects.filter(":not([disabled])").val()
	            	,cityName = $cityName.val()
	            	,city = $cityId.val()
	            	,zone = $cityZone.val()
	            	;

				$.ajax({
	            	type: "get",
            		data: {type: type, city: city, cityName: cityName, zone: zone},
	            	url : "./ajax/__propositionsList.html",
	            	error : function(){
	            	    alert('error');
	            	},
	            	success: function(response){
						// $vehicleForm.slideUp(200);	// згортаємо форму фільтрів

	            	    $proposListContainer.html(response);
	            	    $vehicleForm = $("#vehicleForm");
						$cityId = $vehicleForm.find("#cityId");
						$cityName = $vehicleForm.find("#regCity");
						$proposListContainer = $("#propositionsList");
						$propositionsBlock = $containerAjax.find("#propositions");
						$proposList = $propositionsBlock.find(".js-list_propositions");
						$proposListItems = $proposList.children(".js-proposition");
						$moreProposBtn = $propositionsBlock.find("#morePropositions");
						moreBtnHideCheck();
						$moreProposBtn.find(".fa").addClass("fa-angle-down").removeClass("fa-angle-up");
	            	    proposTableInit();	// ініціалізуємо функціонал завантаженої таблиці пропозицій

	            	    $buyBtns = $("#propositions").find(".js-proposition__buy")						// кнопка оформлення покупки
						$quickDelivBtns = $("#propositions").find(".js-proposition__delivery_quick")	// кнопка оформлення швидкої доставки
						$makeBtns = $().add($buyBtns).add($quickDelivBtns)       // кнопки оформлення
	            	    buyBtnsInit();
	            	},
	            	complete: function(){
	            		showContainerAjax($containerAjax);
	            		$proposListContainer.dequeue("ajax");
	            	}
	            });
			});
				
			showContainerAjax($proposListContainer);
			$proposListContainer.dequeue("ajax");
		}

		// при кліку на кнопку в заголовку "Результаты расчета для" показуємо/ховаємо форму параметрів
		$toggleFilters.click(function(){
			$(this).toggleClass("b-link_unscrolled")
			$vehicleForm.slideToggle(200);
		});
		// callapse filter on mobile devices
		if ($window.outerWidth() <= BREAKPOINT_XS && !$toggleFilters.hasClass('b-link_unscrolled') ){
			$toggleFilters.trigger('click');
		}

		$(".js-selectric").selectric();	// selects stylization

		$vehicleSelect.selectric({	//селект вибора ТЗ
			disableOnMobile: false,
			nativeOnMobile: false,
			onInit: function() {
				vehicleChange.call(this);
			},
			onChange: function(element) {	// element==this - це наш select, він лишається тим самим об'єктом і після ініціалізації selectric
				vehicleChange.call(this);
				$(element).change();	// fired by default
			}
		});

		// підвантажимо пропозиції при зміні значення фільтрів
		$vehicleSelect.on("change", function(){
			$vehicleForm.trigger("submit");
		});
		$franshiza.on("change", function(){
			$vehicleForm.trigger("submit");
		});
		$cityName.on("change", function(){
			$vehicleForm.trigger("submit");
		});
		$carParamSelect.on("change", function(){
			$vehicleForm.trigger("submit");
		});
		$trailerParamSelect.on("change", function(){
			$vehicleForm.trigger("submit");
		});
		$busParamSelect.on("change", function(){
			$vehicleForm.trigger("submit");
		});
		$motoParamSelect.on("change", function(){
			$vehicleForm.trigger("submit");
		});

		// додамо до поля міста реєстрації статичну випадашку при введенні від 0 до 1 символа (до відпрацювання автокомпліта)
		precomplete(2, $("#regCity"));

		//ajax registration city autocomplete
		fieldAutocomplete(3, $("#regCity"), "./ajax/cityRegion.json");	// EWA віддає результат, починаючи з 3х символів

		// якщо ми змінили значення міста реєстрації, але не обрали з меню автокомпліта, то повернемо раніше обране значення
		$("#regCity").blur(function(){
			var  dataItem = $(this).attr("data-item")	// раніше обране значення, збережене в атрибуті "data-item"
				,fieldValue = $(this).val()	// поточне значення
				;
			if (dataItem && (fieldValue != dataItem)){	// перевірка чи є попередньо обране значення (якщо)
				$(this).val(dataItem);	// як є то запишемо вибране раніше значення
			}
		})
		
		// ініціалізація функціоналу таблиці при початковому підвантаженні
		proposTableInit(true);	

		// hide-show additional propositions by click on "Больше предложений"
		$moreProposBtn.on("click",function(){
			if (!$proposListItems.is(":animated")){
				$(this).toggleClass("js-rolled");
				if ($(this).hasClass("js-rolled")){
					$proposListItems.filter(":gt("+(iVisItemsNum-1)+")").slideDown(400);
				} else {
					$proposListItems.filter(":gt("+(iVisItemsNum-1)+")").slideUp(400);
					console.log($proposListItems.filter(":gt("+(iVisItemsNum-1)+")"));
				};
				$proposList.removeClass(function(index, className){
					return (className.match (/(^|\s)g-visible-\d+_only/g) || []).join(' ');	// remove class "g-visible-X_only" (X: number)
				});	// далі приховуємо пропозиції без цсс, логікою js
				$moreProposBtn.find(".fa").toggleClass("fa-angle-down").toggleClass("fa-angle-up");
			}
		});
		// hide "Больше предложений" button if less then 5 propositions
		moreBtnHideCheck();

		// підванатажимо блок: 
		//		оформлення при кліку на "Оформить страховку"
		// 		швидкої доставки при кліку на "Заказать доставку"
		buyBtnsInit();

		// валідація форми
		$vehicleForm.submit(function(event){
			event.preventDefault();
			if (!$cityId.val()){	//якщо не вибране місто реєстрації (відповідне приховане поле без значення)
				$cityName.focus();
			} else {
				reloadPropositionsTable();	// підвантажуємо нову таблицю пропозицій
			}
		});

		//	Повертаємось до вибора тз при кліку на лого Oh.ua
		// $(".b-logo__link").click(function(e){
		// 	e.preventDefault();	// не перевантажуємо сторінку
		// 	showVehicleCalc($containerAjax)
		// });
	};
	
	// quick Delivery
	var showQuickDeliveryBlock = function(proposNum, $containerAjax){
		hideContainerAjax($containerAjax);

		$containerAjax.queue("ajax", function(){
			// place for Ajax sending
			$.ajax({
            	type: "get",
            	url : "./ajax/__quickDelivery.html",
                data: {counter: proposNum},
            	error : function(){
            	    alert('error');
            	},
            	success: function(response){
            	    $containerAjax.html(response);
            	    orderBlockInit($containerAjax);
            	},
            	complete: function(){
            		// $("#byUpload").css("display", "block");
            		// $("#calculator").find(".b-finalize__btn_method[data-for='byUpload']").trigger("click");
            		showContainerAjax($containerAjax);
            		$containerAjax.dequeue("ajax");
            	}
            });
		});
		
		$containerAjax.dequeue("ajax");
	}

	// order block
	var showOrderBlock = function(proposNum, $containerAjax){
		hideContainerAjax($containerAjax);

		$containerAjax.queue("ajax", function(){
			// place for Ajax sending
			$.ajax({
            	type: "get",
            	url : "./ajax/__orderBlock.html",
                data: {counter: proposNum},
            	error : function(){
            	    alert('error');
            	},
            	success: function(response){
					dataLayer.push({'event': 'GAevent', 'eventCategory': 'osagoAnketa', 'eventAction': 'buttonClick'});
            	    $containerAjax.html(response);
            	    orderBlockInit($containerAjax);
            	},
            	complete: function(){
            		showContainerAjax($containerAjax);
            		$containerAjax.dequeue("ajax");
            		$window.triggerHandler("resize");	// if mobile device => show only byUpload method
            	}
            });
		});
		
		$containerAjax.dequeue("ajax");
	}

	// валідація форм
	var commonValidateRules = {	//валідація полів форм - об'єкт глобальних правил
			errorPlacement: function(error, element) {
			    element.attr('title', error.text());	// запишемо текст помилки в title атрибут поля
			}
        };
	var orderFormsValidation = function($method){	//$method - блок з формою (самостійно, по телефону, відвантаживши документи)
		// для полів з автокомплітом: валідація при втраті фокусу
		var	$autoCompleteFields = $method.find(".js-autocomplete");

		$autoCompleteFields.blur(function(){	// втрата фокуса поля автокомпліта
			if ($(this).has("js-autocomplete_pre")){return false};
			if ($(this).next().val()){	// додамо позначку помилки валідації якщо не вибрали значення автокомпліта
				$(this).parent(".b-form__cell").removeClass("b-cell_error").addClass("b-cell_valid")
			} else{						// а як навпаки, то позначимо валідним
				$(this).parent(".b-form__cell").removeClass("b-cell_valid").addClass("b-cell_error")
			}
		});

		// рядок регулярного вираза валідації номерного знака
		var plateRegExpStr = "("
							+"[т]?\\d{5}[а-яёії]{2}|"				// ТЦЦЦЦЦББ, ЦЦЦЦЦББ,
							+"\\d{4}[а-яёії](\\d|[а-яёії]{1,2})|"	// ЦЦЦЦБЦ, ЦЦЦЦББ, ЦЦЦЦБББ,
							+"[а-яёії]{2}\\d{5}|"					// ББЦЦЦЦЦ
							+"[а-яёії]{2,4}\\d{4}|"					// ББЦЦЦЦ, БББЦЦЦЦ, ББББЦЦЦЦ,
							+"[а-яёії]{1,2}\\d{4}[а-яёії]{2}|"		// БЦЦЦЦББ, ББЦЦЦЦББ,
							+"([т]|\\d)\\d[а-яёії]{2}\\d{4}|"		// ЦЦББЦЦЦЦ, ТЦББЦЦЦЦ,
							+"(b|c|s)\\d{5}|"						// BЦЦЦЦЦ, CЦЦЦЦЦ, SЦЦЦЦЦ,
							+"(b|c|d|f|h|k|m|p|s|t)?\\d{6}|"		// ЦЦЦЦЦЦ, BЦЦЦЦЦЦ, CЦЦЦЦЦЦ, DЦЦЦЦЦЦ, FЦЦЦЦЦЦ, HЦЦЦЦЦЦ, KЦЦЦЦЦЦ, MЦЦЦЦЦЦ, PЦЦЦЦЦЦ, SЦЦЦЦЦЦ, TЦЦЦЦЦЦ, 
							+"\\d{3}(b|d|f|s)\\d{5}|"				// ЦЦЦBЦЦЦЦЦ, ЦЦЦDЦЦЦЦЦ, ЦЦЦFЦЦЦЦЦ, ЦЦЦSЦЦЦЦЦ,
							+"cc\\d{4}(\\d{2})?|"					// CCЦЦЦЦ, CCЦЦЦЦЦЦ,
							+"\\d{3}c(c|\\d)\\d{4}"					// ЦЦЦCЦЦЦЦЦ, ЦЦЦCCЦЦЦЦ,
							+"cdp\\d{3,4}|"							// CDPЦЦЦ, CDPЦЦЦЦ,
							+"\\d{3}c?dp\\d{4}|"					// ЦЦЦCDPЦЦЦЦ, ЦЦЦDPЦЦЦЦ,
							+"cmd\\d{4}|"							// CMDЦЦЦЦ,
							+"dp\\d{4,6}|"							// DPЦЦЦЦ, DPЦЦЦЦЦ, DPЦЦЦЦЦЦ,
							+")";
		
        var finalizeValidateRules = {	// валідація полів форм - об'єкт локальних правил
            highlight: function (element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element.form).find("label[for=" + element.id + "]").parent('.b-form__cell').addClass('b-cell_' + errorClass).removeClass('b-cell_' + validClass);
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element.form).find("label[for=" + element.id + "]").parent('.b-form__cell').removeClass('b-cell_' + errorClass).addClass('b-cell_' + validClass);
            },
			ignore: ".js-ignoreValidate",
        	rules: {
        		lastName: {
                    required: true,
                    minlength: 2,
                    maxlength: 100,
                    pattern: /^[A-Za-zА-Яа-яЁёІіЇї\-\s]+$/
                },
        		firstName:{
                    required: true,
                    minlength: 2,
                    maxlength: 75,
                    pattern: /^[A-Za-zА-Яа-яЁёІіЇї\-\s]+$/
        		},
        		email:    {
                    required: true,
                    minlength: 5,
                    maxlength: 50,
                    email: true,
                    pattern: /^(\S+)@([a-z0-9-]+)(\.)([a-z]{2,4})(\.?)([a-z]{0,4})+$/
        		},
        		inn:      {
                    required: true,
                    minlength: 1,
                    maxlength: 10,
                    pattern: /^[0-9]+$/
                },
        		phone:    {
        			required: true,
                    pattern: /^\+38[0-9]{10}$/
        		},
        		address:  {
        			required: true,
                    minlength: 2,
                    maxlength: 255,
                    pattern: /^[A-Za-zА-Яа-яЁёІіЇї\-\s\,\.\/0-9]+$/
        		},
        		deliveryAddr:  {
        			required: true,
                    minlength: 2,
                    maxlength: 255,
                    pattern: /^[A-Za-zА-Яа-яЁёІіЇї\-\s\,\.\/0-9]+$/
        		},
        		year:     {
        			required: true,
        			number: true,
        			min: 1960,
        			max: 2018
        		},
        		chassis:  {
        			required: true,
                    minlength: 2,
                    maxlength: 17,
                    pattern: /^[A-Za-z]+[A-Za-z0-9]*$/
        		},
        		plateNum: {
        			required: true,
                    minlength: 2,
                    maxlength: 10,
                    pattern: new RegExp("^" + plateRegExpStr + "$", "i")
        		},
        		date: {
        			required: true,
                    pattern: /^[0-9\.]+$/
        		},
        		regionNP:{
        			required: true
        		},
        		delivDivisionIdNP:{
        			required: true
        		}
        	},
        	messages: {
        		lastName: {
                    required: "Поле обязательно для заполнения!",
                    minlength: "не менее 2х символов",
                    maxlength: "не более 100 символов",
                    pattern: "латинница, кириллица, пробел, дефис"
                },
        		firstName:{
                    required: "Поле обязательно для заполнения!",
                    minlength: "не менее 2х символов",
                    maxlength: "не более 75 символов",
                    pattern: "латинница, кириллица, пробел, дефис"
        		},
        		email:    {
                    required: "Поле обязательно для заполнения!",
                    email: "Введите валидный email-адресс"
        		},
        		inn:      {
        			required: "Поле обязательно для заполнения!",
                    minlength: "не менее одной цифры ",
                    maxlength: "не более 10ти цифр",
                    pattern: "только цифры"
        		},
        		phone:    {
        			required: "Поле обязательно для заполнения!",
                    minlength: "введите до конца номер",
                    pattern: "введите номер украинского оператора связи"
        		},
        		address:  {
        			required: "Поле обязательно для заполнения!",
                    minlength: "не менее 2х символов",
                    maxlength: "не более 255 символов",
                    pattern: "ваш почтовый адресс"
        		},
        		deliveryAddr:  {
        			required: "Поле обязательно для заполнения!",
                    minlength: "не менее 2х символов",
                    maxlength: "не более 255 символов",
                    pattern: "ваш почтовый адресс"
        		},
        		year:     {
        			required: "Поле обязательно для заполнения!",
        			number: "1999 например",
        			min: "не ранее 1960 года выпуска",
        			max: "не позднее 2018 года выпуска",
                    //pattern: "1999 например"
        		},
        		chassis:  {
        			required: "Поле обязательно для заполнения!",
                    minlength: "не менее 2х символов",
                    maxlength: "не более 17 символов",
                    pattern: "латинница, минимум одна цифра"
        		},
        		plateNum: {
                    required: "Поле обязательно для заполнения!",
                    minlength: "не менее 2х символов",
                    maxlength: "не более 10ти символов",
                    pattern: "латинница, кириллица, цифры, без пробелов"
        		},
        		date: {
                    required: "Поле обязательно для заполнения!",
                    pattern: "формат: ДД.ММ.ГГГГ"
        		},
        		regionNP:{
        			required: "Выберите область из списка"
        		},
        		delivDivisionIdNP:{
        			required: "Выберите отделение из списка"
        		}
        	},
			submitHandler: function(form) {	// replaces default form submit behavior
				// треба також перевірити поля автокомпліта
				var  bFocused = false
					,bValid = true
					,$fileFieldsVisible = $method.find("input[type='file']").filter(":visible")
					,i = 0
					,tempField
					;
				// console.log($fileFieldsVisible);	

				// required autocomplete fields check
				$autoCompleteFields.each(function(){
					if(!$(this).prop("disabled")){
						if ($(this).next().val()){
							$(this).parent(".b-form__cell").addClass("b-cell_valid")
						} else{
							$(this).parent(".b-form__cell").addClass("b-cell_error");
							bValid = false;
							if (!bFocused){
								$(this).focus();
								bFocused = true;
							}
						}
					}
				});

				// required file fields check
				// if ($fileFieldsVisible.length){	// перевіряємо чи це форма з полями відвантаження ('є видимі поля файлів')
				// 	for (i = 0; i < $fileFieldsVisible.length; ++i){
				// 	 	if ($fileFieldsVisible.eq(i).val()){
				// 			$fileFieldsVisible.eq(i).parents(".b-form__cell_file").removeClass("b-cell_error").addClass("b-cell_valid");
				// 			break;
				// 		}
				// 	}
				// 		// console.log(i);
				// 	if (i == $fileFieldsVisible.length){
				// 		bValid = false;
				// 		$fileFieldsVisible.eq(0).parents(".b-form__cell_file").removeClass("b-cell_valid").addClass("b-cell_error");
				// 		$fileFieldsVisible.eq(0).focus();
				// 	}
				// }
				
				// $fileFieldsVisible.each(function(){
					// if ($(this).val()){
						// $(this).parents(".b-form__cell").addClass("b-cell_valid")
					// }
				// });
				// if ($(this).val()){
						// $(this).parents(".b-form__cell").addClass("b-cell_valid")
					// } else{
						// $(this).parents(".b-form__cell").addClass("b-cell_error");
						// bValid = false;
						// if (!bFocused){
							// $(this).focus();
							// bFocused = true;
						// }
					// }
				
				
				if (bValid){
					dataLayer.push({'event': 'GAevent', 'eventCategory': 'anketaOrder', 'eventAction': 'anketaPurchase'});
					// $.ajax({
					// 	url: form.action,
					// 	type: form.method,
					// 	data: $(form).serialize(),
					// 	success: function(response) {
					// 		showThanks($containerAjax, response);
					// 	}            
					// });

					//Show thanks function start ------
					$(".b-container_preloader").fadeIn();	// показуємо лоадер
					hideContainerAjax($containerAjax);
                    $containerAjax.queue("ajax", function(){
						if(form.id == 'formByUpload'){
	                        // var formData = new FormData($('#formByUpload')[0]);
	                        // console.log(formData);
	                        $.ajax({
	                            url: "./ajax/__thanks.html", 
	                            // type: 'POST',
	                            // data: formData,
	                            type: "get",	// for local test
	                            data: $(form).serialize(),	// for local test
	                            // contentType: false,
	                            // processData: false,
	                            // cache: false,
	                            success: function(response) {
	                            	// GTM
	                            	dataLayer.push({'event': 'GAeventDocument', 'eventCategory': 'formSentOsagoLanding', 'eventAction': 'document'});

	                                $containerAjax.html(response);	// вставляємо сенкю
	                            },
	                            error: function(){
	                                alert('ERROR at PHP side!!');
	                            },
	                            complete: function(){
	                                showContainerAjax($containerAjax);
	                                $containerAjax.dequeue("ajax");
	                                $(".b-container_preloader").fadeOut();
	                            }
	                            //Options to tell jQuery not to process data or worry about content-type.
	                        });
	                    } else {
	                        $.ajax({
	                            url: "./ajax/__thanks.html",
	                        	// url: form.action,
	                            // type: form.method,
	                            type: "get",
	                            data: $(form).serialize(),
	                            success: function(response){
	                            	// GTM
	                            	if (form.id == 'formBySelf'){
	                            		dataLayer.push({'event': 'GAeventForm', 'eventCategory': 'formSentOsagoLanding', 'eventAction': 'form'});
	                            	} else if(form.id == 'formByPhone'){
	                            		dataLayer.push({'event': 'GAeventByPhone', 'eventCategory': 'formSentOsagoLanding', 'eventAction': 'by phone'});
	                            	}

	                                $containerAjax.html(response);	// вставляємо сенкю
	                            },
	                            complete: function(){
	                                showContainerAjax($containerAjax);
	                                $containerAjax.dequeue("ajax");
	                				$(".b-container_preloader").fadeOut();	// ховаємо лоадер
	                            }          
	                        });
	                    }
	                });
	                $containerAjax.dequeue("ajax");
					//Show thanks function end ------
				}
		    }
        };
        
        return $method.find(".b-form_finalize").validate($.extend(commonValidateRules, finalizeValidateRules));
	};

	// ініціалізація блока оформлення замовлень
	var orderBlockInit = function($containerAjax){		
		var  $orderBlock = $("#finalize")
			,$methodBtns = $orderBlock.find(".b-finalize__btn_method")
			,$methods = $orderBlock.find(".b-finalize__method")
			,$activeMethod = $methods.filter(".js-method_active")	// метод "Заповнити самостійно"
			,$trash = $orderBlock.find(".b-method__trash")	// блок хлопець-дівчина
			,$trashTabs = $trash.find(".b-trash__tab")
			,$trashCard = $trash.find(".b-trash__sides")
			,$brand = $("input[name = 'brand']")
			,$model = $("input[name = 'model']")
			,$filesWrap = $orderBlock.find(".b-wrap_files")
			,$filesInput = $filesWrap.find("input[type='file']")
			// ,$filesList = $filesWrap.find(".b-list_files")
			// ,$filesProgress = $filesWrap.find(".b-progress_files")
			,$submitButtons = $methods.find("#submitBySelf, #submitByPhone, #submitByUpload")
			,validatorCurrent = orderFormsValidation($methods.filter("#bySelf"))	// formBySelf validation init
			// змінні для логіки відображення доставки
			,$deliveryMode = $methods.find("select[name='deliveryMode']")	// селекти методів доставки
			,deliveryStr = "bySelf"	//самовывоз
			,regionId = "bySelf"	//самовывоз
			// наступних елементів буде по 2 об'єкти - один в формі методу "Заповнити самостійно", другий в "Отправить документы"
			,$selfMap = $methods.find(".b-form__cell_map")
			,$courierCity = $methods.find("input[name='delivCityId']").prev()
			,$courierAddr = $methods.find("input[name='deliveryAddr']")
			,$newPostRegion = $methods.find("select[name='regionNP']")
			,$newPostCity = $methods.find("input[name='delivCityIdNP']").prev()
			,$newPostDivision = $methods.find("select[name='delivDivisionIdNP']")
			,$newPostRow = $(".js-np-address").parents(".row_form")
			,$bySelfAddress = $(".js-self-address")
			,$commentField = $(".js-comment-order")
			,$orderByYourselfNavigate = $orderBlock.find(".js-step-nav")
			;
		
		// show only selected buy method
		$methodBtns.click(function(e){
			e.preventDefault();

			var $activeBtn = $methodBtns.filter(".b-finalize__btn_active")
				,methodNum = $methodBtns.index($(this))
				;
				// $activeMethod = $methods.filter(".js-method_active");
				
			if($activeBtn[0] != $(this)[0]){
				$activeBtn.removeClass("b-finalize__btn_active");
				$(this).addClass("b-finalize__btn_active");
				$activeMethod.fadeOut(400, function(){
					$activeMethod.removeClass("js-method_active");
					$activeMethod = $methods.eq(methodNum).addClass("js-method_active");
					$activeMethod.fadeIn(400);	// show active method
					// validate current method form
					validatorCurrent = orderFormsValidation($activeMethod);	// hidden method could not be initialized before
				});
			}

			// scroll to block
			var  
				 $anchor = $methods.parent()
				,offsetAnchor = $anchor.offset().top
				;
				
				// offsetAnchor -= $("#header").outerHeight();	// fixed header offset

			$('html, body').animate({ scrollTop: offsetAnchor}, 1500);
		});

		// Order by yourself - steps navigation
		$orderByYourselfNavigate.on('click', function(e){
			e.preventDefault();
			var stepId = $(this).data('step');
			var isEmptyField = false;

			$('.step--'+(stepId-1)+' .b-form__block .b-form__cell').each(function(){
				if (!$(this).find('input').val()){
					$(this).addClass('b-cell_error');
					isEmptyField = true;
				}
			});
			if ( !$('.step--'+(stepId-1)+' .b-form__block .b-cell_error').length && !isEmptyField ){
				$('.step').removeClass('is--active');
				$('.step--'+stepId).addClass('is--active');

				switch (stepId) {
					case 2:
						dataLayer.push({'event': 'GAevent', 'eventCategory': 'anketaOrder', 'eventAction': 'anketaStepOne'});
						break;
					case 3:
						dataLayer.push({'event': 'GAevent', 'eventCategory': 'anketaOrder', 'eventAction': 'anketaStepTwo'}); 
					break;
					default:
						break;
				}
			}
		});
		// on mobiles show only byFileUpload method

		$window.on("resize", function(){
			if ($window.outerWidth() <= BREAKPOINT_XS && !$methodBtns.filter("[data-for='byUpload']").hasClass("b-finalize__btn_active")){
			//  console.log("viewport <= 767px");
			 $methodBtns.filter("[data-for='byUpload']").trigger("click");
			} else {
			//  console.log("viewport > 767px");
			 $methodBtns.filter("[data-for='bySelf']").trigger("click");
			}
		 });

		// перемикання блоку "парень-девушка"
		$trashTabs.click(function(){
			if (!$trashCard.is(":animated")){
				if (!$(this).hasClass("b-trash__tab_active")){
					$trashTabs.removeClass("b-trash__tab_active");
					$(this).addClass("b-trash__tab_active");
					$trashCard.toggleClass("b-sides_flip")
				}
			}
		});

		// повісимо маски на поля:
			// номерів телефону
		$methods.find("input[type='tel']").mask("?+380999999999");
			// року випуску авто
		$methods.find("input[name='year']").mask("?9999");
			// дати початку дії поліса
		$methods.find("input[name='date']").mask("?99.99.9999");

		// заборонимо вводити пробіл в поле номерного знаку
		$("#plateNum").on("keypress", function(e){
			if (e.which == 32){
				return false;
			}
		})

		// pickadate initialization
		var pickadayOptions = {
			min: +1,	// початкова дата - завтрашній день
			onClose: function () {
			   $("#bySelf").find(".picker__holder").blur();	// заборонимо спливати календарю при згортанні-розгортанні вікна браузера (коли фокус на даті)
			}
		}
		$orderBlock.find("#bySelf").find("#date").pickadate(pickadayOptions);

		//	file input logic
		$filesInput.change(function (){
			$(this).blur();
			var  filesNum = this.files.length	// задумувалось для багатьох файлів, а зараз лише один файл
				,filesListStr=""	// рядок з html рядком імен файлів
				,$button = $(this).next("button")	// кнопка вибору файла (над input)
				,$fileProgress = $button.find(".b-progress_files")	// div прогреса завантаження :-D
				,$filesList = $button.next(".b-list_files")	// div з іменами файлів
				,i
				,tempField
				,bValidType
				,t = this
				;

			var checkType = function(t){
				if (filesNum){	// перевіряємо чи не видалено файли
					var re = /image\/(jpeg|pjpeg|png|webp)/i;	// allowed MIME file types
					// return t.files[0].type.match('image.*');
					return t.files[0].type.match(re);
				}
			}

			bValidType = checkType(t);
			
			if (filesNum > 0 && bValidType){	// якщо вибрали файл і він з дозволеним розширенням
				// помітимо поле як валідоване
				$(this).parents(".b-form__cell_file").removeClass("b-cell_error").addClass("b-cell_valid");
				// анімуємо смужку прогреса
				$fileProgress.animate({
					width: "" + this.files.length*102 + "%"
				},400);
				// і покажемо найперше пусте приховане поле
				for (i = 1; i < $filesInput.length; ++i){
					tempField = $filesInput[i];
					if (!$(tempField).val() && $(tempField).parent(".b-wrap_files").hasClass("hidden")){
						$filesWrap.eq(i).removeClass("hidden");
						break;
					}
				}
				
				// покажемо імена файлів
				filesListStr += '<span class="b-filename"><span class="b-filename__text">' + this.files[0].name + '</span><span class="fa fa-check" aria-hidden="true"></span>';
				if ($(this).attr("id") != "copies_byupload"){
					// filesListStr += '<span class="fa fa-times-circle-o js-clearFiles" aria-hidden="true"></span></span>';	// додамо хрестик видалити файл
					filesListStr += '<button class="b-clear js-clearFiles"><span class="hidden-xs">удалить</span><span class="fa fa-times" aria-hidden="true"></span></button></span>';	// додамо опцію видалити файл
				} else {
					// filesListStr += '<span class="fa fa-check" aria-hidden="true"></span></span>';	// для файла в першому полі приберемо хрестик
					filesListStr += '</span>';	// для файла в першому полі немає опції "видалити"
				}
			} else {	// якщо видалили файли, чи додали файли невалідних типів
				// перевіримо чи є іще заповнені файлові поля, якщо ні то покажемо помилку валідації
				var 
					filledNum = 0	// ініціалізуємо лічильник заповнених полів
					,$fileInputsBlock = $(this).parents(".b-form__cell_file")
					;
				$filesInput.each(function(){
					if (filledNum > 1){
						return false	// якщо заповнених видимих полів більше ніж одне то виходимо з цикла
					} else if ($(this).val() && !$(this).parent(".b-wrap_files").hasClass("hidden")){
						++filledNum;
					}
				});
				if (filledNum >= 1){	// якщо є заповнені видимі поля то validation success 
					$fileInputsBlock.removeClass("b-cell_error").addClass("b-cell_valid")
				} else {
					$fileInputsBlock.removeClass("b-cell_valid").addClass("b-cell_error")
				}
				
				$fileProgress.css("width", "0px")	// якщо видалили файли, то сховаємо смужку прогреса
				if ($(this).attr("id") != "copies_byupload"){	// якщо видалили файли, і це не перше поле з валідацією
					var emptyNum = 0;	// лічильник к-ті пустих видимих полів
					
					$filesInput.each(function(){
						if (emptyNum > 1){
							return false	// якщо пустих видимих полів більше ніж одне поточне то виходимо з цикла
						} else if (!$(this).val() && !$(this).parent(".b-wrap_files").hasClass("hidden")){
							++emptyNum;
						}
					});
					if (emptyNum > 1){	// якщо є іще пусті видимі поля то сховаємо поточне пусте 
						$(this).parent(".b-wrap_files").addClass("hidden")
					}
				} else {	// якщо видалили файли і це перше обов’язкове поле
					// то може бути іще пусте поле, яке треба сховати
					// $filesInput.each(function(){
					for (i = 1; i < $filesInput.length; ++i){ // перевіряємо всі поля окрім першого пустого 
						tempField = $filesInput[i];
						if (!$(tempField).val() && !$(tempField).parent(".b-wrap_files").hasClass("hidden")){
							$filesWrap.eq(i).addClass("hidden");	// видаляємо решту пустих полів
						}
					}
				}
			}
			$filesList.html(filesListStr);

			$filesList.find(".js-clearFiles").click(function(){	// видалятимо файли при кліку на хрестик
				var $fileField = $(this).parents(".b-wrap_files").find("input[type='file']");
				$fileField.val("");	// обнулимо input
				$(this).parents(".b-list_files").html("");	// видалимо список файлів
				$fileField.change();
			});
		});

		// додамо до поля марки статичну випадашку при введенні від 0 до 1 символа (до відпрацювання автокомпліта)
		precomplete(1, $brand, function(){
			$model.prop("disabled", false);
		});

	// autocomplete для полів:
		// "марка"
		fieldAutocomplete(2, $brand, "./ajax/brand.json", null, function(){
			$model.prop("disabled", false);
		});
		// "модель"
		fieldAutocomplete(2, $model, "./ajax/model.json", $brand.next());
// - Delivery fields -------------------------
	// delivery selects stylization
		// delivery method select
		$deliveryMode.selectric({	// стилізуємо селекти вибора доставки
			disableOnMobile: false,
			nativeOnMobile: false,
			onChange: function(element) {	// element==this - це наш select, він лишається тим самим об'єктом і після ініціалізації selectric
			console.log("delivery mode changed")
				deliveryStr = $(element).val();	// current select value				
				var indexOfThis = $deliveryMode.index($(element));	// index of current $(element) between $deliveryMode selects
				
				// при зміні значення клікнутого селекта змінимо значення решти селектів доставки в інших методах з доставкою
				for (var i=0; i < $deliveryMode.length; ++i){
					if (i != indexOfThis){
						$deliveryMode.eq(i).val(deliveryStr).selectric("refresh");	// змінюємо значення і оновлюємо selectric
					}
				}

				switch (deliveryStr) {
					case "bySelf":	// самовивоз
						// елементи Кур'єра
						$courierCity.prop("disabled", true).addClass("hidden")
									.parent().addClass("hidden");
						$courierAddr.prop("disabled", true).addClass("hidden")
									.parent().addClass("hidden");
						// елементи НП						
						$newPostRegion.prop("disabled", true);
						$newPostCity.prop("disabled", true);
						$newPostDivision.prop("disabled", true);
						$newPostRow.addClass("hidden");
						// елементи Самовивоза
						$selfMap.removeClass("hidden");
						$commentField.removeClass("hidden");
						$bySelfAddress.removeClass("hidden");
						break;
					case "byCourier":	// кур'єр
						// елементи Самовивоза
						$selfMap.addClass("hidden");
						$bySelfAddress.addClass("hidden");
						// елементи НП						
						$newPostRegion.prop("disabled", true);
						$newPostCity.prop("disabled", true);
						$newPostDivision.prop("disabled", true);
						$newPostRow.addClass("hidden");
						// елементи Кур'єра
						$courierCity.prop("disabled", false).removeClass("hidden")
									.parent().removeClass("hidden");
						$courierAddr.prop("disabled", false).removeClass("hidden")
									.parent().removeClass("hidden");
						$commentField.removeClass("hidden");
						break;
					case "byNP":	// НП
						// елементи Кур'єра
						$courierCity.prop("disabled", true).addClass("hidden")
									.parent().addClass("hidden");
						$courierAddr.prop("disabled", true).addClass("hidden")
									.parent().addClass("hidden");
						// елементи Самовивоза
						$selfMap.addClass("hidden");
						$bySelfAddress.addClass("hidden");
						// елементи НП						
						$newPostRow.removeClass("hidden");
						$commentField.addClass("hidden");
						$newPostRegion.each(function(){
							$(this).prop("disabled", false).removeClass("hidden");
							$(this).selectric("refresh");
						})
						// Якщо є введені значення в полях міста чи відділення, то при тимчасовій зміні вибору способа доставки 
						// при поверненні значення зберігаються в цих полях, але вони disabled, виправимо це
						// if ($newPostCity.next().val() || $newPostRegion.val()){
						$newPostCity.each(function(){
							if ($(this).next().val()){
								$(this).prop("disabled", false);
							}
						})
						$newPostCity.removeClass("hidden");
						$newPostDivision.each(function(){
							if ($(this).val()){
								$(this).prop("disabled", false);
							}
						})
						$newPostDivision.removeClass("hidden");	// покажемо рядок опцій НП
						break;
				}
				$(element).change();	// fired by default
			}
		});
		$newPostRegion.selectric({	// НП обл
			onInit: function() {
				$(this).parents(".selectric-wrapper").find(".selectric-items li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
				$(this).each(function(){
					$(this).prop("disabled", true)
				})
			},
			onRefresh: function(){
				$(this).parents(".selectric-wrapper").find(".selectric-items li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
			},
			onChange: function(element) {	// element==this - це наш select, він лишається тим самим об'єктом і після ініціалізації selectric
				var regionId = $(element).val();	// current select value				
				var indexOfThis = $deliveryMode.index($(element));	// index of current $(element) between $newPostRegion selects
				
				// при зміні значення клікнутого селекта змінимо значення решти селектів доставки в інших методах з доставкою
				for (var i=0; i < $deliveryMode.length; ++i){
					if (i != indexOfThis){
						$newPostRegion.eq(i).val(regionId).selectric("refresh");	// змінюємо значення і оновлюємо selectric
						$newPostRegion.eq(i).parents(".selectric-wrapper").find(".selectric-items li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
					}
				}
				$(this).parents(".b-form__cell").removeClass("b-cell_error");	// фікс незникаючої помилки валідації поля
				//треба показати поле міста, видалити значення з нього і прихованого поля
				$newPostCity.each(function(index){
					$(this).val("");
					$(this).next().val("");
					$(this).prop("disabled", false);
				});
				$newPostDivision.each(function(index){
					$(this).val("");
					$(this).prop("disabled", true)
				});
				//треба сховати поле відділення, видалити значення з нього і прихованого поля

				$(element).change();	// fired by default
			}
		});
		$newPostDivision.selectric({	// НП відділення
			onInit: function() {
				$(this).parents(".selectric-wrapper").find(".selectric-items li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
				$(this).each(function(){
					$(this).prop("disabled", true);
					// $(this).selectric("refresh");
				})
			},
			onRefresh: function(){
				$(this).parents(".selectric-wrapper").find(".selectric-items li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
			},
			onChange: function(element) {	// element==this - це наш select, він лишається тим самим об'єктом і після ініціалізації selectric
				var divisionId = $(element).val();	// current select value				
				var indexOfThis = $deliveryMode.index($(element));	// index of current $(element) between $newPostDivision selects
				
				// при зміні значення клікнутого селекта змінимо значення решти селектів доставки в інших методах з доставкою
				for (var i=0; i < $deliveryMode.length; ++i){
					if (i != indexOfThis){
						$newPostDivision.eq(i).val(divisionId).selectric("refresh");	// змінюємо значення і оновлюємо selectric
						$newPostDivision.eq(i).parents(".selectric-wrapper").find(".selectric-items li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
					}
				}
				$(this).parents(".b-form__cell").removeClass("b-cell_error");	// фікс незникаючої помилки валідації поля
				
				$(element).change();	// fired by default
			}
		});
	// delivery selects stylization end
	
	//delivery autocompletes...
		// місто доставки (із областю для кур’єра) delivRegionIdNP
		fieldAutocomplete(2, $courierCity, "./ajax/cityRegion.json");
		// НП:
			// місто
		fieldAutocomplete(2, $newPostCity, "./ajax/city.json", $newPostRegion, function(){
			$newPostDivision.each(function(index){
				var t = this;
				$(t).val("");
				// $(this).next().val("");
				$.ajax({
					type: "get",
					data: {cityId: $newPostCity.next().val()},	// send cityId to obtain divisions
					url : "./ajax/__division.html",
	            	error : function(){
	            	    alert('error');
	            	},
	            	success: function(response){
	            		var html = $.parseHTML(response);
	            		$(t).html('<option value="" disabled selected hidden>Выберите отделение</option>');
	            		$(t).append(response);
	            	},
	            	complete: function(){
	            		$(t).prop("disabled", false);
						$(t).selectric("refresh");
	            	}
				})
				
			});
		});
			// відділення
		// fieldAutocomplete(1, $newPostDivision, "./ajax/division.json", $newPostCity.next());

//- Delivery fields END -------------------------
	
		$("#formBySelf, #formByUpload").submit(function(event){
			event.preventDefault();
			$(".js-autocomplete").each(function(){
				if (!$(this).prop("disabled")){
					$(this).focus().blur();
				}
			});
			$(".js-autocomplete_pre").focus();
		});

	}
	
	// show thanks page
	// var showThanks = function($containerAjax, responseFromPhp){
	// 	hideContainerAjax($containerAjax);

	// 	// -- temporary Ajax for static demo --
	// 	// !!! comment it on server
	// 	$containerAjax.queue("ajax", function(){
	// 		// place for Ajax sending
	// 		$.ajax({
 //            	type: "get",
 //            	url : "./ajax/__thanks.html",
 //            	error : function(){
 //            	    alert('error');
 //            	},
 //            	success: function(response){
 //            	    $containerAjax.html(response);
 //            	    // thanksInit($containerAjax);
 //            	},
 //            	complete: function(){
 //            		showContainerAjax($containerAjax);
 //            		$containerAjax.dequeue("ajax");
 //            	}
 //            });
	// 	});
		//-----------------------------------

		// !!! 
		// commented variant for php server
		// $containerAjax.queue("ajax", function(){
  //           $containerAjax.html(responseFromPhp);
  //           showContainerAjax($containerAjax);
  //           $containerAjax.dequeue("ajax");
		// });

	// 	$containerAjax.dequeue("ajax");
	// }

	// vehicle calculator
	var showVehicleCalc = function($containerAjax){
		hideContainerAjax($containerAjax);

		$containerAjax.queue("ajax", function(){
			// place for Ajax sending
			$.ajax({
            	type: "get",
            	url : "./ajax/__calcVehicle.html",
            	error : function(){
            	    alert('error');
            	},
            	success: function(response){
            	    $containerAjax.html(response);
            	    vehicleCalcInit($containerAjax);
            	},
            	complete: function(){
            		showContainerAjax($containerAjax);
            		$containerAjax.dequeue("ajax");
            	}
            });
		});
		// $containerAjax.queue("ajax", function(){
		// 	// place for Ajax sending
		// 	$(this).load("./ajax/__calcVehicle.html", function(){vehicleCalcInit($containerAjax)});	// підвантажуємо пропозиції та ініціалізуємо на них js-функціонал
			 
		// 	$(this).dequeue("ajax");
		// 	// hideBcrumbs($bCrumbs);	// show breadcrumbs
		// });

		// showContainerAjax($containerAjax);
		
		$containerAjax.dequeue("ajax");
	};
	var vehicleCalcInit = function($containerAjax){
		// selects stylization
		$(".js-selectric").selectric({
			disableOnMobile: false,
			nativeOnMobile: false,
		    onSelect: function(element) {
		    	$(element).change();
		    	var value = $(element).val();
		    	$("#vehicleForm").find("input[name='type'][value=" + value + "]").prop("checked", true).trigger("change");
		    }
	    });
		// vehicles labels select
		var  $vehicles = $(".b-vehicle")	//	блоки тз з картинками
			,$vehiclesBlock = $(".b-vehicles")	// $vehicles container
			,$paramBlocks = $(".b-params")	// відповідні блоки з радіобатонами до кожного тз
			;
		$vehiclesBlock.mouseleave(function(){	// виділимо вибраний блок коли курсор ззовні
			$vehicles.filter(".js-vehicle_active").addClass("b-vehicle_active");
		});
		$vehicles.hover(function(){	// при наведенні курсора на певний тз виділятимемо лише його, а активний буде невидимим
			$vehicles.removeClass("b-vehicle_active");
			$(this).addClass("b-vehicle_active");
		}, function(){
			$(this).removeClass("b-vehicle_active");
		});
		$vehicles.click(function(){
			$vehicles.removeClass("js-vehicle_active");
			$(this).addClass("js-vehicle_active");
			var index = $vehicles.index($(this))	// індекс типу тз (від 0 до 3)
				,$paramBlockActive = $paramBlocks.filter(".js-params_active")
				;

			if ($paramBlockActive != $(this)){	// не будемо ховати і показувати вже видимий блок параметроів
				$paramBlockActive.removeClass("js-params_active");	// робимо неактивним блоком параметрів
				$paramBlockActive.removeClass("b-params_active");	// ховаємо неактивний блок параметрів
				$paramBlocks.eq(index).addClass("js-params_active");// робимо активним блоком параметрів
				$paramBlocks.eq(index).find("input").eq(1).prop("checked", true);	// вибиратимемо 2й радіобатн вибраного тз
				$paramBlocks.eq(index).addClass("b-params_active");	// показуємо активний блок параметрів
			}
		});

		// слайдер Франшизи
		$(".js-range_franshiza").ionRangeSlider();

		// додамо до поля міста реєстрації статичну випадашку при введенні від 0 до 1 символа (до відпрацювання автокомпліта)
		precomplete(2, $("#regCity"));

		//ajax registration city autocomplete
		fieldAutocomplete(3, $("#regCity"), "./ajax/cityRegion.json");	// EWA віддає результат, починаючи з 3х символів
		
		// валідація
		var  $vehicleForm = $("#vehicleForm")
			,$cityId = $vehicleForm.find("#cityId")
			,$cityName = $vehicleForm.find("#regCity")
			;
		$vehicleForm.submit(function(event){
			event.preventDefault();
			if (!$cityId.val()){	//якщо не вибране місто реєстрації (відповідне приховане поле без значення)
				$cityName.focus();
			} else {
				showPropositions($containerAjax);	// load of propositions
			}
		});
	};

	// precomplete при введенні від 0 до 1 символа (до відпрацювання автокомпліта)
	// $field - field with autocomplete and hidden field after
	// clickCallbackFn - callback fn
	var precomplete = function(iSymbols, $field, clickCallbackFn){
		// var  $field = $(context)
		var  $idField = $field.next()
			,$zoneIdField
			,$dropMenu = $idField.siblings(".js-precomplete")
			,$menuItems = $dropMenu.children()
			,fieldValue
			,currentValue
			;

		$field.keyup(function(){
			currentValue = $(this).val();
			if ($field.val().length<=iSymbols){
				$dropMenu.show();
			} else{
				$dropMenu.hide();
			}
		})
		$field.on("focus", function(){
			if ($field.val().length<=iSymbols){
				$dropMenu.stop().show();
			}
		});
		$field.on("blur",function(){
			$dropMenu.fadeOut();
		});
		$menuItems.click(function(event){
			var  
				 selectedItem = $(this).text()
				,selectedID = $(this).attr("data-id")
				,selectedZoneID = $(this).attr("data-zone")
				;

			$field.val(selectedItem);
			$field.attr("data-item", selectedItem);
			$idField.val(selectedID);
			if (selectedZoneID){	// перевіряємо чи є додатковий id який треба зберегти
				$idField.next().val(selectedZoneID)
			};
			// $dropMenu.hide();
			$field.blur();
			$field.parents(".b-form__cell").removeClass("b-cell_error");
			$field.parents(".b-form__cell").addClass("b-cell_valid");
			if (clickCallbackFn){
				clickCallbackFn();
			}
		});
	};

	// autocomplete function 
	// (enter string, shows items, select item -> send item id)
	// note: under autocompleted field must be placed hidden input with name attr, to return item id
	var fieldAutocomplete = function(iMinChars, $objToComplete, jsonAddr, $dataIdtoSend, callbackFn){
		var  oJS		//відповідний JSоб'єкт до JSON об'єкту AJAX відповіді
			,items = []		// масив елементів
			,propertiesLength	// зберігаємо тут к-ть властивостей item-а
			,bLength3
		    ,itemIds = []	// масив id елементів
		    ,itemOtherIds = []	// масив додаткових id елементів
		    ,criteria = null
		    ,itemIndex
		    ,currentId
		    ,currentOtherId
			;

		$objToComplete.each(function(index){
			var t = this;
			$(t).autoComplete({
				minChars: iMinChars,
			    source: function(term, response){

					if ($dataIdtoSend instanceof jQuery){
						criteria = $dataIdtoSend.val();
					}

			        $.ajax({
		            	type: "get",
		            	data: {item: term, criteria: criteria},
		            	url : jsonAddr,
		            	error : function(){
		            	    alert('error');
		            	},
			        	success: function(data){
				        	items = []; // масив елементів
				    		itemIds = [];	// масив id елементів
				    		itemOtherIds = [];	// масив додаткових id елементів
				        	oJS = data;	//відповідний JSоб'єкт до JSON об'єкту AJAX відповіді
				        	// oJS = JSON.parse(data);	//відповідний JSоб'єкт до JSON об'єкту AJAX відповіді
				        	propertiesLength = 0;
				        	var i;
				        	// for (i in oJS.items[0]) {
				        	// 	if (oJS.items[0].hasOwnProperty(i)) {
				        	for (i in oJS.items) {
				        		if (oJS.items.hasOwnProperty(i)) {
				        			++propertiesLength;
				        		}
				        	}
				        	bLength3 = (propertiesLength == 3);	// маємо додатковий Id (zoneId), треба створити їх масив itemOtherIds
				        	if (oJS.length != 0){	// перевіряємо чи не відсутні співпадіння (чи відповідь не пустий масив)
				        		for (var i = 0; i < oJS.items.length; ++i) {	// наповнимо масив елементів і їхніх id
				        			items.push(oJS.items[i].name);
				        			itemIds.push(oJS.items[i].id);
				        			if (bLength3) {itemOtherIds.push(oJS.items[i].zone_id)};
				        		};
				        		response(items);
				        	}
				        }
			        });
			    },
			    onSelect: function (event, term, item) {
			    	itemIndex = items.indexOf(String(term));	// індекс елемента в масиві (обов'язково type String)
			    	currentId = itemIds[itemIndex];		// id обраного елемента

		    		if (bLength3){currentOtherId = itemOtherIds[itemIndex]}	// зберігаємо обраний zone_id (якщо такі є)
			    	$objToComplete.each(function(){	// заповнимо решту однакових полів однаковими значеннями
			    		if($(this) != $(t)){	// значення в полі на якому ми вибрали значення автокомпліта
			    			$(this).val(term);
			    		};
			    		$(this).attr("data-item", term);	// додаємо атрибут в якому зберігатиметься вибраний item
			    		$(this).next().val(currentId);	// повертаємо id елемента прихованому елементу форми
			    		if (bLength3){$(this).next().next().val(currentOtherId)}	// присвоюємо zone_id 2му прихованому полю
			    	});

					$objToComplete.parent(".b-form__cell").removeClass("b-cell_error").addClass("b-cell_valid");	// позначаємо валідним поле

					if (callbackFn){	// перевіряємо чи існує колбек ф-я в параметрах, щоб уникнути помилки
						callbackFn();
					}
			    }
			});
		});
		$objToComplete.blur(function(){	// при втраті фокуса, якщо ми змінили значення, але не обрали з меню автокомпліта, то повернемо раніше обране значення полю
			var  dataItem = $(this).attr("data-item")	// раніше обране значення, збережене в атрибуті "data-item"
				,fieldValue = $(this).val()	// поточне значення
				;
			if (dataItem && (fieldValue != dataItem)){	// перевірка чи є попередньо обране значення (якщо)
				$(this).val(dataItem);	// як є то запишемо вибране раніше значення
			}
		})
	}

// breadcrumbs click event listener
    $(document).on('click', '.b-crumbs__link, .js-crumbs__link', function(e){
				e.preventDefault();
        var step = +$(this).attr('data-step');	// 1 - вибір ТЗ, 2 - пропозиції

	    switch (step){
	        case 1:
				showVehicleCalc($containerAjax);
	            break;
	        case 2:
        		hideContainerAjax($containerAjax);
		        $containerAjax.queue("ajax", function(){
		        	$.ajax({
			        	type: "get",
			        	// url: "/ohproject/osago/osago-show-propositions",
			        	url : "./ajax/__propositions.html",
			        	error : function(){
			        	    alert('error');
			        	},
			        	success: function(response){
			        	    $containerAjax.html(response);
			        	    propositionsInit($containerAjax);
			        	},
			        	complete: function(){
			        		showContainerAjax($containerAjax);
			        		$containerAjax.dequeue("ajax");
			        	}
			        });
			    });
	        	$containerAjax.dequeue("ajax");
	    }
    });	

//	vehicle calculator js initialization
	vehicleCalcInit($containerAjax);	//
	
// reasons slider
	var $sliderReasons = $(".b-reasons__slider .b-slider__string").slick({
		arrows: false,
		infinite: true,
		speed: 400,
		slidesToShow: 3,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 4400,
		responsive: [
			{
				breakpoint: 770,
				settings: {
					slidesToShow: 2
			 	}
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 1
			 	}	
			}
		]
	});
	// add my buttons to ads slider
	var  $sliderReasonsPrevBtn = $sliderReasons.parents(".b-reasons__slider").find(".b-slider__control_left")
		,$sliderReasonsNextBtn = $sliderReasons.parents(".b-reasons__slider").find(".b-slider__control_right")
		;
	$sliderReasonsPrevBtn.click(function(event){
		event.preventDefault();
		$sliderReasons.slick("slickPrev");
	});	
	$sliderReasonsNextBtn.click(function(event){
		event.preventDefault();
		$sliderReasons.slick("slickNext");
	});

// зафарбуємо необхідну к-ть зірочок рейтингу компанії в (РЕЙТИНГ КЛИЕНТОВ OH.UA)
	fillAllStars(".b-company__rating");

// clientsRating/mtsb switch
	var  $ratingBtns = $(".b-section_rating .b-rating__btn")
		,$ratingClients = $(".b-rating__wrapper_clients")
		,$ratingMtsbu = $(".b-rating__wrapper_mtsbu")
		;
	$ratingBtns.click(function(){
		if (!$(this).hasClass("b-btn_active")){
			$ratingBtns.removeClass("b-btn_active");
			$(this).addClass("b-btn_active")
			if($(this).hasClass("b-rating__btn_mtsbu")){
				$ratingClients.fadeOut(600);
				$ratingMtsbu.fadeIn(600);
			} else if($(this).hasClass("b-rating__btn_clients")){
				$ratingMtsbu.fadeOut(600);
				$ratingClients.fadeIn(600);
			}
		}
	});

//	scroll to calculator
	$(".b-anchor_calculator").click(function(event){
		event.preventDefault();
		var  $anchor = $($(this).attr("href"))
			,offsetAnchor = $anchor.offset().top
			;
		$('html, body').animate({ scrollTop: offsetAnchor}, 600);
		return false;
	});

// client rating slider
	var $sliderRating = $(".b-rating__slider .b-slider__string_rating").slick({
		arrows: false,
		infinite: true,
		speed: 400,
		slidesToShow: 1,
		slidesToScroll: 1,
		// autoplay: true,
		// autoplaySpeed: 4400
	});
	// add my buttons to ads slider
	var  $sliderRatingPrevBtn = $sliderRating.parents(".b-rating__slider").find(".b-slider__control_left")
		,$sliderRatingNextBtn = $sliderRating.parents(".b-rating__slider").find(".b-slider__control_right")
		;
	$sliderRatingPrevBtn.click(function(event){
		event.preventDefault();
		$sliderRating.slick("slickPrev");
	});	
	$sliderRatingNextBtn.click(function(event){
		event.preventDefault();
		$sliderRating.slick("slickNext");
	});

// faq accordion
	var  $faq = $(".b-questAnsw")
		,$faqHeading = $(".b-questAnsw h5")
		;

	$(".b-questAnsw:nth-child(n+2)").find("p").hide();
	$faqHeading.click(function(){
		if ($(this).parent(".b-questAnsw").hasClass("b-questAnsw_unrolled")){
			$(this).next("p").slideUp(400).parent(".b-questAnsw").removeClass("b-questAnsw_unrolled");
		} else {
			$faq.find(".b-questAnsw_unrolled").next("p").slideUp(400).parent(".b-questAnsw").removeClass("b-questAnsw_unrolled");
			$(this).next("p").slideDown(400).parent(".b-questAnsw").addClass("b-questAnsw_unrolled");
		}
	});

// faq show more btn
	var 
		 $faqBtnMore = $(".js-btn_faqs")
		,$faqBtnMoreArrow = $faqBtnMore.children(".fa")
		,$faqHidden = $faq.filter(":nth-child(n+5)")
		;

	$faqBtnMore.on("click", function(){
		$faqHidden.slideToggle(400);
		$faqBtnMoreArrow.toggleClass("fa-angle-up").toggleClass("fa-angle-down");
	});

// responces slider
	var responces = (function(){
		var obj = {};

		obj.$section = $("#responses");

		obj.$slider = obj.$section.find(".b-slider_responses");

		var  $slideResp = obj.$slider.find(".b-slide_responses")
			,$respFedbBtn = obj.$section.find(".js-btns_category")
			,$responsesBtn = $respFedbBtn.children(".js-btn_responses")
			,$feedbackBtn = $respFedbBtn.children(".js-btn_feedback")
			,$sliderRespControlBtn = obj.$slider.find(".b-slider__control_responses")
			,$sliderRespPrevBtn = obj.$slider.find(".b-slider__controls_responses .b-slider__control_left")
			,$sliderRespNextBtn = obj.$slider.find(".b-slider__controls_responses .b-slider__control_right")
			,$activeSlide = $slideResp.filter(".b-slide_active")
			,$unactiveSlide = $slideResp.filter(":not(.b-slide_active)")
			,$slidesContent = $("#slides").children()	// знаходимо відгуки в прихованому блоці
			,slidesArray = []	// масив з html відгуків
			,responseNum	// зберігає індекс останнього завантаженого відгуку
			,bPrevNext		// чи попередній напрямок запитів "Наступний слайд"
			,widthSlideCss = $activeSlide.outerWidth()	// initial width for desktop
			,widthContainer
			,widthSlide
			,diff	// widthContainer - widthSlide
			,bSmallScr // true on large screens
			;

		obj.slidesInit = function(){
			// initial slides content
			$slidesContent.each(function(index, element){	// заповнюємо масив html відгуків
				slidesArray.push($(element).html())
			});
			
			// наповнимо слайди початковим контенотом
			$slideResp.eq(0).find(".b-slide__side_front .b-slide__wrap").html(slidesArray[1]);			
			$slideResp.eq(1).find(".b-slide__side_front .b-slide__wrap").html(slidesArray[0]);

			responseNum = 1;	// 2й відгук завантажували останнім
			bPrevNext =true;	// порядок завантаження слайдів був прямий

			// active slide initial position
			$window.on("resize", function(){
				activeSlidePosition();
			}).trigger("resize");
		};

		var  
			activeSlidePosition = function(){
				$activeSlide = $slideResp.filter(".b-slide_active");
				$unactiveSlide = $slideResp.filter(":not(.b-slide_active)");
				$unactiveSlide.css("top", "0px");
				$unactiveSlide.css("left", "0px");
				
				widthContainer = obj.$slider.outerWidth();
				widthSlide = $activeSlide.outerWidth();

				if (widthContainer > widthSlideCss){
					if (widthSlide < widthSlideCss){
						$slideResp.css("width", widthSlideCss + "px")
					}
					bSmallScr = false;
					$activeSlide.css("top", "30px");
					diff = widthContainer - widthSlideCss;
					$activeSlide.css("left", diff + "px");
				} else {
					widthSlide = widthContainer;
					$slideResp.css("width", widthContainer + "px")
					bSmallScr = true;
					// diff = 0;
					$activeSlide.css("top", "10px");
					$activeSlide.css("left", "5px");
					$unactiveSlide.css("left", "-5px");
				}
				
			}
			,moveLeft = function($slide, bNext, bSmallScr){	
				$slide.animate({
						top: bSmallScr?9:20,
						left: bSmallScr?40:diff*1.1
					},	{
						duration: bSmallScr?100:200,
						easing: "linear",
						queue: "active",	// черга для анімації цього слайда
						done: function(){
							$(this).css("z-index", "-1")	// приберемо на задній фон
						}
					}
				);
				$slide.animate({
						top: bSmallScr?7:5,
						left: bSmallScr?30:diff*0.99
					},	{
						duration: bSmallScr?100:200,
						easing: "linear",
						queue: "active"	// черга для анімації цього слайда
					}
				);
				$slide.animate({
						top: bSmallScr?5:2,
						left: bSmallScr?15:diff*0.5
					},	{
						duration: bSmallScr?150:300,
						easing: "linear",
						queue: "active",	// черга для анімації цього слайда
						done: function(){
							// завантажимо новий контент слайда
							var $slideContent = $(this).find(".b-slide__side_front .b-slide__wrap");
							$slideContent.fadeOut(100);
							if(bNext){
								if(bPrevNext){
									// перевірка індекса масива перед інкрементом на 1
									if (responseNum == slidesArray.length-1){
										responseNum = 0
									} else {
										++responseNum;
									}
									$slideContent.html(slidesArray[responseNum]);	// відмальовуєм відгук з індексом responseNum
								} else {
									// перевірка індекса масива перед інкрементом на 2
									if (responseNum == slidesArray.length-1){
										responseNum = 1
									} else if (responseNum == slidesArray.length-2){
										responseNum = 0;
									} else {
										responseNum+=2;
									}
									$slideContent.html(slidesArray[responseNum]);
								}
								bPrevNext = true;
							} else {
								if(!bPrevNext){
									// перевірка індекса масива перед декрементом на 1
									if (responseNum == 0){
										responseNum = slidesArray.length - 1
									} else {
										--responseNum;
									}
									$slideContent.html(slidesArray[responseNum]);
								} else {
									// перевірка індекса масива перед декрементом на 2
									if (responseNum == 1){
										responseNum = slidesArray.length - 1
									} else if (responseNum == 0){
										responseNum = slidesArray.length - 2
									} else {
										responseNum-=2;
									}
									$slideContent.html(slidesArray[responseNum]);
								}
								bPrevNext = false;
							}
							
							$slideContent.fadeIn(100).promise().done(function(){
								$(this).css('display', '');
							});
						}
					}
				);
				$slide.animate({
						top: bSmallScr?0:0,
						left: -5
					},	{
						duration: bSmallScr?150:300,
						easing: "linear",
						queue: "active",
						done: function(){
							$slideResp.toggleClass("b-slide_active");
						}
					}
				);
				$slide.dequeue("active");	// запустимо чергу
			}
			,moveRight = function($slide, bSmallScr){
				$slide.animate({
						top: bSmallScr?7:40,
						left: bSmallScr?-40:-diff*0.1
					},	{
						duration: bSmallScr?100:200,
						easing: "linear",
						queue: "unactive",	// черга для анімації цього слайда
						done: function(){
							$(this).css("z-index", "4")
						}
					}
				);
				$slide.animate({
						top: bSmallScr?9:60,
						left: bSmallScr?-30:diff*0.01
					},	{
						duration: bSmallScr?100:200,
						easing: "linear",
						queue: "unactive"	// черга для анімації цього слайда
					}
				);
				$slide.animate({
						top: bSmallScr?10:30,
						left: bSmallScr?5:diff
					},	{
						duration: bSmallScr?300:600,
						easing: "linear",
						queue: "unactive"
					}
				);
				$slide.dequeue("unactive");	// запустимо чергу
			}
			,reshuffle = function($active, $unActive, bNext){
				moveLeft($active, bNext, bSmallScr);
				moveRight($unActive, bSmallScr);
			};

		obj.sliderInit = function(){
			$responsesBtn.click(function(){
				if (!$activeSlide.is(":animated")) {

					if ($activeSlide.hasClass("b-slide_rotated")){
						$feedbackBtn.toggleClass("b-btn_active");
						$responsesBtn.toggleClass("b-btn_active");
					}

					$activeSlide = $slideResp.filter(".b-slide_active");
					$activeSlide.removeClass("b-slide_rotated");	// rotate back if rotated
				}
			});
			$feedbackBtn.click(function(){
				if (!$activeSlide.is(":animated")) {
					$feedbackBtn.toggleClass("b-btn_active");
					$responsesBtn.toggleClass("b-btn_active");
					
					$activeSlide = $slideResp.filter(".b-slide_active");
					$activeSlide.toggleClass("b-slide_rotated");		// rotate back if rotated
				}
			});

			$sliderRespControlBtn.click(function(){
				$activeSlide = $slideResp.filter(".b-slide_active");
				if ($activeSlide.hasClass("b-slide_rotated")){
					$feedbackBtn.trigger("click");
				}
			});
			$sliderRespPrevBtn.click(function(){
				$activeSlide = $slideResp.filter(".b-slide_active");
				$unactiveSlide = $slideResp.filter(":not(.b-slide_active)");
				if(!$activeSlide.is(":animated")){
					reshuffle($activeSlide, $unactiveSlide, false);
				}
			});
			$sliderRespNextBtn.click(function(){
				$activeSlide = $slideResp.filter(".b-slide_active");
				$unactiveSlide = $slideResp.filter(":not(.b-slide_active)");
				if(!$activeSlide.is(":animated")){
					reshuffle($activeSlide, $unactiveSlide, true);
				}
			});
		};

		obj.init = function(){
			obj.slidesInit();	// підвантаження слайдів з прихованого блока
			obj.sliderInit();	// підвантаження слайдів з прихованого блока
		}

		return obj;
	})();

	// rating stars module
	var stars = (function(){
		var obj = {};

		obj.fillStar = function(){	// ф-я для зафарбовування зірочок для кожного контейнера $("РейтингКонтейнер").each(fillStar)
			var  starsNum = $(this).attr("data-rating")	// к-ть зірочок для зафарбування в атрибуті "data-rating" контейнера
				,$stars = $(this).children("span.fa")
				,i
				;
			// 	fa-star-o контур зірочки
			// 	fa-star зафарбований контур зірочки
			for (i=0; i<starsNum; ++i){
				$stars.eq(i).removeClass("fa-star-o").addClass("fa-star");
			}
		};

		obj.fillAllStars = function(sSelector){	// sSelector - селектор контейнера із зрочками
			var $ratings = $(sSelector);	// контейнер із зірочками
				$ratings.each(function(){obj.fillStar.call(this)});	// add context from each f-n
		}

		obj.init = function(){
			obj.fillAllStars(".js-company__rating");
		}

		return obj;
	})();

	//	Додаємо маску на номер телефона в формах
	$("input[type='tel']").mask("+38 (099) 999-99-99");

	// feedback form submission
	$(".js-form_feedback").submit(function(event){
		event.preventDefault();
		// place for Ajax sending
		var data = $(this).serialize();
		$.ajax({
                // type : 'post',
                type : 'get',
                url: './ajax/create-feedback.json',
                data : data,
                cache : false,
                success : function(response){
                    if(response.status == true)
                    {
                        // in a case of Ajax success:
                        $modalOvl.fadeIn();	// show success modal
                        $modalFeedbackSuccess.fadeIn();
                        $(".js-form_feedback input, .js-form_feedback textarea").val('');
                    } 
                    else
                    {
                        $modalOvl.fadeIn();	// show error modal
                        $modalError.fadeIn();
                    }
                },
                error: function(){
                    alert('There is an error!');
                }
            });

		$feedbackBtn.trigger("click");	//розвертаємо слайд
	})


	// modals
	var	 $modalOvl = $(".b-overlay_modal")
		,$modals = $modalOvl.find(".b-modal")
		,$modalError = $modals.filter(".b-modal_error")
		,$modalCloseBtn = $modals.find(".b-modal__btn_close")
		,$modalExitPopup = $modals.filter(".b-modal_exitPopup")
		,$modalCallback = $modals.filter(".b-modal_callback")
		,$modalCallbackSuccess = $modals.filter(".b-modal_callbackSuccess")
		,$modalFeedbackSuccess = $modals.filter(".b-modal_feedbackSuccess")
		,$modalCallbackForm = $modalCallback.find(".js-form_callback")
		;

	var hideModals = function(){	// hide modals function
		$modalOvl.fadeOut();
		$modals.fadeOut();
	}

	$("#callbackBtn, #callbackBtn_footer, .js-btn_callback").click(function(){
		$modalOvl.fadeIn();
		$modalCallback.fadeIn();
	});
	$modals.click(function(event){
		event.stopPropagation()
	})
	$modalCloseBtn.click(hideModals);	// hide modals by close button click
	$modalOvl.click(hideModals);	// hide modals by click on overlay

 //    window.onbeforeunload = function() {
	//     return 'Dont exit';
	// }
	// $window.on('beforeunload', function () {
	//     //вызов попапа
	//     $modalOvl.fadeIn();
	//     $modalExitPopup.fadeIn();
	// });

	// $window.on("unload", function () {
	//     //вызов попапа
	//     $modalOvl.fadeIn();
	//     $modalExitPopup.fadeIn();
	// });

	// window.onbeforeunload = function() {
	//     if(/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())){
	//         return true;
	//     }
	// };

// callback form submission
	$modalCallbackForm.submit(function(event){
            event.preventDefault();
            var data = $(this).serialize();

            $.ajax({
                // type : 'post',
                type : 'get',
                url: './ajax/create-callback.json',
                data : data,
                cache : false,
                success : function(response){
                    if(response.status == true)
                    {
                        // in a case of Ajax success:
                        $modals.fadeOut();	// ховаємо видимі модалки
                        $modalCallbackSuccess.fadeIn();	// show success modal
                        $(".js-form_callback input").val('');
                    } 
                    else
                    {
                    	$modals.fadeOut();	// ховаємо видимі модалки
                        $modalError.fadeIn();	// show error modal
                    }
                },
                error: function(){
                    alert('There is an error!');
                }
            });
	})

	// $modalCallbackForm.submit(function(event){
	// 	event.preventDefault();
	// 	// place for Ajax sending

	// 	// in a case of Ajax success:
	// 	$modals.fadeOut();
	// 	$modalCallbackSuccess.fadeIn();
	// 	// in a case of Ajax error:
	// 	//$modals.fadeOut();
	// 	//$modalError.fadeIn();
	// })
	// scroll to top
	$("#toTop").click(function(){
		// event.preventDefault();
		var  $anchor = $($(this).find(".b-btn_toTop").attr("href"))
			,offsetAnchor = $anchor.offset().top
			;
		$('html, body').animate({ scrollTop: offsetAnchor}, 400);
		return false;
	});


	// adaptive iframe video
	var iframeAspectRatio = (function(){
		var obj = {};
		
		obj.iframesAll = $("iframe");
		
		obj.calcHeight = function($el){
			$(window).on("resize", function(){
				$el.height($el.width() * $el.attr("data-ratio"))
			}).resize();
		};
		
		obj.aspectRatio = function($el, FcallBack){
			// save aspect ratio
			$el.attr("data-ratio", $el.attr('height') / $el.attr('width'))
			// and remove the hard coded width/height
			.removeAttr('height')
			.removeAttr('width');
			if (typeof(FcallBack) == "function"){
				FcallBack(arguments[0]);
			}
		};

		obj.init = function(sSelector){
			obj.iframesAll.filter(sSelector).each(function(){
				var $this = $(this);
				obj.aspectRatio($this, obj.calcHeight);
			});
		}
		
		return obj;
	})();

	// footer module
	var footer = (function(){
		var obj = {};	// module returned object

		// mobile Footer accordion
		obj.$accordionTriggers = $("footer").find(".js-accordion__trigger");
		obj.$accordionContents = $("footer").find(".js-accordion__content");

		obj.mobileAccordion = function() {
			obj.$accordionTriggers.on("click", function(){
				var  $trigger = $(this)
					,$content = $trigger.siblings(".js-accordion__content")
					;
				// close all opened accordion items except of clicked
				obj.$accordionContents.each(function(){
					if (($(this)[0] !== $content[0])&&($(this).parent().hasClass("opened"))){
						$(this).slideUp(200);
						$(this).parent().removeClass("opened");
					}
				});
				$content.slideToggle(200);
				$trigger.parent().toggleClass("opened");
			});
		}

		obj.init = function(){
			obj.mobileAccordion();	// mobile footer accordion functionality
		}

		return obj;	// return object with menu methods and buttons
	})();

	iframeAspectRatio.init(".js-preserveAspectRatio");	// make iframe with desired selector height depending on the aspect ratio (width from css)
	responces.init();	// responses slider init
	footer.init();	// footer module init

	$("#toTop").trigger("click");	// scroll to top after page is loaded

	// popup on site leave
	(function(){
		var $leavePopup = $("#exitPopup");
		var $leaveForm = $(".js-form_exitCallback");
		var $modalOvl = $(".b-overlay_modal");
		var $modalClose = $("#exitPopup .arcticmodal-close, .b-modal_exitCallbackSuccess .arcticmodal-close");
		var $modals = $modalOvl.find(".b-modal");
		var $modalError = $modals.filter(".b-modal_error");
		var $modalExitCallbackSuccess = $(".b-modal_exitCallbackSuccess");
		var exitPopupFirstTimeShow = 15000;
		var exitPopupNextTimeShow = 90000;
		var exitPopupShowFirstTime = false;
		var exitPopupShowNextTime = false;
	
		setTimeout(function(){
			exitPopupShowFirstTime = true;
		}, exitPopupFirstTimeShow);

		$(document).mouseleave(function (e) {
			if ( e.clientY <= 0 && exitPopupShowFirstTime || e.clientY <= 0 && exitPopupShowNextTime ){
				$modalOvl.fadeIn();
				$leavePopup.fadeIn();

				exitPopupShowFirstTime = false;
				exitPopupShowNextTime = false

				setTimeout(function(){
					exitPopupShowNextTime = true;
				}, exitPopupNextTimeShow);
			}
		});

		$modalClose.on('click', function(e){
			e.preventDefault();
			
			$modalOvl.fadeOut();
			$(this).parents('.b-modal').fadeOut;
		})
		// leave form submission
		$leaveForm.submit(function(event){
			event.preventDefault();
			var data = $(this).serialize();

			$.ajax({
					type : 'get',
					url: './ajax/create-callback.json',
					data : data,
					cache : false,
					success : function(response){
							if (response.status == true) {
									// in a case of Ajax success:
									$modals.fadeOut();
									$modalOvl.fadeIn();
									$modalExitCallbackSuccess.fadeIn();
									$leavePopup.remove();
							} else {
								$modals.fadeOut();
								$modalOvl.fadeIn();
								$modalError.fadeIn();	// show error modal
							}
					},
					error: function(){
							alert('There is an error!');
					}
			});
		});

	})();
});