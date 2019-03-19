<?php

require_once(dirname(__FILE__).'../../../config/config.inc.php');
require_once(dirname(__FILE__).'../../../init.php');
require_once(_PS_MODULE_DIR_.'productquickview/classes/QuickView.php');

$product_id = Tools::getValue('id_product');

$context = Context::getContext();
$id_lang = $context->language->id;
$id_shop = $context->shop->id;

$product = new Product($product_id, true, $id_lang, $id_shop);
$product->options = QuickView::getAttributesGroups($product, $id_lang);
$product->price = $product->getPriceStatic($product->id, true);
$product->displayPrice = Tools::displayPrice($product->price);
$product->displayPriceWithoutReduction = QuickView::getPoroductPriceWithoutReduction($product);
$product->features = $product->getFrontFeatures($id_lang);

$images = [];
$images = $product->getImages($id_lang);

foreach ($images as &$image) {

	$image['link'] = $context->link->getImageLink($product->link_rewrite, $image['id_image'], 'large_default');

}
$product->images = $images;
$product->delivery = QuickView::getProductDeliveryTimes($product);
$product->reviews = QuickView::getProductReviews($product->id);
$product->link = $context->link->getProductLink((int)$product->id, $product->link_rewrite, $product->category, $product->ean13);

unset($product->description);
unset($product->description_short);

die(Tools::jsonEncode($product));

