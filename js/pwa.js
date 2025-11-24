// PWA Installation and Service Worker Registration
let deferredPrompt;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Handle PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show custom install prompt
    showInstallPrompt();
});

// Show install prompt
function showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const closePrompt = document.getElementById('closePrompt');
    
    // Check if user has dismissed the prompt before
    const promptDismissed = localStorage.getItem('installPromptDismissed');
    if (promptDismissed) {
        return;
    }
    
    // Show the prompt after 2 seconds
    setTimeout(() => {
        installPrompt.style.display = 'block';
        setTimeout(() => {
            installPrompt.classList.add('show');
        }, 100);
    }, 2000);
    
    // Install button click
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // Clear the deferredPrompt
        deferredPrompt = null;
        
        // Hide the prompt
        hideInstallPrompt();
    });
    
    // Close button click
    closePrompt.addEventListener('click', () => {
        hideInstallPrompt();
        localStorage.setItem('installPromptDismissed', 'true');
    });
}

// Hide install prompt
function hideInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    installPrompt.classList.remove('show');
    setTimeout(() => {
        installPrompt.style.display = 'none';
    }, 300);
}

// Handle successful installation
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed successfully');
    hideInstallPrompt();
    
    // Show success message
    showNotification('تم تثبيت التطبيق بنجاح! 🎉');
});

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('تم الاتصال بالإنترنت 🌐');
});

window.addEventListener('offline', () => {
    showNotification('أنت الآن في وضع عدم الاتصال 📴');
});

// Prevent pull-to-refresh on mobile - FIXED
let startY = 0;
const preventPullToRefresh = (e) => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const y = e.touches[0].pageY;
    
    // Only prevent if at the top of the page AND pulling down
    if (scrollTop <= 0 && y > startY && !e.target.closest('.modal-content')) {
        e.preventDefault();
    }
};

document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
}, { passive: true });

document.addEventListener('touchmove', preventPullToRefresh, { passive: false });
