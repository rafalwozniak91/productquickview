$(document).on('click', '.productquickview-button', function() {

	var qucikView = $(this).prev();

	$('.productquickview').removeClass('show');

	if(!qucikView.attr('data-rendered')) {
		
		var id_product = qucikView.attr('data-id-product');
		
		new QuickView(parseInt(id_product), qucikView);	
		
	} else {

		qucikView.addClass('show');
		
	}
});

$(document).on('click', '.qucikproduct-close', function() {

	$(this).parent().removeClass('show');

})

var qucikProducts = [];

var QuickView = function(id_product, el) {

	this.el = el;
	this.id_product = id_product;
	this.selectedCombination = null;
	this.thumbWidth = 80;
	this.thumbMargin = 10;
	this.sliderPosition = 0;

	var width = $('.product_list').width();
	var position = this.el.parent().position();

	this.el.css({
		'width' : width-30,
		'transform': 'translate(-' + position.left + 'px, 0)'
	});

	var _this = this;

	$.ajax({
		type: 'POST',
		url: baseDir + 'modules/productquickview/productquickview-ajax.php',
		data: 'id_product=' + this.id_product,
		dataType: 'json',
		success: function(product) {

			_this.product = product;
			_this.selectedCombination = parseInt(product.id_product_attribute);

			_this.init(product);

		} 
	});

}


QuickView.prototype.init = function(product) {


	var output = '<button class="qucikproduct-close"></button>';

	output += '<div class="row">';
	output += '<figure class="col-md-6 qucikproduct-images">';

	$.each(product.images, function(k, image) {

		if(image.cover == 1) {
			output += '<img  src="' + image.link + '" class="img-responsive big-image"/>';
		}

	});
	output += '<div class="qucikproduct-thumbs">';
	output += '<span class="qucikproduct-thumbs-prev"><i class="icon icon-angle-left"></i></span>';
	output += '<ul class="qucikproduct-thumbs-list">';

	$.each(product.images, function(k, image) {

		output += '<li class="image-thumb image-visible" data-id-image="' + image.id_image + '"><img  src="' + image.link + '" class="img-responsive" alt="' + image.legend + '"/></li>';

	});
	output += '</ul>';
	output += '<span class="qucikproduct-thumbs-next"><i class="icon icon-angle-right"></i></span>';
	output += '</div>';

	output += '<span class="btn btn-link qucikproduct-reset-button">' + resetImagesText + '</span>';

	output += '</figure>';

	output += '<article class="col-md-6 qucikproduct-description">';
	output += '<p class="qucikproduct-name">' + product.name +'</p>';

	if(product.reviews) {

		if(product.reviews.avg != null) {

			var avg = parseFloat(product.reviews.avg).toFixed(0);

			output += '<div class="qucikproduct-reviews clearfix">';

			for(var i=1; i<=5; i++) {
				output += '<div class="star' + (i <= avg ? " star_on" : "") + '"></div>';
			}

			output += '</div>';
		}
	}

	output += '<div class="qucikproduct-price-block">';
	output += '<span class="qucikproduct-price'+ (product.displayPriceWithoutReduction ? " on-sale" : "") + '">' + product.displayPrice +'</span>';

	if(product.displayPriceWithoutReduction) {
		output += '<span class="qucikproduct-price qucikproduct-pricewithoutreduction">' + product.displayPriceWithoutReduction +'</span>';
	}

	output += '</div>';
	output += '<label class="group_name">' + deliveryTimeText + '</label>';
	output += '<p class="qucikproduct-deliverytime'+ (product.delivery.label ?  " " + product.delivery.label : "") + '">' + product.delivery.name + '</p>';


	if(product.options.groups){

		output += '<div class="qucikproduct-attributes">';

		$.each(product.options.groups, function(id_group, group){

			if(group.group_type == 'color') {

				output += '<fieldset class="qucikproduct-group group_'+ group.group_type + '">';
				output += '<label class="group_name">'+group.name+'</label>';

				output += '<ul class="colors_picker">';
				$.each(group.attributes, function(id, name){

					output += '<li class="picker_color' + ( id == group.default ? ' selected' : '') + '" data-id-attribute="' + id + '"><img src="/img/co/'+ id +'.jpg" width="30" height="30" /></li>';


				});
				output += '</ul>';
				output += '</fieldset>';
			}

		});

		$.each(product.options.groups, function(id_group, group){	

			if(group.group_type == 'select') {
				output += '<fieldset class="qucikproduct-group group_'+ group.group_type + '">';
				output += '<label class="group_name">'+group.name+'</label>';
				output += '<select class="select_picker form-control">';
				$.each(group.attributes, function(id, name){

					output += '<option class="select"' + ( id == group.default ? ' selected' : '') + ' name="select_' + id_group +'" value="' + id + '">' + name + '</option>';


				});
				output += '</select>';
			}

			if(group.group_type == 'radio') {
				output += '<fieldset class="qucikproduct-group group_'+ group.group_type + '">';
				output += '<label class="group_name">'+group.name+'</label>';
				output += '<ul class="radio_picker">';

				$.each(group.attributes, function(id, name){

					output += '<li class="radio-container"><input type="radio" name="radio_'+ id_group +'" id="radio_' + id + '" value="' + id + '"' + ( id == group.default ? ' checked' : '') + '/><span class="radio"></span><label for="radio_' + id + '">' + name + '</label></li>';


				});
				output += '</ul>';
			}
			output += '</fieldset>';

		});


		output += '</div>';
	}

	if(product.features) {

		output += '<div class="qucikproduct-features table-responsive">';
		output += '<h4 class="qucikproduct-features-title">' + productDetailsText + '</h4>';
		output += '<table class="table table-hover">';

		var features = this.getFeaturesGroup();

		$.each(features, function(k, feature) {

			output += '<tr>';

			output += '<td>' + feature.name + '</td>';
			output += '<td>' + feature.value + '</td>';

			output += '</tr>';

		});	

		output += '</table>';
		output += '</div>';

	}
	output += '<a href="'+ product.link +'" class="btn btn-info">' + showMoreText +  '</a>';
	output += '<button class="btn btn-default qucikproduct-cart-btn pull-right">' + addToCartText +  '</button>';

	output += '</article>';

	output += '</div>';

	this.el.html(output).addClass('show');
	this.el.attr('data-rendered','1');

	this.addToCart();

	var thumbsListWidth = (this.thumbWidth+this.thumbMargin)*(this.product.images.length);
	this.el.find('.qucikproduct-thumbs-list').css('width', thumbsListWidth + 'px');

	this.toggleImages();
	this.resetImages();
	this.imagesSlider();

	return this.toggleCombinations();
};


QuickView.prototype.toggleCombinations = function() {

	var _this = this;

	this.el.find('.picker_color').on('click', function(){

		$(this).parent().find('.picker_color').removeClass('selected');

		$(this).addClass('selected');

		_this.getSelectedCombination()

	});
	this.el.find('.group_radio input').on('change', function(){
		_this.getSelectedCombination()
	});
	this.el.find('.select_picker').on('change', function(){
		_this.getSelectedCombination()
	});

	this.el.attr('data-rendered',1);
};

QuickView.prototype.toggleImages = function() {

	var _this = this;

	this.el.find('.image-visible').on('click', function() {

		var src = $(this).find('img').attr('src');

		_this.el.find('.big-image').attr('src', src);

	});

};

QuickView.prototype.addToCart = function() {

	var _this = this;

	this.el.find('.qucikproduct-cart-btn').on('click', function(e) {
		e.preventDefault();
		ajaxCart.add(_this.id_product, _this.selectedCombination, false, null, 1);

	});
};

QuickView.prototype.getSelectedCombination = function() {

	var attributes = [];
	var _this = this;

	var radio_inputs = this.el.find('.group_radio input:checked').length;

	if(radio_inputs) {

		this.el.find('.group_radio input:checked').each(function(){
			var id_attribute = $(this).val();
			attributes.push(parseInt(id_attribute));
		});
	}

	var select_inputs = this.el.find('.select_picker option:selected').length;

	if(select_inputs) {

		this.el.find('.select_picker option:selected').each(function(){

			var id_attribute = $(this).val();
			attributes.push(parseInt(id_attribute));

		});
	}

	var colors = this.el.find('.picker_color.selected').length;

	if(colors) {

		this.el.find('.picker_color.selected').each(function(){

			var id_attribute = $(this).attr('data-id-attribute');
			attributes.push(parseInt(id_attribute));

		});

	}

	$.each(this.product.options.combinations, function(id_combination, combination) {

		var combinationMatched = true;

		$.each(combination.attributes, function(k, id_attribute) {

			if (!in_array(parseInt(id_attribute), attributes))
				combinationMatched = false;	

		});

		if(combinationMatched) {
			_this.selectedCombination = id_combination;
			_this.getCombinationImages(id_combination);
			_this.el.find('.qucikproduct-price').text(combination.displayPrice);

			if(combination.displayPriceWithoutReduction) {
				_this.el.find('.qucikproduct-pricewithoutreduction').text(combination.displayPriceWithoutReduction);
			}

			if(combination.delivery){

				_this.el.find('.qucikproduct-deliverytime').removeClass(function (index, className) {
					return (className.match (/\blabel_\d*/g) || []).join(' ');
				}).text(combination.delivery.name);

				if(combination.delivery.label) {

					_this.el.find('.qucikproduct-deliverytime').addClass(combination.delivery.label);

				}


			}

		}

	});

	return _this.selectedCombination;

};

QuickView.prototype.getCombinationImages = function(id_combination) {

	var combinationImages = this.product.options.combinationImages[id_combination];

	var images = [];
	var _this = $(this);

	$.each(combinationImages, function(k, image) {

		images.push(image.id_image);

	});

	this.el.find('.image-thumb').each(function() {

		var id_image = $(this).attr('data-id-image');

		if (!in_array(parseInt(id_image), images)){
			$(this).removeClass('image-visible');
		} else {

			if(!$(this).hasClass('image-visible')) {
				$(this).addClass('image-visible');
			}
		}

	});

	var visibleImagesLenght = this.el.find('.image-thumb.image-visible').length;

	var thumbsListWidth = (this.thumbWidth+this.thumbMargin)*visibleImagesLenght;

	this.el.find('.qucikproduct-thumbs-list').css('width', thumbsListWidth + 'px');

	var image = this.getImageById(images[0]);

	this.el.find('.big-image').attr('src', image.link);

	if(combinationImages.length < this.product.images.length) {
		this.el.find('.qucikproduct-reset-button').addClass('reset-active');
	}

	this.imagesSliderNavigation();

};


QuickView.prototype.getImageById = function(id_image) {

	var image;

	$.each(this.product.images, function(k, img) {

		if(img.id_image == id_image)
			image = img;

	});

	return image;

};


QuickView.prototype.getFeaturesGroup = function() {

	var features_gorups = [];

	var features = [];

	var _this = this;

	$.each(this.product.features, function(k, feature) {

		if(!in_array(parseInt(feature.id_feature), features_gorups)) {

			features_gorups.push(feature.id_feature);
			features.push({
				'id_feature': feature.id_feature,
				'name': feature.name,
				'value': _this.getFeaturesValueById(feature.id_feature),
			})

		}



	});

	return features;
};


QuickView.prototype.getFeaturesValueById = function(id_feature) {

	var features = [];

	$.each(this.product.features, function(k, feature) {

		if(parseInt(feature.id_feature) == parseInt(id_feature)) {
			features.push(feature.value);
		}

	});

	return features.join(', ')

};


QuickView.prototype.resetImages = function() {

	var _this = this;

	this.el.find('.qucikproduct-reset-button').on('click', function() {

		_this.el.find('.image-thumb').each(function() {

			if(!$(this).hasClass('image-visible')) {
				$(this).addClass('image-visible');
			}

		});
		var thumbsListWidth = (_this.thumbWidth+_this.thumbMargin)*(_this.product.images.length);
		_this.el.find('.qucikproduct-thumbs-list').css('width', thumbsListWidth + 'px');
		_this.el.find('.reset-active').removeClass('reset-active');
		_this.imagesSliderNavigation();

	});
};

QuickView.prototype.imagesSliderNavigation = function() {

	this.sliderPosition = 0;
	var sliderContainerWidth = this.el.find('.qucikproduct-images').width();
	var images_length = this.el.find('.image-visible').length;
	var sliderImagesWidth = (this.thumbWidth+this.thumbMargin)*parseInt(images_length);

	if(this.sliderPosition > 0) {
		this.el.find('.qucikproduct-thumbs-prev').addClass('active')
	} else {
		this.el.find('.qucikproduct-thumbs-prev').removeClass('active')
	}

	if(parseInt(sliderImagesWidth) > parseInt(sliderContainerWidth)) {
		this.el.find('.qucikproduct-thumbs-next').addClass('active')
	} else {
		this.el.find('.qucikproduct-thumbs-next').removeClass('active')
	}


	this.el.find('.qucikproduct-thumbs-list').css({
		'transform': 'translate(-' + this.sliderPosition + 'px, 0)'
	});
};

QuickView.prototype.imagesSlider = function() {

	var _this = this;

	this.el.find('.big-image').load(function(){

		_this.imagesSliderNavigation();

		_this.el.find('.qucikproduct-thumbs-prev').on('click', function() {

			_this.sliderPosition -= _this.thumbWidth+_this.thumbMargin;
			var sliderContainerWidth = _this.el.find('.qucikproduct-images').width();
			var sliderImagesWidth = (_this.thumbWidth+_this.thumbMargin)*_this.product.images.length

			if(_this.sliderPosition > 0) {
				_this.el.find('.qucikproduct-thumbs-prev').addClass('active');
			} else {
				_this.el.find('.qucikproduct-thumbs-prev').removeClass('active');
			}

			if(parseInt(sliderImagesWidth) > parseInt(sliderContainerWidth)) {
				_this.el.find('.qucikproduct-thumbs-next').addClass('active');
			} else {
				_this.el.find('.qucikproduct-thumbs-next').removeClass('active');
			}

			_this.el.find('.qucikproduct-thumbs-list').css({
				'transform': 'translate(-' + _this.sliderPosition + 'px, 0)'
			});

			console.log(_this.sliderPosition)
		});

		_this.el.find('.qucikproduct-thumbs-next.active').on('click', function() {

			var sliderContainerWidth = _this.el.find('.qucikproduct-images').width();
			var sliderImagesWidth = (_this.thumbWidth+_this.thumbMargin)*_this.product.images.length;

			if(((_this.sliderPosition-_this.thumbWidth+_this.thumbMargin)+parseInt(sliderContainerWidth)) < sliderImagesWidth) {
				_this.sliderPosition += _this.thumbWidth+_this.thumbMargin;
			}

			if(((_this.sliderPosition-_this.thumbWidth+_this.thumbMargin)+parseInt(sliderContainerWidth)) < sliderImagesWidth) {

				_this.el.find('.qucikproduct-thumbs-list').css({
					'transform': 'translate(-' + _this.sliderPosition + 'px, 0)'
				});
				if(((_this.sliderPosition)+parseInt(sliderContainerWidth)) >= sliderImagesWidth) {
					_this.el.find('.qucikproduct-thumbs-next').removeClass('active');
				}

			} else {
				_this.el.find('.qucikproduct-thumbs-next').removeClass('active');
			}

			if(_this.sliderPosition > 0) {
				_this.el.find('.qucikproduct-thumbs-prev').addClass('active');
			} else {
				_this.el.find('.qucikproduct-thumbs-prev').removeClass('active');
			}

		});

	});
	return true;
};