function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const menuButton = document.querySelector('.mobile-menu-button');
  mobileMenu.classList.toggle('active');
  menuButton.classList.toggle('active');
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize any mobile menu related functionality here if needed
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
});
