import { render } from "preact";
import "./product-page.css";
import { useEffect, useState } from "preact/hooks";

import { ProductPageSkeleton } from "@components/loading-skeleton/loading-skeleton";
import { useAddProductToCart } from "@services/cart";
import { getProduct, useProduct } from "@services/products";
import { CommerceQueryProvider } from "@services/query-client";
import { WishlistButton } from "@components/wishlist-button/wishlist-button";
import { setProductSchema } from "@utils/structured-data";
import { setPageMetadata } from "@utils/metadata";
import { recordProductView } from "@services/recommendations";

function ProductMediaCarousel({ name, initials, primaryImage, images }: { name: string; initials: string; primaryImage?: string; images: string[] }) {
  const gallery = [...new Set([primaryImage, ...images].filter((image): image is string => Boolean(image)))];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex];
  const hasMultipleImages = gallery.length > 1;
  const showPrevious = () => setActiveIndex((activeIndex - 1 + gallery.length) % gallery.length);
  const showNext = () => setActiveIndex((activeIndex + 1) % gallery.length);

  return <div class="product-gallery" aria-label={`${name} product images`}>
    <div class="product-detail-media">
      <span>{initials}</span>
      {activeImage ? <img src={activeImage} alt={`${name}${hasMultipleImages ? `, image ${activeIndex + 1} of ${gallery.length}` : ""}`} loading="eager" fetchPriority="high" /> : null}
      {hasMultipleImages ? <div class="product-gallery-controls"><button type="button" aria-label="Previous product image" onClick={showPrevious}>‹</button><span aria-live="polite">{activeIndex + 1} / {gallery.length}</span><button type="button" aria-label="Next product image" onClick={showNext}>›</button></div> : null}
    </div>
    {hasMultipleImages ? <div class="product-gallery-thumbnails" aria-label="Choose product image">{gallery.map((image, index) => <button type="button" class={index === activeIndex ? "selected" : ""} aria-label={`Show image ${index + 1} of ${gallery.length}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} key={image}><img src={image} alt="" loading={index === 0 ? "eager" : "lazy"} /></button>)}</div> : null}
  </div>;
}

function ProductPage({ id }: { id: string }) {
  const { data: product, error, isPending } = useProduct(id);
  const addMutation = useAddProductToCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  useEffect(() => { if (product) {
    setProductSchema(product);
    setPageMetadata({ title: `${product.name} | EDS Market`, description: product.description, canonicalUrl: `/products/${encodeURIComponent(product.sku)}`, image: product.image || product.images[0], type: "product" });
    recordProductView(product.sku);
  } }, [product]);

  if (isPending) return <div class="skeleton-loading" role="status" aria-label="Loading product"><ProductPageSkeleton /></div>;
  if (error || !product) return <div class="catalog-empty"><h1>Product not found</h1>{error ? <p>{error.message}</p> : null}<a href="/products">Return to products</a></div>;
  const currentProduct = product;

  const selectedIds = Object.values(selections);
  const selectedVariant = product.variants?.find((variant) => selectedIds.length === product.options?.length && selectedIds.every((id) => variant.selections.includes(id)));
  const requiredOptionsSelected = product.options?.every((option) => !option.required || Boolean(selections[option.id])) ?? true;
  const allOptionsSelected = product.options?.every((option) => Boolean(selections[option.id])) ?? true;
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayImage = selectedVariant?.image ?? product.image;
  const displaySku = selectedVariant?.sku ?? product.sku;
  const available = selectedVariant?.inStock ?? product.inStock;
  const canAddToCart = available && requiredOptionsSelected && (!product.options?.length || (allOptionsSelected && Boolean(selectedVariant)));
  const initials = product.name.split(" ").map((word) => word[0]).slice(0, 2).join("");

  async function addToCart() {
    if (!canAddToCart || addMutation.isPending) return;
    try {
      await addMutation.mutateAsync({ product: { ...currentProduct, sku: displaySku, price: displayPrice, image: displayImage, inStock: available }, quantity });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch { /* The mutation error is exposed in the live status region. */ }
  }

  return <div class="product-detail-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/products">Products</a><span>›</span><span>{product.name}</span></nav>
    <div class="product-detail-layout">
      <ProductMediaCarousel key={displayImage || product.sku} name={product.name} initials={initials} primaryImage={displayImage} images={product.images} />
      <div class="product-detail-info">
        <p class="page-eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <div class="product-detail-meta"><span>SKU {displaySku}</span>{product.rating ? <span>★ {product.rating.toFixed(1)}</span> : null}</div>
        <p class="product-detail-description">{product.description}</p>
        <strong class="product-detail-price">${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
        {product.options?.length ? <div class="product-options">{product.options.map((option) => <label key={option.id}><span>{option.title}{option.required ? " *" : ""}</span><select value={selections[option.id] || ""} required={option.required} onChange={(event) => setSelections((current) => ({ ...current, [option.id]: event.currentTarget.value }))}><option value="">Choose {option.title.toLowerCase()}</option>{option.values.map((value) => <option key={value.id} value={value.id} disabled={!value.inStock}>{value.title}{value.inStock ? "" : " — unavailable"}</option>)}</select></label>)}</div> : null}
        <p class={`stock-status ${available ? "in-stock" : "out-of-stock"}`}>{available ? "In stock and ready to ship" : "Currently unavailable"}</p>
        <div class="product-actions"><label><span>Quantity</span><select value={quantity} disabled={addMutation.isPending} onChange={(event) => setQuantity(Number(event.currentTarget.value))}><option>1</option><option>2</option><option>3</option></select></label><sp-button size="l" aria-busy={addMutation.isPending} disabled={!canAddToCart || addMutation.isPending} onClick={addToCart}>{addMutation.isPending ? "Adding…" : added ? "Added to cart" : canAddToCart ? "Add to cart" : "Select options"}</sp-button></div>
        <WishlistButton product={product} />
        <div class={`add-confirmation ${added || addMutation.error ? "visible" : ""} ${addMutation.error ? "error" : ""}`} role="status" aria-live="polite">{addMutation.error?.message || `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`}</div>
        <div class="product-benefits"><div><strong>Free delivery</strong><span>On qualifying local orders</span></div><div><strong>Easy returns</strong><span>30-day return window</span></div></div>
      </div>
    </div>
  </div>;
}

export default async function decorate(block: HTMLElement) {
  const id = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).at(-1) || "");
  block.dataset.blockLoadingUi = "true";
  render(<div class="skeleton-loading" role="status" aria-label="Loading product"><ProductPageSkeleton /></div>, block);
  await getProduct(id).catch(() => undefined);
  render(<CommerceQueryProvider><ProductPage id={id} /></CommerceQueryProvider>, block);
  delete block.dataset.blockLoadingUi;
}
