// Enhanced navigation with proper page management
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure popup.js is loaded
  setTimeout(() => {
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    console.log('Enhanced navigation initialized');
    console.log('Found pages:', pages.length);

    // Function to show specific page and hide others
    function showPage(targetPage) {
      console.log('Showing page:', targetPage);

      // Hide all pages first
      pages.forEach(page => {
        page.style.display = 'none';
        console.log('Hiding page:', page.id);
      });

      // Show target page
      const targetElement = document.getElementById(targetPage + 'Page');
      if (targetElement) {
        targetElement.style.display = 'block';
      } else {
        console.error('Target page not found:', targetPage + 'Page');
      }
    }

    // Handle navigation clicks (only for actions and form pages)
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-page') === 'actions' || btn.getAttribute('data-page') === 'form') {
        btn.addEventListener('click', function(e) {
          const targetPage = this.getAttribute('data-page');
          console.log('Tab clicked:', targetPage);

        // Show navbar when navigating between main tabs
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.style.display = 'flex';

          // Update nav buttons
          navBtns.forEach(navBtn => navBtn.classList.remove('active'));
          this.classList.add('active');

          // Show only the target page
          showPage(targetPage);
        });
      }
    });

    // Set initial state - show actions page by default
    showPage('actions');

    console.log('Navigation ready');
  }, 300);
});
