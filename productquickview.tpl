{if $page_name == 'category'}
<aside class="productquickview" data-id-product="{$id_product}"></aside>
<button class="productquickview-button btn">{l s='Qucik View' mod='productquickview'}</button>
{addJsDefL name=resetImagesText}{l s='Show all images' mod='productquickview'}{/addJsDefL}
{addJsDefL name=deliveryTimeText}{l s='Delivery time: ' mod='productquickview'}{/addJsDefL}
{addJsDefL name=addToCartText}{l s='Add to cart' mod='productquickview'}{/addJsDefL}
{addJsDefL name=productDetailsText}{l s='Product details: ' mod='productquickview'}{/addJsDefL}
{addJsDefL name=showMoreText}{l s='Show more' mod='productquickview'}{/addJsDefL}
{/if}