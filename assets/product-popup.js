class ProductPopup {
  constructor() {
  
    this.popup = document.getElementById('product-popup');
    if (!this.popup) {
      this.createPopupElement();
    }
    this.init();
  }

  createPopupElement() {
    this.popup = document.createElement('div');
    this.popup.id = 'product-popup';
    this.popup.className = 'product-popup';
    this.popup.innerHTML = '<div class="popup-content"></div>';
    document.body.appendChild(this.popup);
  }

  init() {
    
    // Use event delegation for plus icons
    document.addEventListener('click', async (e) => {
      const plusIcon = e.target.closest('.product-card__plus-icon');
      if (plusIcon) {
        e.preventDefault();
        e.stopPropagation();
        
        const productHandle = plusIcon.dataset.productHandle;
        
        if (productHandle) {
          await this.openPopup(productHandle);
        }
      }
    });

    // Close popup handlers
    document.addEventListener('click', (e) => {
      if (e.target.closest('.close-popup') || e.target === this.popup) {
        e.preventDefault();
        this.closePopup();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePopup();
      }
    });
  }

  async openPopup(handle) {
    try {
  
      const response = await fetch(`/products/${handle}?view=popup`);
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch product data');
      }
      
      const html = await response.text();
      
      const popupContent = this.popup.querySelector('.popup-content');
      if (popupContent) {
        popupContent.innerHTML = html;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        this.popup.classList.add('active');
        
        // Initialize variant selectors
        this.initVariantSelectors();
        
        // Initialize color options after content is loaded
        this.initColorOptions();
      }
    } catch (error) {
      console.error('Error opening popup:', error);
    }
  }

  closePopup() {
    document.body.style.overflow = ''; // Restore scrolling
    this.popup.classList.remove('active');
  }

  initVariantSelectors() {
    const form = this.popup.querySelector('form');
    if (!form) return;

    const variantIdInput = form.querySelector('input[name="id"]');
    const selects = form.querySelectorAll('select');
    const variants = JSON.parse(document.getElementById('product-variants').textContent || '[]');
    const colorOptions = this.popup.querySelectorAll('.color-option');

    // Handle color option clicks
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        const select = option.closest('.product-form__input').querySelector('select');
        
        // Update select value
        select.value = value;
        
        // Update visual state
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Trigger change event on select
        select.dispatchEvent(new Event('change'));
      });
    });

    // Handle all variant changes
    selects.forEach(select => {
      select.addEventListener('change', () => {
        const selectedOptions = Array.from(selects).map(select => select.value);
        
        const selectedVariant = variants.find(variant => 
          variant.options.every((option, index) => option === selectedOptions[index])
        );

        if (selectedVariant) {
          variantIdInput.value = selectedVariant.id;
          
          // Update price
          const priceElement = this.popup.querySelector('.popup-product-price');
          if (priceElement) {
            priceElement.innerHTML = this.formatMoney(selectedVariant.price);
          }

          // Update button state
          const addButton = form.querySelector('button[type="submit"]');
          if (addButton) {
            if (selectedVariant.available) {
              addButton.disabled = false;
              addButton.querySelector('span').textContent = 'ADD TO CART';
            } else {
              addButton.disabled = true;
              addButton.querySelector('span').textContent = 'SOLD OUT';
            }
          }
        }
      });
    });
  }

  initColorOptions() {
    const colorOptions = this.popup.querySelectorAll('.color-option');
    colorOptions.forEach((option, index) => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        option.classList.add('selected');
        // Set data attribute for sliding
        option.closest('.color-options').setAttribute('data-selected', index);
      });
    });
  }

  formatMoney(dollar) {
    return ('$'+dollar / 100).toFixed(2);
  }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!customElements.get('product-popup')) {
    customElements.define('product-popup', class extends HTMLElement {
      constructor() {
        super();
        new ProductPopup();
      }
    });
  }
});