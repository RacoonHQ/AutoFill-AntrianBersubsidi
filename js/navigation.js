// Simple navigation without conflicts
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure popup.js is loaded
  setTimeout(() => {
    const navBtns = document.querySelectorAll('.nav-btn');

    console.log('Simple navigation initialized');

    // Handle navigation clicks
    navBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const targetPage = this.getAttribute('data-page');
        console.log('Tab clicked:', targetPage);

        // Update nav buttons
        navBtns.forEach(navBtn => navBtn.classList.remove('active'));
        this.classList.add('active');

        // Show/hide pages
        const actionsPage = document.getElementById('actionsPage');
        const formPage = document.getElementById('formPage');
        
        if (targetPage === 'actions') {
          if (actionsPage) actionsPage.style.display = 'block';
          if (formPage) formPage.style.display = 'none';
        } else if (targetPage === 'form') {
          if (actionsPage) actionsPage.style.display = 'none';
          if (formPage) formPage.style.display = 'block';
        }
      });
    });

    // Don't set initial page visibility - let popup.js handle it based on auth status
    console.log('Navigation ready');
  }, 300);
});
