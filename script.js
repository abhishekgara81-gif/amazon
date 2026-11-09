// =============================================================================
// Amazon.in Clone - Full Interactive Application Script
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Element Selectors
    // -------------------------------------------------------------------------
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const navCartBtn = document.getElementById('nav-cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountBadge = document.querySelector('.cart-count');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartEmptyState = document.getElementById('cart-empty');

    const searchInput = document.querySelector('.search-input');
    const searchSelect = document.querySelector('.search-select');
    const searchBtn = document.querySelector('.search-icon');

    const locationBtn = document.getElementById('nav-address-btn');
    const locationModal = document.getElementById('location-modal');
    const locationOverlay = document.getElementById('location-modal-overlay');
    const closeLocationModalBtn = document.getElementById('close-location-modal');
    const pincodeInput = document.getElementById('pincode-input');
    const applyPincodeBtn = document.getElementById('apply-pincode-btn');
    const citySelect = document.getElementById('city-select');
    const currentLocationText = document.getElementById('current-location-text');

    const heroPrevBtn = document.getElementById('hero-prev');
    const heroNextBtn = document.getElementById('hero-next');
    const heroSection = document.querySelector('.hero-section');

    // Product Quick View Modal
    const productModal = document.getElementById('product-modal');
    const productOverlay = document.getElementById('product-modal-overlay');
    const closeProductModalBtn = document.getElementById('close-product-modal');
    const quickviewImg = document.getElementById('quickview-img');
    const quickviewTitle = document.getElementById('quickview-title');
    const quickviewPrice = document.getElementById('quickview-price');
    const quickviewMrp = document.getElementById('quickview-mrp');
    const quickviewAddCartBtn = document.getElementById('quickview-add-cart-btn');
    const quickviewBuyNowBtn = document.getElementById('quickview-buy-now-btn');

    // Category Deals Modal (When clicking "See all offers")
    const dealsModal = document.getElementById('deals-modal');
    const dealsOverlay = document.getElementById('deals-modal-overlay');
    const closeDealsModalBtn = document.getElementById('close-deals-modal');
    const dealsModalTitle = document.getElementById('deals-modal-title');
    const dealsModalItems = document.getElementById('deals-modal-items');

    // Checkout Modal
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutOverlay = document.getElementById('checkout-modal-overlay');
    const closeCheckoutBtn = document.getElementById('close-checkout-modal');
    const checkoutItemsSubtotal = document.getElementById('checkout-items-subtotal');
    const checkoutOrderTotal = document.getElementById('checkout-order-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const checkoutContent = document.getElementById('checkout-content');
    const checkoutSuccess = document.getElementById('checkout-success');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const orderIdBadge = document.getElementById('order-id-badge');
    const checkoutSuccessMsg = document.getElementById('checkout-success-msg');
    const checkoutEtaDisplay = document.getElementById('checkout-eta-display');
    const viewOrdersSuccessBtn = document.getElementById('view-orders-success-btn');

    // Your Orders Modal & Badge Selectors
    const navOrdersBtn = document.getElementById('nav-orders-btn');
    const navOrdersCount = document.getElementById('nav-orders-count');
    const ordersModal = document.getElementById('orders-modal');
    const ordersOverlay = document.getElementById('orders-modal-overlay');
    const closeOrdersModalBtn = document.getElementById('close-orders-modal');
    const ordersModalBody = document.getElementById('orders-modal-body');
    const ordersCountBadge = document.getElementById('orders-count-badge');
    const ordersTabs = document.querySelectorAll('.orders-tab');
    const clearOrdersBtn = document.getElementById('clear-orders-btn');

    // Orders state loaded from localStorage
    let orders = [];
    try {
        const savedOrders = localStorage.getItem('amazon_orders');
        if (savedOrders) orders = JSON.parse(savedOrders);
    } catch (e) {
        orders = [];
    }
    let currentOrdersTab = 'all';

    const toastContainer = document.getElementById('toast-container');
    const allCards = document.querySelectorAll('.boxx');
    const promoBoxes = document.querySelectorAll('.box');

    let currentModalItem = null;

    // -------------------------------------------------------------------------
    // Helper: Safely extract clean relative image URL from any element or style
    // -------------------------------------------------------------------------
    function extractCleanImageUrl(element) {
        if (!element) return 'amazon pic/11.jpg';
        let bg = '';
        if (typeof element === 'string') {
            bg = element;
        } else {
            bg = window.getComputedStyle(element).backgroundImage || '';
        }

        if (!bg || bg === 'none') {
            return 'amazon pic/11.jpg';
        }

        // Clean url("...")
        const m = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (m && m[1]) {
            let url = decodeURIComponent(m[1]);
            const idx = url.indexOf('amazon pic/');
            if (idx !== -1) {
                return url.slice(idx);
            }
            return url.replace(/['"]/g, '');
        }

        return bg.replace(/url\(['"]?|['"]?\)/g, '').replace(/['"]/g, '').trim() || 'amazon pic/11.jpg';
    }

    // -------------------------------------------------------------------------
    // 2. Cart Management with LocalStorage
    // -------------------------------------------------------------------------
    let cart = [];
    try {
        const saved = localStorage.getItem('amazon_clone_cart');
        if (saved) {
            cart = JSON.parse(saved);
            // Sanitize existing items to make sure their image paths are clean
            cart.forEach(item => {
                item.image = extractCleanImageUrl(item.image);
            });
        }
    } catch (e) {
        cart = [];
    }

    function saveCart() {
        try {
            localStorage.setItem('amazon_clone_cart', JSON.stringify(cart));
        } catch (e) {}
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

        if (!cartEmptyState || !cartItemsContainer || !cartSubtotalEl) return;

        if (cart.length === 0) {
            cartEmptyState.style.display = 'block';
            cartItemsContainer.style.display = 'none';
            cartSubtotalEl.textContent = '₹0.00';
            return;
        }

        cartEmptyState.style.display = 'none';
        cartItemsContainer.style.display = 'block';

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map((item, idx) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const imgSrc = extractCleanImageUrl(item.image);
            return `
                <div class="cart-item" data-index="${idx}">
                    <img src="${imgSrc}" alt="${item.title}" class="cart-item-img" onerror="this.src='amazon pic/11.jpg';">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</p>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="changeQty(${idx}, -1)" aria-label="Decrease quantity">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${idx}, 1)" aria-label="Increase quantity">+</button>
                            <button class="cart-item-remove" onclick="removeItem(${idx})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}.00`;
        updateAllCardBadges();
        updateDealsModalButtonStates();
    }

    window.changeQty = function(index, delta) {
        if (!cart[index]) return;
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
            showToast('Item removed from cart');
        }
        saveCart();
        updateCartUI();
    };

    window.removeItem = function(index) {
        if (!cart[index]) return;
        const name = cart[index].title;
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
        showToast(`Removed "${name}" from cart`);
    };

    function getItemQuantity(title) {
        if (!title) return 0;
        const clean = title.trim().toLowerCase();
        const item = cart.find(i => {
            const it = i.title.trim().toLowerCase();
            return it === clean || it.includes(clean) || clean.includes(it);
        });
        return item ? item.quantity : 0;
    }
    window.getItemQuantity = getItemQuantity;

    function updateAllCardBadges() {
        allCards.forEach(card => {
            const piccItems = card.querySelectorAll('.picc');
            const spanEls = card.querySelectorAll('.text span');

            piccItems.forEach((picc, i) => {
                const caption = spanEls[i] ? spanEls[i].textContent.trim() : '';
                if (!caption) return;
                const qty = getItemQuantity(caption);
                let badge = picc.querySelector('.picc-qty-badge');

                if (qty > 0) {
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.className = 'picc-qty-badge';
                        picc.appendChild(badge);
                    }
                    badge.innerHTML = `<i class="fa-solid fa-check"></i> ${qty}`;
                } else {
                    if (badge) badge.remove();
                }
            });
        });
    }

    function updateDealsModalButtonStates() {
        if (!dealsModalItems) return;
        const cards = dealsModalItems.querySelectorAll('.deal-card');
        cards.forEach(card => {
            const title = card.getAttribute('data-title');
            if (!title) return;
            const qty = getItemQuantity(title);
            const btn = card.querySelector('.deal-card-add-btn');
            let badge = card.querySelector('.deal-card-qty-badge');

            if (qty > 0) {
                if (btn) {
                    btn.classList.add('is-added');
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Added (${qty})`;
                }
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'deal-card-qty-badge';
                    card.prepend(badge);
                }
                badge.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${qty} in Cart`;
            } else {
                if (btn) {
                    btn.classList.remove('is-added');
                    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to Cart`;
                }
                if (badge) badge.remove();
            }
        });
    }

    function updateQuickViewButtonState() {
        if (!quickviewAddCartBtn || !currentModalItem) return;
        const qty = getItemQuantity(currentModalItem.title);
        if (qty > 0) {
            quickviewAddCartBtn.classList.add('is-added');
            quickviewAddCartBtn.innerHTML = `<i class="fa-solid fa-check"></i> Added (${qty}) - Add More`;
        } else {
            quickviewAddCartBtn.classList.remove('is-added');
            quickviewAddCartBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to Cart`;
        }
    }

    function addToCart(title, price, imagePath, buttonEl) {
        const cleanImg = extractCleanImageUrl(imagePath);
        const cleanTitle = (title || 'Amazon Product').trim();
        const existing = cart.find(item => item.title === cleanTitle || item.title === cleanTitle.slice(0, 52));
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                title: cleanTitle.slice(0, 52),
                price: price || 499,
                image: cleanImg,
                quantity: 1
            });
        }
        saveCart();
        updateCartUI();
        showToast(`Added to cart: ${cleanTitle.slice(0, 32)}...`);

        const currentQty = getItemQuantity(cleanTitle);

        if (buttonEl) {
            buttonEl.classList.add('is-added');
            buttonEl.innerHTML = `<i class="fa-solid fa-check"></i> Added (${currentQty})`;
        }

        updateDealsModalButtonStates();
        updateAllCardBadges();
        updateQuickViewButtonState();
    }
    window.addToCart = addToCart;

    // -------------------------------------------------------------------------
    // 3. Product Quick View Modal
    // -------------------------------------------------------------------------
    function openQuickView(title, price, imagePath) {
        if (!productModal || !productOverlay) return;
        const cleanImg = extractCleanImageUrl(imagePath);
        currentModalItem = { title, price, imageStyle: cleanImg };

        if (quickviewTitle) quickviewTitle.textContent = title;
        if (quickviewPrice) quickviewPrice.textContent = price.toLocaleString('en-IN');
        if (quickviewMrp) quickviewMrp.textContent = `₹${Math.round(price * 3.2).toLocaleString('en-IN')}`;
        if (quickviewImg) {
            quickviewImg.src = cleanImg;
            quickviewImg.alt = title;
        }

        updateQuickViewButtonState();

        productModal.classList.add('active');
        productOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeQuickView() {
        if (!productModal || !productOverlay) return;
        productModal.classList.remove('active');
        productOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeQuickView);
    if (productOverlay) productOverlay.addEventListener('click', closeQuickView);

    if (quickviewAddCartBtn) {
        quickviewAddCartBtn.addEventListener('click', () => {
            if (currentModalItem) {
                addToCart(currentModalItem.title, currentModalItem.price, currentModalItem.imageStyle, quickviewAddCartBtn);
            }
        });
    }

    if (quickviewBuyNowBtn) {
        quickviewBuyNowBtn.addEventListener('click', () => {
            if (currentModalItem) {
                addToCart(currentModalItem.title, currentModalItem.price, currentModalItem.imageStyle, quickviewAddCartBtn);
                closeQuickView();
                openCheckoutModal();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 4. "See all offers" -> Category Deals Modal (100% Real Amazon Behavior)
    // -------------------------------------------------------------------------
    function openCategoryDealsModal(card) {
        if (!dealsModal || !dealsOverlay) return;
        const titleEl = card.querySelector('h3');
        const cardTitle = titleEl ? titleEl.textContent.trim() : 'Deals & Offers';

        if (dealsModalTitle) dealsModalTitle.textContent = cardTitle;

        // Extract the 4 products from this card
        const piccEls = card.querySelectorAll('.picc');
        const spanEls = card.querySelectorAll('.text span');

        let itemsHtml = '';
        piccEls.forEach((picc, i) => {
            const caption = spanEls[i] ? spanEls[i].textContent.trim() : `Item ${i + 1}`;
            const cleanImg = extractCleanImageUrl(picc);
            
            // Generate reasonable price
            const priceMatch = caption.match(/₹([0-9,]+)/) || cardTitle.match(/₹([0-9,]+)/);
            const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : (299 + i * 150);

            const qty = getItemQuantity(caption);
            const isAdded = qty > 0;
            const buttonHtml = isAdded
                ? `<button class="deal-card-add-btn is-added" data-title="${caption.replace(/"/g, '&quot;')}" onclick="event.stopPropagation(); addToCart('${caption.replace(/'/g, "\\'")}', ${price}, '${cleanImg}', this)"><i class="fa-solid fa-check"></i> Added (${qty})</button>`
                : `<button class="deal-card-add-btn" data-title="${caption.replace(/"/g, '&quot;')}" onclick="event.stopPropagation(); addToCart('${caption.replace(/'/g, "\\'")}', ${price}, '${cleanImg}', this)"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>`;
            const badgeHtml = isAdded
                ? `<div class="deal-card-qty-badge"><i class="fa-solid fa-cart-shopping"></i> ${qty} in Cart</div>`
                : '';

            itemsHtml += `
                <div class="deal-card" data-title="${caption.replace(/"/g, '&quot;')}" onclick="openProductFromDeal('${caption.replace(/'/g, "\\'")}', ${price}, '${cleanImg}')">
                    ${badgeHtml}
                    <img src="${cleanImg}" alt="${caption}" class="deal-card-img" onerror="this.src='amazon pic/11.jpg';">
                    <h4 class="deal-card-title">${caption}</h4>
                    <p class="deal-card-price">₹${price.toLocaleString('en-IN')}</p>
                    ${buttonHtml}
                </div>
            `;
        });

        if (dealsModalItems) dealsModalItems.innerHTML = itemsHtml;

        dealsModal.classList.add('active');
        dealsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.openProductFromDeal = function(title, price, img) {
        closeDealsModal();
        openQuickView(title, price, img);
    };

    function closeDealsModal() {
        if (!dealsModal || !dealsOverlay) return;
        dealsModal.classList.remove('active');
        dealsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeDealsModalBtn) closeDealsModalBtn.addEventListener('click', closeDealsModal);
    if (dealsOverlay) dealsOverlay.addEventListener('click', closeDealsModal);

    // -------------------------------------------------------------------------
    // Attach Card Listeners:
    // - "See all offers" opens Category Deals Modal (NOT direct cart add)
    // - Clicking individual item opens Product Quick View Modal
    // -------------------------------------------------------------------------
    allCards.forEach(card => {
        const link = card.querySelector('.boxx-link');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openCategoryDealsModal(card);
            });
        }

        const piccItems = card.querySelectorAll('.picc');
        const spanEls = card.querySelectorAll('.text span');

        piccItems.forEach((picc, i) => {
            picc.title = 'Click to view product details & buy';
            picc.addEventListener('click', () => {
                const caption = spanEls[i] ? spanEls[i].textContent.trim() : 'Amazon Product';
                const cleanImg = extractCleanImageUrl(picc);
                const titleEl = card.querySelector('h3');
                const cardTitle = titleEl ? titleEl.textContent.trim() : '';
                const priceMatch = caption.match(/₹([0-9,]+)/) || cardTitle.match(/₹([0-9,]+)/);
                const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : (399 + i * 100);
                openQuickView(caption, price, cleanImg);
            });
        });

        // Also allow clicking captions
        spanEls.forEach((span, i) => {
            span.style.cursor = 'pointer';
            span.addEventListener('click', () => {
                const picc = piccItems[i];
                const caption = span.textContent.trim();
                const cleanImg = extractCleanImageUrl(picc);
                const priceMatch = caption.match(/₹([0-9,]+)/);
                const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 499;
                openQuickView(caption, price, cleanImg);
            });
        });
    });

    // Attach click handlers to top promo boxes
    promoBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const p = box.querySelector('p');
            const h1 = box.querySelector('h1');
            const name = p ? p.textContent.trim().replace(/\s+/g, ' ') : 'Promo Deal';
            const priceMatch = h1 ? h1.textContent.match(/[0-9]+/) : null;
            const price = priceMatch ? parseInt(priceMatch[0]) : 399;
            const cleanImg = extractCleanImageUrl(box);
            openQuickView(name, price, cleanImg);
        });
    });

    // -------------------------------------------------------------------------
    // 5. Sidebar Drawer
    // -------------------------------------------------------------------------
    function openSidebar() {
        if (!sidebar || !sidebarOverlay) return;
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!sidebar || !sidebarOverlay) return;
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // -------------------------------------------------------------------------
    // 6. Cart Drawer & Checkout Integration
    // -------------------------------------------------------------------------
    function openCart() {
        if (!cartDrawer || !cartOverlay) return;
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        if (!cartDrawer || !cartOverlay) return;
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (navCartBtn) navCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Hook Cart Drawer "Proceed to Buy" button to open Checkout Modal
    const cartCheckoutBtn = document.querySelector('.checkout-btn');
    if (cartCheckoutBtn) {
        cartCheckoutBtn.onclick = function() {
            if (cart.length === 0) {
                showToast('Your cart is empty! Add items to checkout.');
                return;
            }
            closeCart();
            openCheckoutModal();
        };
    }

    // -------------------------------------------------------------------------
    // 7. Checkout Modal
    // -------------------------------------------------------------------------
    function openCheckoutModal() {
        if (!checkoutModal || !checkoutOverlay) return;

        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let total = Math.max(0, subtotal - 100);

        if (checkoutItemsSubtotal) checkoutItemsSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}.00`;
        if (checkoutOrderTotal) checkoutOrderTotal.textContent = `₹${total.toLocaleString('en-IN')}.00`;

        if (checkoutContent) checkoutContent.style.display = 'block';
        if (checkoutSuccess) checkoutSuccess.style.display = 'none';

        checkoutModal.classList.add('active');
        checkoutOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckoutModal() {
        if (!checkoutModal || !checkoutOverlay) return;
        checkoutModal.classList.remove('active');
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);

    // -------------------------------------------------------------------------
    // Order History & Real-Time Delivery Tracking System
    // -------------------------------------------------------------------------
    function saveOrders() {
        try {
            localStorage.setItem('amazon_orders', JSON.stringify(orders));
        } catch (e) {}
        updateOrdersBadge();
    }

    function updateOrdersBadge() {
        if (navOrdersCount) {
            navOrdersCount.textContent = orders.length;
            navOrdersCount.style.display = orders.length > 0 ? 'inline-block' : 'none';
        }
        if (ordersCountBadge) {
            ordersCountBadge.textContent = `${orders.length} order${orders.length === 1 ? '' : 's'}`;
        }
    }

    function isOrderDelivered(order) {
        if (!order) return false;
        if (order.isDelivered) return true;
        if (Date.now() >= order.deliveryTargetTimestamp) {
            order.isDelivered = true;
            if (!order.deliveredDate) {
                const d = new Date(order.deliveryTargetTimestamp);
                order.deliveredDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            }
            saveOrders();
            return true;
        }
        return false;
    }

    function formatTimeRemaining(targetTimestamp) {
        const diff = targetTimestamp - Date.now();
        if (diff <= 0) return 'Arrived';
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        if (mins > 60) {
            const hrs = Math.floor(mins / 60);
            return `${hrs}h ${mins % 60}m remaining`;
        }
        if (mins > 0) {
            return `${mins}m ${secs}s remaining`;
        }
        return `${secs}s remaining`;
    }

    function getOrderStage(order) {
        if (isOrderDelivered(order)) return 4;
        const total = order.deliveryTargetTimestamp - order.timestamp;
        if (total <= 0) return 4;
        const elapsed = Date.now() - order.timestamp;
        const pct = elapsed / total;
        if (pct < 0.25) return 1; // Ordered
        if (pct < 0.65) return 2; // Shipped
        return 3; // Out for delivery
    }

    function renderOrders(tab = 'all') {
        if (!ordersModalBody) return;
        currentOrdersTab = tab;

        // Filter orders based on active tab
        const filtered = orders.filter(order => {
            const delivered = isOrderDelivered(order);
            if (tab === 'active') return !delivered;
            if (tab === 'delivered') return delivered;
            return true;
        });

        if (orders.length === 0) {
            ordersModalBody.innerHTML = `
                <div class="orders-empty-state">
                    <div class="orders-empty-icon"><i class="fa-solid fa-box-open"></i></div>
                    <h4>You have not placed any orders yet</h4>
                    <p>When you place an order, its real-time delivery status and countdown will appear here.</p>
                    <button class="orders-explore-btn" onclick="closeOrdersModal()"><i class="fa-solid fa-bag-shopping"></i> Start Shopping</button>
                </div>
            `;
            return;
        }

        if (filtered.length === 0) {
            ordersModalBody.innerHTML = `
                <div class="orders-empty-state">
                    <div class="orders-empty-icon"><i class="fa-solid fa-filter"></i></div>
                    <h4>No ${tab === 'active' ? 'active in-transit' : 'delivered'} orders found</h4>
                    <p>Switch tabs above to view your other orders.</p>
                </div>
            `;
            return;
        }

        ordersModalBody.innerHTML = filtered.map(order => {
            const delivered = isOrderDelivered(order);
            const stage = getOrderStage(order);
            const timeRemainingText = formatTimeRemaining(order.deliveryTargetTimestamp);

            return `
                <div class="amazon-order-card" data-order-id="${order.id}">
                    <div class="order-card-header">
                        <div class="order-header-col">
                            <span class="order-col-label">ORDER PLACED</span>
                            <span class="order-col-value">${order.placedDate}</span>
                        </div>
                        <div class="order-header-col">
                            <span class="order-col-label">TOTAL</span>
                            <span class="order-col-value">₹${order.totalAmount.toLocaleString('en-IN')}.00</span>
                        </div>
                        <div class="order-header-col">
                            <span class="order-col-label">SHIP TO</span>
                            <span class="order-col-value" title="${order.shippingAddress}">${order.shippingName} <i class="fa-solid fa-chevron-down" style="font-size: 10px;"></i></span>
                        </div>
                        <div class="order-header-col order-header-right">
                            <span class="order-col-label">ORDER # ${order.id}</span>
                            <div class="order-header-links">
                                <a href="#" style="color: #007185; text-decoration: none; font-size: 12px;" onclick="event.preventDefault(); viewOrderInvoice('${order.id}')">View invoice</a>
                            </div>
                        </div>
                    </div>

                    <div class="order-card-body">
                        <div class="order-delivery-status ${delivered ? 'is-delivered' : 'is-transit'}">
                            <div class="delivery-status-headline">
                                ${delivered 
                                    ? `<i class="fa-solid fa-circle-check" style="color: #007600; font-size: 20px;"></i> <strong style="color: #007600;">Delivered on ${order.deliveredDate || 'Today'}</strong>` 
                                    : `<i class="fa-solid fa-truck-fast" style="color: #007600; font-size: 20px;"></i> <strong style="color: #007600;">Arriving: ${order.etaFormatted}</strong> <span class="eta-countdown-badge" id="countdown-${order.id}"><i class="fa-solid fa-stopwatch"></i> ${timeRemainingText}</span>`
                                }
                            </div>
                            <p class="delivery-status-subtext">
                                ${delivered ? 'Package was handed directly to resident or left in a secure location.' : 'Your package is on its way with Amazon Logistics.'}
                            </p>
                        </div>

                        <!-- 4-step Progress Tracker -->
                        <div class="order-progress-tracker">
                            <div class="tracker-step completed">
                                <div class="tracker-dot"><i class="fa-solid fa-check"></i></div>
                                <span class="tracker-label">Ordered</span>
                            </div>
                            <div class="tracker-line ${stage >= 2 ? 'completed' : ''}"></div>
                            <div class="tracker-step ${stage >= 2 ? 'completed' : ''}">
                                <div class="tracker-dot">${stage >= 2 ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-box"></i>'}</div>
                                <span class="tracker-label">Shipped</span>
                            </div>
                            <div class="tracker-line ${stage >= 3 ? 'completed' : ''}"></div>
                            <div class="tracker-step ${stage >= 3 ? (delivered ? 'completed' : 'current') : ''}">
                                <div class="tracker-dot">${delivered ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-truck"></i>'}</div>
                                <span class="tracker-label">Out for delivery</span>
                            </div>
                            <div class="tracker-line ${delivered ? 'completed' : ''}"></div>
                            <div class="tracker-step ${delivered ? 'completed' : ''}">
                                <div class="tracker-dot">${delivered ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-regular fa-circle-check"></i>'}</div>
                                <span class="tracker-label">Delivered</span>
                            </div>
                        </div>

                        <!-- Items & Actions -->
                        <div class="order-card-content">
                            <div class="order-items-list">
                                ${order.items.map(item => `
                                    <div class="order-product-row">
                                        <img src="${item.image}" alt="${item.title}" class="order-product-img" onerror="this.src='amazon pic/11.jpg';">
                                        <div class="order-product-info">
                                            <h4 class="order-product-title">${item.title}</h4>
                                            <p class="order-product-meta">Quantity: <strong>${item.quantity}</strong> &bull; Price: <strong>₹${item.price.toLocaleString('en-IN')}</strong></p>
                                            <p class="order-return-eligible">${delivered ? '<i class="fa-solid fa-shield-halved" style="color: #007600;"></i> Return window open until 30 days' : '<i class="fa-solid fa-clock" style="color: #e67a00;"></i> In transit &bull; Eligible for return after delivery'}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-card-actions">
                                ${!delivered ? `
                                    <button class="order-btn-fast-forward" onclick="forceDeliverOrder('${order.id}')" title="Test instant delivery">
                                        <i class="fa-solid fa-forward-step"></i> Simulate Instant Delivery
                                    </button>
                                ` : ''}
                                <button class="order-btn-primary" onclick="reorderItems('${order.id}')">
                                    <i class="fa-solid fa-rotate-left"></i> Buy it again
                                </button>
                                <button class="order-btn-secondary" onclick="viewOrderInvoice('${order.id}')">
                                    <i class="fa-regular fa-file-lines"></i> View order details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal open / close handlers
    function openOrdersModal() {
        if (!ordersModal || !ordersOverlay) return;
        renderOrders(currentOrdersTab);
        ordersModal.classList.add('active');
        ordersOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeOrdersModal() {
        if (!ordersModal || !ordersOverlay) return;
        ordersModal.classList.remove('active');
        ordersOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (navOrdersBtn) navOrdersBtn.addEventListener('click', openOrdersModal);
    if (closeOrdersModalBtn) closeOrdersModalBtn.addEventListener('click', closeOrdersModal);
    if (ordersOverlay) ordersOverlay.addEventListener('click', closeOrdersModal);

    if (viewOrdersSuccessBtn) {
        viewOrdersSuccessBtn.addEventListener('click', () => {
            closeCheckoutModal();
            openOrdersModal();
        });
    }

    // Tab buttons
    ordersTabs.forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            ordersTabs.forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            renderOrders(tabBtn.getAttribute('data-tab'));
        });
    });

    if (clearOrdersBtn) {
        clearOrdersBtn.addEventListener('click', () => {
            if (orders.length === 0) return;
            if (confirm('Are you sure you want to clear your order history?')) {
                orders = [];
                saveOrders();
                renderOrders('all');
                showToast('Orders history cleared');
            }
        });
    }

    // Global action functions exposed on window
    window.closeOrdersModal = closeOrdersModal;
    window.openOrdersModal = openOrdersModal;

    window.forceDeliverOrder = function(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        order.isDelivered = true;
        const now = new Date();
        order.deliveredDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        saveOrders();
        renderOrders(currentOrdersTab);
        showToast(`Order #${orderId} marked as DELIVERED!`);
    };

    window.reorderItems = function(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.items || order.items.length === 0) return;
        order.items.forEach(item => {
            addToCart(item.title, item.price, item.image);
        });
        closeOrdersModal();
        openCart();
        showToast(`Items from Order #${orderId} added to cart!`);
    };

    window.viewOrderInvoice = function(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        alert(`Amazon.in Tax Invoice\n================================\nOrder ID: #${order.id}\nPlaced on: ${order.placedDate} at ${order.placedTime}\nStatus: ${order.isDelivered ? 'DELIVERED (' + order.deliveredDate + ')' : 'IN TRANSIT (ETA: ' + order.etaFormatted + ')'}\n\nShipping Address:\n${order.shippingName}\n${order.shippingAddress}\n\nPayment Method: ${order.paymentMethod}\n\nItems Ordered:\n${order.items.map(i => '- ' + i.title + ' (x' + i.quantity + ') : ₹' + (i.price * i.quantity)).join('\n')}\n\nItems Subtotal: ₹${order.subtotal}.00\nPromotion Applied: -₹${order.discount}.00\nOrder Total: ₹${order.totalAmount}.00`);
    };

    // Live 1-second countdown ticker for orders in transit
    setInterval(() => {
        let stateChanged = false;
        orders.forEach(order => {
            if (!order.isDelivered) {
                const countdownEl = document.getElementById(`countdown-${order.id}`);
                if (Date.now() >= order.deliveryTargetTimestamp) {
                    order.isDelivered = true;
                    const d = new Date(order.deliveryTargetTimestamp);
                    order.deliveredDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    stateChanged = true;
                    showToast(`🔔 Package for Order #${order.id} has been DELIVERED!`);
                } else if (countdownEl) {
                    countdownEl.innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${formatTimeRemaining(order.deliveryTargetTimestamp)}`;
                }
            }
        });
        if (stateChanged) {
            saveOrders();
            renderOrders(currentOrdersTab);
        }
    }, 1000);

    // Hook Checkout Place Order Button
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty! Add items to place order.');
                return;
            }

            // Generate Amazon 17-digit Order ID
            const randomId = '402-' + Math.floor(1000000 + Math.random() * 9000000) + '-' + Math.floor(1000000 + Math.random() * 9000000);
            if (orderIdBadge) orderIdBadge.textContent = `Order #${randomId}`;

            // Read chosen delivery speed
            const speedInput = document.querySelector('input[name="delivery_speed"]:checked');
            const isExpress = !speedInput || speedInput.value === '60';
            const durationSecs = isExpress ? 60 : (24 * 3600); // 60s for live demo, 24h for standard

            // Read chosen payment method
            const paymentInput = document.querySelector('input[name="payment"]:checked');
            let paymentMethod = 'Amazon Pay UPI';
            if (paymentInput) {
                if (paymentInput.value === 'card') paymentMethod = 'Credit / Debit Card';
                else if (paymentInput.value === 'cod') paymentMethod = 'Cash on Delivery (COD)';
            }

            const now = Date.now();
            const targetTs = now + (durationSecs * 1000);
            const nowObj = new Date(now);
            const placedDate = nowObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            const placedTime = nowObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

            let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            let total = Math.max(0, subtotal - 100);

            const etaFormatted = isExpress 
                ? 'Today (within 60 seconds)' 
                : 'Tomorrow by 8:00 PM';

            // Create new complete order object
            const newOrder = {
                id: randomId,
                timestamp: now,
                placedDate: placedDate,
                placedTime: placedTime,
                shippingName: 'Abhishek Singh',
                shippingAddress: 'Flat 402, Royal Residency, Connaught Place, New Delhi, Delhi - 110001',
                paymentMethod: paymentMethod,
                deliverySpeed: isExpress ? 'express' : 'standard',
                deliveryDurationSeconds: durationSecs,
                deliveryTargetTimestamp: targetTs,
                etaFormatted: etaFormatted,
                isDelivered: false,
                deliveredDate: null,
                totalAmount: total,
                subtotal: subtotal,
                discount: 100,
                items: cart.map(item => ({
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity
                }))
            };

            orders.unshift(newOrder);
            saveOrders();

            if (checkoutEtaDisplay) {
                checkoutEtaDisplay.textContent = isExpress 
                    ? 'Arriving in 60 seconds (Live Demo)' 
                    : 'Arriving Tomorrow by 8:00 PM (FREE Delivery)';
            }

            if (checkoutContent) checkoutContent.style.display = 'none';
            if (checkoutSuccess) checkoutSuccess.style.display = 'block';

            // Clear Cart on successful order
            cart = [];
            saveCart();
            updateCartUI();
            showToast(`Order #${randomId} placed successfully!`);
        });
    }

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            closeCheckoutModal();
        });
    }

    // -------------------------------------------------------------------------
    // 8. Location Modal
    // -------------------------------------------------------------------------
    function openLocationModal() {
        if (!locationModal || !locationOverlay) return;
        locationModal.classList.add('active');
        locationOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLocationModal() {
        if (!locationModal || !locationOverlay) return;
        locationModal.classList.remove('active');
        locationOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (locationBtn) locationBtn.addEventListener('click', openLocationModal);
    if (closeLocationModalBtn) closeLocationModalBtn.addEventListener('click', closeLocationModal);
    if (locationOverlay) locationOverlay.addEventListener('click', closeLocationModal);

    if (applyPincodeBtn && pincodeInput) {
        applyPincodeBtn.addEventListener('click', () => {
            const pin = pincodeInput.value.trim();
            if (pin.length === 6 && /^\d+$/.test(pin)) {
                if (currentLocationText) currentLocationText.textContent = `India ${pin}`;
                closeLocationModal();
                showToast(`Delivery location updated to ${pin}`);
            } else {
                alert('Please enter a valid 6-digit Indian PIN code.');
            }
        });
    }

    if (citySelect) {
        citySelect.addEventListener('change', () => {
            const city = citySelect.value;
            if (currentLocationText) currentLocationText.textContent = city;
            closeLocationModal();
            showToast(`Delivery location updated to ${city}`);
        });
    }

    // -------------------------------------------------------------------------
    // 9. Hero Slider Animation
    // -------------------------------------------------------------------------
    let slideIdx = 0;
    const heroSlides = [
        'amazon pic/Hero page.jpg',
        'amazon pic/Hero page.jpg'
    ];

    function changeHeroSlide(dir) {
        slideIdx = (slideIdx + dir + heroSlides.length) % heroSlides.length;
        if (heroSection) {
            heroSection.style.opacity = '0.7';
            setTimeout(() => {
                heroSection.style.backgroundImage = `url("${heroSlides[slideIdx]}")`;
                heroSection.style.opacity = '1';
            }, 150);
        }
        showToast('Viewing featured offers banner');
    }

    if (heroPrevBtn) heroPrevBtn.addEventListener('click', () => changeHeroSlide(-1));
    if (heroNextBtn) heroNextBtn.addEventListener('click', () => changeHeroSlide(1));

    // -------------------------------------------------------------------------
    // 10. Search Bar Filtering & Category Selector
    // -------------------------------------------------------------------------
    function handleSearch() {
        const query = (searchInput.value || '').trim().toLowerCase();
        if (!query) {
            allCards.forEach(c => {
                c.style.display = '';
            });
            showToast('Showing all categories');
            return;
        }

        let matchCount = 0;
        let firstMatch = null;

        allCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(query)) {
                card.style.display = '';
                matchCount++;
                if (!firstMatch) firstMatch = card;
            } else {
                card.style.display = 'none';
            }
        });

        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast(`Found ${matchCount} categories matching "${query}"`);
        } else {
            showToast(`No exact match for "${query}". Showing available deals.`);
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    if (searchSelect) {
        searchSelect.addEventListener('change', () => {
            const val = searchSelect.value;
            const cat = searchSelect.options[searchSelect.selectedIndex].text;
            searchInput.placeholder = cat === 'All' ? 'Search Amazon.in' : `Search in ${cat}`;

            if (val === 'all') {
                allCards.forEach(c => c.style.display = '');
                showToast('Showing all categories');
                return;
            }

            // Category filter mapping
            let matchCount = 0;
            let firstMatch = null;
            allCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                let matches = false;
                if (val === 'mobiles' && (text.includes('mobile') || text.includes('smartphone') || text.includes('samsung') || text.includes('redmi'))) matches = true;
                else if (val === 'electronics' && (text.includes('electronics') || text.includes('camera') || text.includes('tv') || text.includes('printer') || text.includes('headphone') || text.includes('earbud') || text.includes('speaker') || text.includes('alexa') || text.includes('router') || text.includes('storage') || text.includes('ssd'))) matches = true;
                else if (val === 'fashion' && (text.includes('style') || text.includes('dress') || text.includes('innerwear') || text.includes('kurta') || text.includes('t-shirt'))) matches = true;
                else if (val === 'home' && (text.includes('home') || text.includes('kitchen') || text.includes('decor') || text.includes('cleaning') || text.includes('light'))) matches = true;
                else if (val === 'books' && (text.includes('stationery') || text.includes('school') || text.includes('pens') || text.includes('notebook'))) matches = true;
                else if (val === 'beauty' && (text.includes('smile') || text.includes('toothbrush') || text.includes('care'))) matches = true;
                else if (val === 'grocery' && (text.includes('dry fruits') || text.includes('tea') || text.includes('snack') || text.includes('daily needs'))) matches = true;
                else if (text.includes(val)) matches = true;

                if (matches) {
                    card.style.display = '';
                    matchCount++;
                    if (!firstMatch) firstMatch = card;
                } else {
                    card.style.display = 'none';
                }
            });

            if (firstMatch) {
                firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showToast(`Filtered to ${matchCount} ${cat} categories`);
            } else {
                showToast(`Showing deals in ${cat}`);
            }
        });
    }

    // Keyboard ESC listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
            closeCart();
            closeLocationModal();
            closeQuickView();
            closeDealsModal();
            closeCheckoutModal();
            closeOrdersModal();
        }
    });

    // -------------------------------------------------------------------------
    // 11. Toast Helper
    // -------------------------------------------------------------------------
    function showToast(message) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'amazon-toast';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }

    // Initialize UI
    updateCartUI();
    updateOrdersBadge();
});
