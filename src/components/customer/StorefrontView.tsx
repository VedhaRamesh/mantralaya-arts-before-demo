import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Check,
  ChevronRight,
  Flame,
  Crown,
  Gift,
  Lamp,
  Boxes,
  Package,
  Plus,
  Minus,
  Heart,
} from 'lucide-react';

interface StorefrontViewProps {
  onOpenCart: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({ onOpenCart }) => {
  const {
    products,
    categories,
    addToCart,
    cart,
    updateCartQuantity,
    cartItemCount,
    cartTotal,
    savedProductIds,
    toggleSavedProduct,
    isProductSaved,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Saved for Later filter
      if (selectedCategory === 'SAVED_FOR_LATER') {
        if (!savedProductIds.includes(p.id)) return false;
      }
      // In Bag filter
      else if (selectedCategory === 'IN_BAG') {
        const isInBag = cart.some((c) => c.product.id === p.id && c.quantity > 0);
        if (!isInBag) return false;
      } else if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (p.status === 'INACTIVE') {
        return false;
      }
      if (stockOnly && (p.status === 'OUT_OF_STOCK' || p.stockQuantity <= 0)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesCat;
      }
      return true;
    });
  }, [products, selectedCategory, stockOnly, searchQuery, cart]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result.success) {
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1200);
    }
  };

  const handleIncrement = (e: React.MouseEvent, product: Product, currentQty: number) => {
    e.stopPropagation();
    if (currentQty < product.stockQuantity) {
      updateCartQuantity(product.id, currentQty + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent, productId: string, currentQty: number) => {
    e.stopPropagation();
    if (currentQty > 1) {
      updateCartQuantity(productId, currentQty - 1);
    } else {
      updateCartQuantity(productId, 0);
    }
  };

  // Get icon for category
  const renderCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'pooja-essentials':
        return <Flame className="w-3.5 h-3.5" />;
      case 'deity-idols':
        return <Crown className="w-3.5 h-3.5" />;
      case 'temple-gift-items':
        return <Gift className="w-3.5 h-3.5" />;
      case 'brass-and-copper-items':
        return <Lamp className="w-3.5 h-3.5" />;
      case 'festive-gift-collections':
        return <Boxes className="w-3.5 h-3.5" />;
      case 'return-gifts':
        return <Package className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32">
      {/* Devotional Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#581216] via-[#701A1E] to-[#400B0E] text-amber-50 px-4 py-8 sm:py-12 border-b border-amber-600/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDE68A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sanctified Temple Collections</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-cinzel text-amber-100 tracking-wide leading-tight">
              Devotion, Pure &amp; Handcrafted
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-amber-200/80 leading-relaxed max-w-lg">
              Explore authentic pooja essentials, heritage brass deepams, sanctified idols, and memorable return gifts from Mantralaya Arts.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-amber-400/20 text-center">
              <p className="text-[11px] text-amber-200/80 uppercase tracking-widest font-bold">Free Temple Packing</p>
              <p className="text-sm font-semibold text-white">Safe pan-India doorstep delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Search & Stock Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brass lamps, pooja items, return gifts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#701A1E] focus:border-transparent shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Availability Toggle Button */}
          <button
            onClick={() => setStockOnly(!stockOnly)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer shrink-0 ${
              stockOnly
                ? 'bg-amber-100 text-[#701A1E] border-amber-400 font-bold'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{stockOnly ? 'Showing In-Stock Only' : 'Filter: In Stock Only'}</span>
          </button>
        </div>

        {/* Categories Multi-Row Wrapping Navigation Pills (No Horizontal Scroll Barrier) */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* All Collections Tab */}
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#701A1E] text-white shadow-xs font-semibold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>All Collections</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'ALL' ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-100 text-stone-500'
              }`}>
                {products.length}
              </span>
            </button>

            {/* In Bag Quick Filter Tab (Active when items are in cart) */}
            {cartItemCount > 0 && (
              <button
                onClick={() => setSelectedCategory('IN_BAG')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 animate-in fade-in ${
                  selectedCategory === 'IN_BAG'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-bold ring-2 ring-amber-600/40'
                    : 'bg-amber-100 text-amber-950 border border-amber-400 hover:bg-amber-200 font-bold'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#701A1E]" />
                <span>In Bag</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#701A1E] text-amber-200 font-bold font-mono">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </button>
            )}

            {/* Saved for Later Quick Filter Tab (Active when items are saved) */}
            {savedProductIds.length > 0 && (
              <button
                onClick={() => setSelectedCategory('SAVED_FOR_LATER')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 animate-in fade-in ${
                  selectedCategory === 'SAVED_FOR_LATER'
                    ? 'bg-rose-700 text-white shadow-sm font-bold ring-2 ring-rose-500/40'
                    : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 font-bold'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
                <span>Saved for Later</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  selectedCategory === 'SAVED_FOR_LATER' ? 'bg-white text-rose-800' : 'bg-rose-200 text-rose-900'
                }`}>
                  {savedProductIds.length}
                </span>
              </button>
            )}

            {/* Standard Category Tabs */}
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.name && p.status !== 'INACTIVE').length;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#701A1E] text-white shadow-xs font-semibold'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {renderCategoryIcon(cat.slug)}
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-4 px-1">
          <p>
            Showing <strong className="text-stone-900">{filteredProducts.length}</strong> items
            {selectedCategory === 'SAVED_FOR_LATER' ? (
              <span> saved in <strong className="text-rose-700">Saved for Later</strong></span>
            ) : selectedCategory === 'IN_BAG' ? (
              <span> currently in <strong className="text-[#701A1E]">Your Devotional Bag</strong></span>
            ) : selectedCategory !== 'ALL' ? (
              <span> in <strong className="text-[#701A1E]">{selectedCategory}</strong></span>
            ) : null}
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center my-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
              {selectedCategory === 'SAVED_FOR_LATER' ? (
                <Heart className="w-6 h-6 text-rose-600 fill-rose-100" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-stone-900 font-cinzel">
              {selectedCategory === 'IN_BAG'
                ? 'Your Bag is Empty'
                : selectedCategory === 'SAVED_FOR_LATER'
                ? 'No Items Saved for Later'
                : 'No Products Found'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {selectedCategory === 'IN_BAG'
                ? 'You have not added any sacred items to your bag yet. Browse all collections and tap "Add".'
                : selectedCategory === 'SAVED_FOR_LATER'
                ? 'You have not saved any devotional items yet. Tap the heart icon on any idol, lamp, or pooja essential to save it for later.'
                : "We couldn't find items matching your filters. Try clearing the search query or switching categories."}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
                setStockOnly(false);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#701A1E] text-white text-xs font-medium hover:bg-[#581216] transition cursor-pointer"
            >
              Browse All Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;
              const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;
              const isRecentlyAdded = addedProductId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => setActiveProduct(product)}
                  className={`group bg-white rounded-2xl sm:rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    inCartQty > 0
                      ? 'border-amber-400 shadow-sm ring-1 ring-amber-400/40 bg-amber-50/15'
                      : 'border-stone-200/80 hover:border-amber-300'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23701A1E"/><text x="200" y="150" fill="%23FDE68A" font-size="16" font-family="serif" text-anchor="middle">Mantralaya Arts</text></svg>';
                      }}
                    />

                    {/* Featured Badge */}
                    {product.isFeatured && (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500 text-stone-950 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs z-10">
                        Featured
                      </span>
                    )}

                    {/* Heart Icon Button Toggle for Saved for Later */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavedProduct(product.id);
                      }}
                      aria-label={isProductSaved(product.id) ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`}
                      title={isProductSaved(product.id) ? 'Remove from Saved for Later' : 'Save for Later'}
                      className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-90 ${
                        isProductSaved(product.id)
                          ? 'bg-white text-rose-600 scale-105 ring-2 ring-rose-500/40'
                          : 'bg-white/90 hover:bg-white text-stone-500 hover:text-rose-600 hover:scale-105 backdrop-blur-xs'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isProductSaved(product.id) ? 'fill-rose-600 stroke-rose-600 scale-110' : 'stroke-current'
                        }`}
                      />
                    </button>

                    {/* Persistent In-Bag Badge (Positioned at bottom-2.5 right-2.5 so it never collides with Heart toggle) */}
                    {inCartQty > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 z-10 bg-[#701A1E] text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-amber-400/40 backdrop-blur-xs animate-in fade-in">
                        <ShoppingBag className="w-3 h-3 text-amber-300" />
                        <span>{inCartQty} in Bag</span>
                      </span>
                    )}

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-15">
                        <span className="text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-rose-600/90">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Body */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Metadata line */}
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1.5">
                        <span className="truncate uppercase tracking-wider text-[10px] font-semibold text-amber-800">
                          {product.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={product.stockQuantity < 10 ? 'text-amber-700 font-medium' : 'text-stone-400'}>
                          {isOutOfStock ? '0 left' : `${product.stockQuantity} left`}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#701A1E] transition">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price and CTA Row with Persistent Stepper when Added */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base font-extrabold text-[#701A1E] font-mono tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Interactive Add Button / Quantity Stepper */}
                      {inCartQty > 0 ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center rounded-xl bg-[#701A1E] text-amber-50 shadow-sm p-0.5 border border-amber-500/40 animate-in fade-in"
                        >
                          <button
                            onClick={(e) => handleDecrement(e, product.id, inCartQty)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-amber-200 hover:text-white hover:bg-black/20 transition active:scale-90 cursor-pointer"
                            title="Decrease quantity or remove from bag"
                            aria-label={`Decrease quantity of ${product.name}`}
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-6 sm:w-7 text-center font-bold text-xs sm:text-sm font-mono text-amber-100">
                            {inCartQty}
                          </span>
                          <button
                            onClick={(e) => handleIncrement(e, product, inCartQty)}
                            disabled={inCartQty >= product.stockQuantity}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-amber-200 hover:text-white hover:bg-black/20 disabled:opacity-30 disabled:pointer-events-none transition active:scale-90 cursor-pointer"
                            title={inCartQty >= product.stockQuantity ? 'Maximum available stock reached' : 'Add one more to bag'}
                            aria-label={`Increase quantity of ${product.name}`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          disabled={isOutOfStock}
                          className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl font-semibold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                            isRecentlyAdded
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isOutOfStock
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-amber-100 hover:bg-[#701A1E] text-[#701A1E] hover:text-white border border-amber-300/60'
                          }`}
                          title="Add to bag"
                        >
                          {isRecentlyAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Sticky Bag Banner (Always visible on storefront whenever cart has items) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg md:max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-5 duration-200">
          <div
            onClick={onOpenCart}
            className="bg-gradient-to-r from-[#581216] via-[#701A1E] to-[#581216] text-amber-50 p-3 sm:p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400/50 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-300 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 relative">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your Bag
                </p>
                <p className="text-[11px] text-amber-200/80 font-mono">
                  Total: <strong className="text-amber-300 text-xs sm:text-sm">₹{cartTotal.toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCart();
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition cursor-pointer"
            >
              <span>View Bag</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onOpenCart={onOpenCart}
        />
      )}
    </div>
  );
};
