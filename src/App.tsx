/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect } from 'react';
import { 
  Menu, 
  ShoppingCart, 
  Plus, 
  Phone, 
  Instagram, 
  MapPin, 
  ChevronRight,
  Info,
  ReceiptText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  cartId: string;
  product: Product;
  addOns: string[];
  totalPrice: number;
  quantity: number;
}

const ADD_ONS: AddOn[] = [
  { id: 'walnuts', name: 'אגוזי מלך', price: 0 },
  { id: 'olives', name: 'זיתי קלמטה', price: 0 },
  { id: 'cranberries', name: 'חמוציות', price: 0 },
  { id: 'seeds', name: 'גרעיני דלעת וחמניה', price: 0 },
];

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "מחמצת כוסמין קלאסית",
    description: "100% קמח כוסמין",
    price: 30,
    category: "כוסמין",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRZBdzHp5_sKQosw5NBJE3p_435uZSTYuxSdAkRjLOvbD5BOwO5ekHemAJhV6f-ucqcKgir1bipAOfWOYsX6Ib7A99OTBDYGOc_daTtHoqp8WSchFh0W0pshDjSXrCbvDCpNe6c6ryxA8_02bXhXeE9UpYXCQrJ009XiT_aG3e5lilQmf7sR-E3LufkVTQbqZhe_7N00HnoN8VtGN65Hy3ZWU8N6z-x6mKo7DKJWpnBdHbjN7TfFLQDVO_JWM2jzYbWqP4b5yjaHZT"
  },
  {
    id: 2,
    name: "מחמצת חיטה מלאה",
    description: "100% קמח חיטה מלאה",
    price: 30,
    category: "חיטה מלאה",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDZDeaSdtPFUHb9aCEtqdX7R2wNs_N-xKkv3ZDafQxZEuRtkPCTOfUtbY42xeVsaOXuRo6SWZpYJG5Eitkh0fwnXQFKcGVnrNG-yPEbYeJCI1X9QcCHx8_vp24PV-J-BsfICVibQsuilU2hd5YlzeD8r67Kuis2qnCas2gGem_ZC6YT4r8rsLXPswq-gdmJmH8B2boXqka7t6PGTHiP8zTQh6jadhzKM69IUZKWAAorxr8MaB9ydOA7r32tSRqVMGsZrOazLz_xpgT"
  },
  {
    id: 3,
    name: "מחמצת מתערובת קמחים ללא גלוטן",
    description: "תערובת קמחי מקור איכותיים ללא גלוטן בתהליך מחמצת טבעי וארוך.",
    price: 38,
    category: "ללא גלוטן",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrOVPYhP1aLXeCx2a2w61NcENELCcnZUyHxSC_XNrEPByG0htPg315bhSxAmpLI7Hj_flIkz-e71w25Wu6BUQVRRfm0YcSOwWxXSAGsrzCy71kJnEMVAmX-a6Bf2uK921zosmtszAYmxHVjab8PhrtFKBgo7iATbH8Q5oT4OSIDBK8KiFrN4K3QSapcP0Q4lZTU9qZ0BzvzDAFenK7BD1_dsI3l3T8Sdt0606ccPdfLUaAKVka2CikCnTImhFxNGDR2NfM-FtTYC2h"
  }
];

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (Math.abs(currentScrollY - lastScrollY) < 10) return;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlHeader);
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  const filteredProducts = PRODUCTS;

  const handleAddToCart = (product: Product, addOns: string[] = []) => {
    const addOnsTotal = addOns.length > 0 ? 5 : 0;
    const itemPrice = product.price + addOnsTotal;

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        JSON.stringify([...item.addOns].sort()) === JSON.stringify([...addOns].sort())
      );

      if (existingItemIndex > -1) {
        const newItems = [...prev];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
          totalPrice: newItems[existingItemIndex].totalPrice + itemPrice
        };
        return newItems;
      }

      const newItem: CartItem = {
        cartId: Math.random().toString(36).substr(2, 9),
        product,
        addOns,
        totalPrice: itemPrice,
        quantity: 1
      };
      return [...prev, newItem];
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openCustomization = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedAddOns([]);
    setEditingCartId(null);
  };

  const openEditCartItem = (item: CartItem) => {
    setCustomizingProduct(item.product);
    setSelectedAddOns(item.addOns);
    setEditingCartId(item.cartId);
    setShowCart(false);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const confirmCustomization = () => {
    if (customizingProduct) {
      const addOnsTotal = selectedAddOns.length > 0 ? 5 : 0;
      const itemPrice = customizingProduct.price + addOnsTotal;

      if (editingCartId) {
        setCartItems(prev => prev.map(item => 
          item.cartId === editingCartId 
            ? { ...item, addOns: selectedAddOns, totalPrice: itemPrice * item.quantity }
            : item
        ));
        setShowCart(true);
      } else {
        handleAddToCart(customizingProduct, selectedAddOns);
      }
      setCustomizingProduct(null);
      setEditingCartId(null);
    }
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        const unitPrice = item.totalPrice / item.quantity;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const calculateTotalPrice = () => {
    if (!customizingProduct) return 0;
    const addOnsTotal = selectedAddOns.length > 0 ? 5 : 0;
    return customizingProduct.price + addOnsTotal;
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const sendOrderWhatsApp = () => {
    const orderDetails = cartItems.map(item => {
      const addOnsText = item.addOns.length > 0 
        ? ` (תוספות: ${item.addOns.map(id => ADD_ONS.find(a => a.id === id)?.name).join(', ')})`
        : '';
      const quantityText = item.quantity > 1 ? ` x${item.quantity}` : '';
      return `- ${item.product.name}${addOnsText}${quantityText}: ₪${item.totalPrice}`;
    }).join('\n');

    const total = getCartTotal();
    const message = `היי, אשמח להזמין:\n${orderDetails}\n\nסה"כ לתשלום: ₪${total}\nתודה!`;
    window.open(`https://wa.me/972555567714?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans" dir="rtl">
      {/* Side Navigation Menu */}
      <AnimatePresence>
        {showNav && (
          <div className="fixed inset-0 z-[150] flex justify-start">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNav(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="relative w-full max-w-[280px] bg-background-light dark:bg-background-dark h-full shadow-2xl flex flex-col border-l border-primary/10"
            >
              <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white dark:bg-black/20">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">תפריט</h3>
                <button 
                  onClick={() => setShowNav(false)}
                  className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <nav className="flex-1 p-8 space-y-6">
                {[
                  { id: 'about', label: 'הסיפור שלנו' },
                  { id: 'menu', label: 'התפריט שלנו' },
                  { id: 'contact', label: 'צור קשר' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      setShowNav(false);
                    }}
                    className="block w-full text-right text-xl font-serif italic hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-8 border-t border-primary/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sabrosa Artisan Bakery
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] glass px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-primary/20"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">התווסף לסל בהצלחה!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-background-light dark:bg-background-dark h-full shadow-2xl flex flex-col border-r border-primary/10"
            >
              <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white dark:bg-black/20">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic">הסל שלי</h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{getCartItemsCount()} פריטים</p>
                </div>
                <button 
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <ShoppingCart className="w-16 h-16 mb-4" />
                    <p className="font-serif italic text-xl">הסל שלך ריק</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cartItems.map((item) => (
                      <motion.div 
                        layout
                        key={item.cartId}
                        className="flex gap-6 group"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-primary/5">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif text-xl leading-tight">{item.product.name}</h4>
                              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-2 py-1">
                                <button onClick={() => updateQuantity(item.cartId, -1)} className="text-primary hover:bg-primary/10 rounded p-1"><Plus className="w-3 h-3 rotate-45" /></button>
                                <span className="text-xs font-black">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.cartId, 1)} className="text-primary hover:bg-primary/10 rounded p-1"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                            {item.addOns.length > 0 && (
                              <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-2 opacity-70">
                                {item.addOns.map(id => ADD_ONS.find(a => a.id === id)?.name).join(' • ')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-4 mt-4">
                            <button 
                              onClick={() => openEditCartItem(item)}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                            >
                              עריכה
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.cartId)}
                              className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                              הסרה
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-8 border-t border-primary/10 bg-white dark:bg-black/20">
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">סה"כ לתשלום</span>
                      <span className="text-4xl font-serif italic font-black text-primary">₪{getCartTotal()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-8 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ReceiptText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">תשלום ב-Bit או Paybox</span>
                  </div>
                  <button 
                    onClick={sendOrderWhatsApp}
                    className="w-full bg-primary text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    שלח בוואצאפ <span className="opacity-50">|</span> ₪{getCartTotal()}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customization Modal */}
      <AnimatePresence>
        {customizingProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-background-light dark:bg-background-dark rounded-[3rem] overflow-hidden shadow-2xl border border-primary/10"
            >
              <div className="relative h-64 w-full">
                <img src={customizingProduct.image} alt={customizingProduct.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button 
                  onClick={() => setCustomizingProduct(null)}
                  className="absolute top-6 right-6 p-3 glass rounded-2xl hover:scale-110 transition-all"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
                <div className="absolute bottom-8 right-8 text-white">
                  <h3 className="text-4xl font-serif italic font-black">{customizingProduct.name}</h3>
                  <p className="text-white/70 mt-2">{customizingProduct.description}</p>
                </div>
              </div>

              <div className="p-10">
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-serif italic font-black">תוספות מיוחדות</h4>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                      <Info className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">5 ₪ לכל כמות תוספות</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ADD_ONS.map((addon) => (
                      <button 
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`group flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all ${
                          selectedAddOns.includes(addon.id)
                            ? "border-primary bg-primary/5 shadow-inner"
                            : "border-slate-200 dark:border-slate-800 hover:border-primary/30 bg-white dark:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedAddOns.includes(addon.id) ? "bg-primary border-primary scale-110" : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {selectedAddOns.includes(addon.id) && <Plus className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-bold text-sm tracking-tight">{addon.name}</span>
                        </div>
                        <span className={`text-xs font-black ${selectedAddOns.includes(addon.id) ? "text-primary" : "text-slate-400"}`}>
                          {selectedAddOns.length > 0 && selectedAddOns.includes(addon.id) 
                            ? `₪${(5 / selectedAddOns.length).toFixed(1)}` 
                            : selectedAddOns.length === 0 ? "₪5" : "₪0"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white dark:bg-black/20 border-t border-primary/10 flex items-center justify-between gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">סה"כ</span>
                  <span className="text-3xl font-serif italic font-black text-primary">₪{calculateTotalPrice()}</span>
                </div>
                <button 
                  onClick={confirmCustomization}
                  className="flex-1 bg-primary text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
                >
                  {editingCartId ? 'עדכן הזמנה' : 'הוסף לסל'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 glass px-6 py-5 flex items-center justify-between border-b border-primary/5 transition-transform duration-500 ease-in-out ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNav(true)}
            className="p-2 hover:bg-primary/5 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Sabrosa</h1>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary mt-1">Artisan Bakery</span>
        </div>
        <div className="w-10" /> {/* Spacer to balance the layout since cart is now floating */}
      </header>

      {/* Floating Cart Button */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setShowCart(true)}
          className="relative p-5 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all group"
        >
          <ShoppingCart className="w-7 h-7" />
          <AnimatePresence>
            {getCartItemsCount() > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary text-xs font-black shadow-xl border-2 border-primary"
              >
                {getCartItemsCount()}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Tooltip-like label */}
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-primary dark:text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-primary/10">
            הסל שלי: ₪{getCartTotal()}
          </span>
        </button>
      </div>

      <main className="flex-1 pb-12 pt-24">
        {/* Featured Image */}
        <div className="px-6 py-8">
          <div className="relative h-[30rem] w-full overflow-hidden rounded-[3rem] shadow-2xl">
            <img 
              alt="Artisan Bread" 
              className="h-full w-full object-cover scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGozF64yDtA_fja7KBZ1-FLEehg6jIRZj3F7_IDma9Mfr9OV9Rn2nUGtJ_y3UVBOejoIlPX74JCqluyIE-8KFLiawCHwNalhwtWnUV2OtRCEqDy_LqR4DduwHAbpVLXxgDz-Exnlq24YSlXVje7ymPX-5ahrVlF0pynY1kZiYLU6q8nYViMNBLbVbVApwPjO0h2Gn4lpKpvFR3tTPUpNnVq8VYufjH_QyjhNlg8RqvIoAI4zGn7Kpz0eRpzPYQs8dpkWYYpez1dMHq"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-12 right-12 text-white text-right">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-12 bg-white/50" />
                <span className="text-[10px] font-black uppercase tracking-widest">המומלץ שלנו</span>
              </div>
              <h3 className="text-5xl font-serif italic font-black">מחמצת כוסמין</h3>
              <p className="text-white/70 max-w-xs mt-2">התפחה איטית של 24 שעות לקבלת מרקם מושלם וטעם עמוק.</p>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <section id="about" className="px-6 py-16 bg-primary/5 my-12 rounded-[3rem] mx-6">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-serif italic font-black mb-8">הסיפור שלנו</h3>
            <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
              <p>
                הכל התחיל מרצון אמיתי ללחם טוב, כזה שנעשה בלי פשרות ובלי רגשות אשם, רצינו ליצור לחם שעונה על הצרכים של כולם – תערובת קמחים ללא גלוטן, כוסמין עשיר או חיטה מלאה.
              </p>
              <p>
                המחמצת שלנו עוברת תסיסה איטית ומבוקרת של 24 שעות להעמקת הטעמים והמרקם, המחמצת נאפית במיוחד עבורכם בעבודת יד, אנחנו משתמשים אך ורק בקמחי מקור איכותיים ובמחמצת ביתית טבעית, בלי קיצורי דרך ובלי שמרים תעשייתיים, בדיוק כמו שלחם אמיתי צריך להיות.
              </p>
            </div>
            <div className="mt-10 flex justify-center gap-4">
              <div className="h-[1px] w-12 bg-primary/20 self-center" />
              <span className="font-serif italic font-bold text-primary">Sabrosa</span>
              <div className="h-[1px] w-12 bg-primary/20 self-center" />
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <div id="menu" className="px-6 mb-12">
          <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-4">
            <h3 className="text-2xl font-serif italic font-black">התפריט שלנו</h3>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={product.id}
                className="group flex flex-col bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-primary/5 hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={product.image}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 glass px-4 py-2 rounded-2xl">
                    <span className="text-primary font-black text-lg">₪{product.price}</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/5 rounded-md">{product.category}</span>
                    </div>
                    <h4 className="text-2xl font-serif italic font-black mb-3 group-hover:text-primary transition-colors">{product.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{product.description}</p>
                    {product.category === "ללא גלוטן" && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-[10px] text-red-500 font-bold leading-tight">
                          שימו לב: אנחנו עושים כל מה שאפשר על מנת להפריד, אך המטבח אינו סטרילי מגלוטן.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/10"
                    >
                      הוסף לסל
                    </button>
                    <button 
                      onClick={() => openCustomization(product)}
                      className="p-4 border-2 border-primary/20 text-primary rounded-2xl hover:bg-primary/5 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Us Section */}
        <section id="contact" className="px-6 py-16 border-t border-primary/10 mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-4xl font-serif italic font-black mb-6">צרו קשר</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">נשמח לשמוע מכם! בין אם זו הזמנה מיוחדת, שאלה על המחמצת שלנו או סתם להגיד שלום.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">טלפון</p>
                      <p className="font-bold">055-5567714</p>
                    </div>
                  </div>
                  
                  <a 
                    href="https://instagram.com/liavbakery" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group hover:opacity-80 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">אינסטגרם</p>
                      <p className="font-bold">@liavbakery</p>
                    </div>
                  </a>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <ReceiptText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">אפשרויות תשלום</p>
                        <p className="font-bold">Bit / Paybox</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">מיקום</p>
                        <p className="font-bold">מושב קדרון</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mr-16">
                      <a 
                        href="https://waze.com/ul?ll=31.8219,34.8291&navigate=yes" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all"
                      >
                        Waze
                      </a>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=מושב+קדרון" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all"
                      >
                        Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-10 rounded-[3rem] border-2 border-primary/10">
                <h4 className="text-2xl font-serif italic font-black mb-6">שעות פעילות</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-primary/5">
                    <span className="font-bold">ימי חמישי</span>
                    <span className="text-primary font-black">16:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-primary/5">
                    <span className="font-bold">ימי שישי</span>
                    <span className="text-primary font-black">08:00 - 14:00</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                    * מומלץ להזמין מראש באמצע השבוע
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 bg-white dark:bg-black/20 text-center border-t border-primary/5">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-2">Sabrosa</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8">Artisan Bakery</p>
        <p className="text-xs text-slate-400 font-medium tracking-wide">© 2024 Sabrosa Artisan Bakery. כל הזכויות שמורות.</p>
      </footer>
    </div>
  );
}
