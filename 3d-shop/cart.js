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

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    const name = this.getAttribute('data-name');
    const price = parseFloat(this.getAttribute('data-price'));
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    this.textContent = '✓ Hinzugefügt';
    setTimeout(() => {
      this.textContent = 'In den Warenkorb';
    }, 1500);
  });
});

const searchInput = document.getElementById('product-search');

if (searchInput) {
  const productCards = Array.from(document.querySelectorAll('.product-grid .card'));

  const filterProducts = () => {
    const query = searchInput.value.trim().toLowerCase();

    productCards.forEach(card => {
      const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
      const description = card.querySelector('p')?.textContent.toLowerCase() || '';
      const matches = title.includes(query) || description.includes(query);
      card.style.display = matches ? 'block' : 'none';
    });
  };

  searchInput.addEventListener('input', filterProducts);
}

updateCartCount();
