function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let count = 0;
  cart.forEach(item => {
    count += item.quantity;
  });
  const countElements = document.querySelectorAll('#cart-count');
  countElements.forEach(el => {
    el.textContent = count;
  });
}

function ensureCartToast() {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  return toast;
}

function showCartToast(message) {
  const toast = ensureCartToast();
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1700);
}

function ensureLightbox() {
  let lightbox = document.getElementById('product-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'product-lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `<button class="lightbox-close" aria-label="Bild schließen">✕</button><img src="" alt="Produktbild" />`;
    document.body.appendChild(lightbox);
  }
  return lightbox;
}

function showLightbox(src, alt) {
  const lightbox = ensureLightbox();
  const img = lightbox.querySelector('img');
  img.src = src;
  img.alt = alt || 'Produktbild';
  lightbox.classList.add('show');
}

function hideLightbox() {
  const lightbox = document.getElementById('product-lightbox');
  if (lightbox) {
    lightbox.classList.remove('show');
  }
}

function initLightbox() {
  document.body.addEventListener('click', event => {
    const target = event.target;
    if (target.matches('.card-image img')) {
      showLightbox(target.src, target.alt);
    }
    if (target.matches('.lightbox-close') || target.matches('.lightbox')) {
      hideLightbox();
    }
  });

  document.addEventListener('keyup', event => {
    if (event.key === 'Escape') hideLightbox();
  });
}

// map color keys to CSS background values (solid or gradient)
function colorToStyle(name) {
  switch ((name || '').toLowerCase()) {
    case 'marmour':
      return 'linear-gradient(135deg,#f8f8f8 0%,#e9e9e9 100%), repeating-radial-gradient(circle at 0 0, #bfbfbf 0px, #bfbfbf 1px, transparent 6px)';
    case 'weiss':
    case 'weiß':
      return '#ffffff';
    case 'schwarz':
      return '#111111';
    case 'rot':
      return '#c0392b';
    case 'rosa':
      return '#ffb6c1';
    case 'hellblau':
      return '#87cefa';
    case 'dunkelblau':
      return '#1e3a8a';
    case 'meeresblau':
      return '#0077be';
    case 'magenta':
      return '#ff00ff';
    case 'gold':
      return 'linear-gradient(90deg,#d4af37,#f3d27a)';
    case 'tuerkis':
      return '#30d5c8';
    case 'braun':
      return '#8b5a2b';
    case 'holz':
      return 'linear-gradient(90deg,#b58958,#8b6b4a)';
    default:
      return '#dddddd';
  }
}

// initialize swatches next to selects
document.querySelectorAll('.product-color').forEach(select => {
  const swatch = select.closest('.color-control')?.querySelector('.color-swatch');
  if (!swatch) return;
  const apply = () => {
    const val = select.value;
    swatch.style.background = colorToStyle(val);
  };
  select.addEventListener('change', apply);
  apply();
});

// add to cart, taking selected color into account
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    const name = this.getAttribute('data-name');
    const price = parseFloat(this.getAttribute('data-price'));
    const card = this.closest('.card');
    const colorSelect = card ? card.querySelector('.product-color') : null;
    const color = colorSelect ? colorSelect.value : '';
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === id && item.color === color);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, color, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    const label = color ? `${name} (${color})` : name;
    showCartToast(`${label} wurde dem Warenkorb hinzugefügt.`);
    
    this.textContent = '✓ Hinzugefügt';
    setTimeout(() => {
      this.textContent = 'In den Warenkorb';
    }, 1500);
  });
});

const searchInput = document.getElementById('product-search');
const productGrid = document.querySelector('.product-grid');

// keep initial order for "default" sorting
const initialOrder = productGrid ? Array.from(productGrid.querySelectorAll('.card')).map(card => card) : [];

if (searchInput && productGrid) {
  const filterProducts = () => {
    const query = searchInput.value.trim().toLowerCase();
    const productCards = Array.from(productGrid.querySelectorAll('.card'));

    productCards.forEach(card => {
      const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
      const description = card.querySelector('p')?.textContent.toLowerCase() || '';
      const matches = title.includes(query) || description.includes(query);
      card.style.display = matches ? 'block' : 'none';
    });
  };

  searchInput.addEventListener('input', filterProducts);

  const sortSelect = document.getElementById('sort-price');
  if (sortSelect) {
    const sortProducts = (order) => {
      const cards = Array.from(productGrid.querySelectorAll('.card'));
      if (order === 'default') {
        // restore original order
        initialOrder.forEach(c => productGrid.appendChild(c));
        return;
      }
      cards.sort((a, b) => {
        const pa = parseFloat(a.querySelector('.add-to-cart')?.getAttribute('data-price')) || 0;
        const pb = parseFloat(b.querySelector('.add-to-cart')?.getAttribute('data-price')) || 0;
        return order === 'asc' ? pa - pb : pb - pa;
      });
      cards.forEach(c => productGrid.appendChild(c));
    };

    sortSelect.addEventListener('change', function() {
      sortProducts(this.value);
    });
  }
}

updateCartCount();
initLightbox();

// thumbnail click: swap main product image inside same card
document.querySelectorAll('.product-thumb').forEach(thumb => {
  thumb.addEventListener('click', function() {
    const card = this.closest('.card');
    if (!card) return;
    const mainImg = card.querySelector('.card-image img') || card.querySelector('#main-product-image-1');
    if (mainImg && this.dataset.large) {
      mainImg.src = this.dataset.large;
    }
    card.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});
