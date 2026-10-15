import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, ShieldCheck, Check, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart,
}) => {
  const { addToCart, cart, toggleSavedProduct, isProductSaved } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!product) return null;

  const cartItem = cart.find((i) => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    setErrorMessage('');
    const result = addToCart(product, quantity);
    if (result.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } else {
      setErrorMessage(result.error || 'Could not add to cart.');
    }
  };

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Top Control Buttons: Heart & Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => toggleSavedProduct(product.id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shadow-md active:scale-90 ${
              isProductSaved(product.id)
                ? 'bg-white text-rose-600 ring-2 ring-rose-500/40'
                : 'bg-stone-900/40 hover:bg-stone-900/60 text-white backdrop-blur-xs'
            }`}
            aria-label={isProductSaved(product.id) ? 'Remove from Saved for Later' : 'Save for Later'}
            title={isProductSaved(product.id) ? 'Remove from Saved for Later' : 'Save for Later'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isProductSaved(product.id) ? 'fill-rose-600 stroke-rose-600 scale-110' : 'stroke-current'
              }`}
            />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-900/40 hover:bg-stone-900/60 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Media Column */}
          <div className="relative aspect-square md:aspect-auto bg-stone-100 flex items-center justify-center overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // High-fidelity SVG / gradient fallback
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23701A1E"/><text x="200" y="200" fill="%23FDE68A" font-size="20" font-family="serif" text-anchor="middle">Mantralaya Arts</text></svg>';
              }}
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 bg-amber-500 text-stone-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                Temple Special
              </span>
            )}
          </div>

          {/* Product Details Column */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="font-semibold text-amber-800 tracking-wider uppercase text-[11px]">
                  {product.category}
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-medium ${
                    isOutOfStock
                      ? 'text-rose-600'
                      : product.stockQuantity < 10
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {isOutOfStock
                    ? 'Out of Stock'
                    : product.stockQuantity < 10
                    ? `Only ${product.stockQuantity} left`
                    : `${product.stockQuantity} in stock`}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-cinzel leading-tight mb-3">
                {product.name}
              </h2>

              {/* Price in ₹ */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold text-[#701A1E] font-mono tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500">Inclusive of all temple taxes</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Specifications */}
              <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/60 mb-5">
                {product.material && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Material:</span>
                    <span className="font-medium">{product.material}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dimensions:</span>
                    <span className="font-medium">{product.dimensions}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Approx. Weight:</span>
                    <span className="font-medium">{product.weight}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Sanctification:</span>
                  <span className="font-medium text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Traditional agamic finish
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Module */}
            <div>
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* In-cart status indicator */}
              {inCartQty > 0 && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#701A1E]" />
                    <span>In Your Bag: <strong>{inCartQty} units</strong> (₹{(product.price * inCartQty).toLocaleString('en-IN')})</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCart();
                    }}
                    className="text-[#701A1E] font-bold underline hover:text-[#581216] cursor-pointer"
                  >
                    View Bag
                  </button>
                </div>
              )}

              {addedSuccess ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Added {quantity} to Bag!</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCart();
                    }}
                    className="py-3 px-4 rounded-xl bg-[#701A1E] text-amber-200 font-medium text-xs hover:bg-[#581216] transition cursor-pointer"
                  >
                    View Bag
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isOutOfStock || quantity <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-900 font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        disabled={isOutOfStock || quantity >= product.stockQuantity}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Bag Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="flex-1 h-11 rounded-xl bg-[#701A1E] hover:bg-[#581216] disabled:bg-stone-300 disabled:text-stone-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-300" />
                      <span>
                        {isOutOfStock
                          ? 'Out of Stock'
                          : inCartQty > 0
                          ? `Add ${quantity} More • ₹${(product.price * quantity).toLocaleString('en-IN')}`
                          : `Add to Bag • ₹${(product.price * quantity).toLocaleString('en-IN')}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
