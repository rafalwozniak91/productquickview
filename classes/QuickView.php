<?php

class QuickView extends ObjectModel
{

    public static function getAttributesGroups($product, $id_lang)
    {
        $colors = [];
        $groups = [];
        $combinations = false;
        $combinationsColors = false;

        $attributes_groups = $product->getAttributesGroups($id_lang);
        $combination_images = $product->getCombinationImages($id_lang);

        if (is_array($attributes_groups) && $attributes_groups) {
            $combination_prices_set = array();
            foreach ($attributes_groups as $k => $row) {
                // Color management
                if (isset($row['is_color_group']) && $row['is_color_group'] && (isset($row['attribute_color']) && $row['attribute_color']) || (file_exists(_PS_COL_IMG_DIR_.$row['id_attribute'].'.jpg'))) {
                    $colors[$row['id_attribute']]['value'] = $row['attribute_color'];
                    $colors[$row['id_attribute']]['name'] = $row['attribute_name'];
                    if (!isset($colors[$row['id_attribute']]['attributes_quantity'])) {
                        $colors[$row['id_attribute']]['attributes_quantity'] = 0;
                    }
                    $colors[$row['id_attribute']]['attributes_quantity'] += (int)$row['quantity'];
                }
                if (!isset($groups[$row['id_attribute_group']])) {
                    $groups[$row['id_attribute_group']] = array(
                        'group_name' => $row['group_name'],
                        'name' => $row['public_group_name'],
                        'group_type' => $row['group_type'],
                        'default' => -1,
                    );
                }

                $groups[$row['id_attribute_group']]['attributes'][$row['id_attribute']] = $row['attribute_name'];
                if ($row['default_on'] && $groups[$row['id_attribute_group']]['default'] == -1) {
                    $groups[$row['id_attribute_group']]['default'] = (int)$row['id_attribute'];
                }
                if (!isset($groups[$row['id_attribute_group']]['attributes_quantity'][$row['id_attribute']])) {
                    $groups[$row['id_attribute_group']]['attributes_quantity'][$row['id_attribute']] = 0;
                }
                $groups[$row['id_attribute_group']]['attributes_quantity'][$row['id_attribute']] += (int)$row['quantity'];

                $combinations[$row['id_product_attribute']]['attributes_values'][$row['id_attribute_group']] = $row['attribute_name'];
                $combinations[$row['id_product_attribute']]['attributes'][] = (int)$row['id_attribute'];
                $combinations[$row['id_product_attribute']]['price'] = (float)Tools::convertPriceFull($row['price'], null, Context::getContext()->currency, false);
                $combinations[$row['id_product_attribute']]['displayPrice'] = Tools::displayPrice(Product::getPriceStatic((int)$product->id, true, $row['id_product_attribute']));

                // Call getPriceStatic in order to set $combination_specific_price
                if (!isset($combination_prices_set[(int)$row['id_product_attribute']])) {
                	$specific_price = Product::getPriceStatic((int)$product->id, true, $row['id_product_attribute'], 6, null, false, false, 1, false, null, null, null, $combination_specific_price);
                    $combinations[$row['id_product_attribute']]['displayPriceWithoutReduction'] = $combination_specific_price ? Tools::displayPrice($specific_price) : false;

                    $combination_prices_set[(int)$row['id_product_attribute']] = true;
                    $combinations[$row['id_product_attribute']]['specific_price'] = $combination_specific_price;
                }
                //$combinations[$row['id_product_attribute']]['ecotax'] = (float)$row['ecotax'];
                //$combinations[$row['id_product_attribute']]['weight'] = (float)$row['weight'];
                $combinations[$row['id_product_attribute']]['quantity'] = (int)$row['quantity'];
                $combinations[$row['id_product_attribute']]['reference'] = $row['reference'];
                $combinations[$row['id_product_attribute']]['unit_impact'] = Tools::convertPriceFull($row['unit_price_impact'], null, Context::getContext()->currency, false);
                $combinations[$row['id_product_attribute']]['minimal_quantity'] = $row['minimal_quantity'];
                if ($row['available_date'] != '0000-00-00' && Validate::isDate($row['available_date'])) {
                    $combinations[$row['id_product_attribute']]['available_date'] = $row['available_date'];
                    $combinations[$row['id_product_attribute']]['date_formatted'] = Tools::displayDate($row['available_date']);
                } else {
                    $combinations[$row['id_product_attribute']]['available_date'] = $combinations[$row['id_product_attribute']]['date_formatted'] = '';
                }

                if (!isset($combination_images[$row['id_product_attribute']][0]['id_image'])) {
                    $combinations[$row['id_product_attribute']]['id_image'] = -1;
                } else {
                    $combinations[$row['id_product_attribute']]['id_image'] = $id_image = (int)$combination_images[$row['id_product_attribute']][0]['id_image'];
                    if ($row['default_on']) {

                        if ($id_image > 0) {

                            if (isset($product_images) && is_array($product_images) && isset($product_images[$id_image])) {
                                $product_images[$id_image]['cover'] = 1;
                            }
                            if (isset($cover) && is_array($cover) && isset($product_images) && is_array($product_images)) {
                                $product_images[$cover['id_image']]['cover'] = 0;
                                if (isset($product_images[$id_image])) {
                                    $cover = $product_images[$id_image];
                                }
                                $cover['id_image'] = (Configuration::get('PS_LEGACY_IMAGES') ? ($product->id.'-'.$id_image) : (int)$id_image);
                                $cover['id_image_only'] = (int)$id_image;
                            }
                        }
                    }
                }
            
            if (Module::isInstalled('productdeliverytabs')) {

                require_once(_PS_MODULE_DIR_.'productdeliverytabs/productdeliverytabs.php');

                $productdeliveryTabs = new Productdeliverytabs();

                if(!$id_supplier = $productdeliveryTabs->getIdSupplierByIdProductAttribute($row['id_product_attribute'])) {
                    $id_supplier = $product->id_supplier;
                }

                $supplier = new Supplier($id_supplier, Context::getContext()->language->id);

                $combinations[$row['id_product_attribute']]['delivery'] = [
                        'id_supplier' => (int)$id_supplier,
                        'name' => $supplier->name,
                        'label' => $productdeliveryTabs->getLabelByIdSupplier($id_supplier) ? 'label_'.$id_supplier : false,
                        'color' => $productdeliveryTabs->getLabelColorByIdSupplier($id_supplier),

                ]; 


            } else {

                $combinations[$row['id_product_attribute']]['delivery'] = false;

            }

            }

            // wash attributes list (if some attributes are unavailables and if allowed to wash it)
            if (!Product::isAvailableWhenOutOfStock($product->out_of_stock) && Configuration::get('PS_DISP_UNAVAILABLE_ATTR') == 0) {
                foreach ($groups as &$group) {
                    foreach ($group['attributes_quantity'] as $key => &$quantity) {
                        if ($quantity <= 0) {
                            unset($group['attributes'][$key]);
                        }
                    }
                }

                foreach ($colors as $key => $color) {
                    if ($color['attributes_quantity'] <= 0) {
                        unset($colors[$key]);
                    }
                }
            }
            foreach ($combinations as $product->id_attribute => $comb) {
                $attribute_list = '';
                foreach ($comb['attributes'] as $id_attribute) {
                    $attribute_list .= '\''.(int)$id_attribute.'\',';
                }
                $attribute_list = rtrim($attribute_list, ',');
                $combinations[$product->id_attribute]['list'] = $attribute_list;
            }
        }

        return array(
            'groups' => count($groups) ? $groups : false,
            'colors' => count($colors) ? $colors : false,
            'combinations' => $combinations,
            'combinationImages' => $combination_images
        );
    }

    public static function getProductDeliveryTimes($product) {

        $id_lang = (int)Context::getContext()->language->id;

        if (Module::isInstalled('productdeliverytabs') && Module::isEnabled('productdeliverytabs')) {

            require_once(_PS_MODULE_DIR_.'productdeliverytabs/productdeliverytabs.php');
            $productdeliveryTabs = new Productdeliverytabs();

            $id_supplier = $product->id_supplier;

            if(isset($product->id_attribute)){
                $id_supplier = $productdeliveryTabs->getIdSupplierByIdProductAttribute($product->id_attribute) ? $productdeliveryTabs->getIdSupplierByIdProductAttribute($product->id_attribute) : $id_supplier;
            } 
            
            $supplier = new Supplier($id_supplier, $id_lang);

            return [
                    'name' => $supplier->name,
                    'label' => $productdeliveryTabs->getLabelByIdSupplier($id_supplier) ? 'label_'.$id_supplier : false,
                    'color' => $productdeliveryTabs->getLabelColorByIdSupplier($id_supplier),

            ]; 

        } else {
        
                $supplier = new Supplier($product->id_supplier, $id_lang);

                return [
                        'name' => $supplier->name,
                        'label' => false,
                        'color' => false,
                ];
        }

    }

    public static function getProductReviews($id_product) {

        if (Module::isInstalled('productcomments') && Module::isEnabled('productcomments')) {

            require_once(_PS_MODULE_DIR_.'productcomments/ProductComment.php');

            return ProductComment::getRatings((int)$id_product);

        } else {

            return false;
        }
    }

    public static function getPoroductPriceWithoutReduction($product) {

        $priceWithoutReduction = false;

        if($product->specificPrice) {

            if($product->specificPrice['reduction_type'] == "percentage") {

                $priceWithoutReduction = $product->price+$product->specificPrice['reduction']*$product->price;

            } else {

                $priceWithoutReduction = $product->price+$product->specificPrice['reduction'];
            }


        }

        return Tools::displayPrice($priceWithoutReduction);
    }

}
