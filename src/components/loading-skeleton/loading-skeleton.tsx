type LineProps = { class?: string };

export function SkeletonLine({ class: className = "" }: LineProps) {
  return <span class={`skeleton-block skeleton-line ${className}`} aria-hidden="true" />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return <div class="product-grid skeleton-product-grid" aria-hidden="true">{Array.from({ length: count }, (_, index) => <article class="skeleton-product-card" key={index}><span class="skeleton-block skeleton-product-image" /><SkeletonLine class="short" /><SkeletonLine class="title" /><SkeletonLine /><SkeletonLine class="price" /></article>)}</div>;
}

export function ProductPageSkeleton() {
  return <div class="product-detail-page skeleton-product-page" aria-hidden="true"><SkeletonLine class="breadcrumb" /><div class="product-detail-layout"><span class="skeleton-block skeleton-product-hero" /><div class="skeleton-product-info"><SkeletonLine class="short" /><SkeletonLine class="heading" /><SkeletonLine class="meta" /><SkeletonLine /><SkeletonLine /><SkeletonLine class="medium" /><SkeletonLine class="price-large" /><span class="skeleton-block skeleton-action" /></div></div></div>;
}

export function CartPageSkeleton() {
  return <div class="cart-page-content skeleton-cart-page" aria-hidden="true"><header class="cart-page-heading"><div><SkeletonLine class="short" /><SkeletonLine class="heading" /></div><SkeletonLine class="short" /></header><div class="cart-page-layout"><section class="skeleton-cart-items">{[0, 1, 2].map((index) => <div class="skeleton-cart-item" key={index}><span class="skeleton-block skeleton-cart-image" /><div><SkeletonLine class="title" /><SkeletonLine class="medium" /><SkeletonLine class="short" /></div></div>)}</section><aside class="order-summary skeleton-summary"><SkeletonLine class="title" /><SkeletonLine /><SkeletonLine /><SkeletonLine /><SkeletonLine class="price-large" /><span class="skeleton-block skeleton-action" /></aside></div></div>;
}
