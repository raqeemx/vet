// Favorites management
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadDarkMode();
    renderVitaminCards();
    setupEventListeners();
    updateFavoritesBadge();
});

// Dark Mode Management
function loadDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Favorites Management
function toggleFavorite(itemId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const index = favorites.indexOf(itemId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(itemId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesBadge();
    
    // Update the current view if we're on favorites filter
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    if (activeFilter === 'favorites') {
        const searchInput = document.getElementById('searchInput');
        renderVitaminCards('favorites', searchInput.value.trim());
    }
}

function isFavorite(itemId) {
    return favorites.includes(itemId);
}

function updateFavoritesBadge() {
    const badge = document.getElementById('favoritesBadge');
    if (badge) {
        badge.textContent = favorites.length;
        badge.style.display = favorites.length > 0 ? 'flex' : 'none';
    }
}

function showFavoritesOnly() {
    const searchInput = document.getElementById('searchInput');
    renderVitaminCards('favorites', searchInput.value.trim());
}

// Share functionality
async function shareItem(item, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const shareData = {
        title: `${item.name} - دليل الفيتامينات`,
        text: `تعرف على أعراض نقص ${item.name} (${item.scientificName}) والمصادر الغذائية الغنية به.`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
            showNotification('تم نسخ المعلومات إلى الحافظة! 📋');
        }
    } catch (err) {
        console.log('Error sharing:', err);
    }
}

// Render vitamin cards
function renderVitaminCards(filter = 'all', searchTerm = '') {
    const grid = document.getElementById('vitaminsGrid');
    const noResults = document.getElementById('noResults');
    grid.innerHTML = '';
    
    let filteredData = vitaminsData;
    
    // Apply favorites filter
    if (filter === 'favorites') {
        filteredData = filteredData.filter(item => isFavorite(item.id));
    }
    // Apply category filter
    else if (filter !== 'all') {
        filteredData = filteredData.filter(item => item.category === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            item.name.includes(searchTerm) || 
            item.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredData.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }
    
    filteredData.forEach(item => {
        const card = createVitaminCard(item);
        grid.appendChild(card);
    });
}

// Create a vitamin card element
function createVitaminCard(item) {
    const card = document.createElement('div');
    card.className = 'vitamin-card';
    
    // Create severity indicators
    let severityDots = '';
    for (let i = 1; i <= 3; i++) {
        severityDots += `<span class="severity-dot ${i <= item.severity ? 'active' : ''}"></span>`;
    }
    
    // Limit symptoms to 3 for card view
    const limitedSymptoms = item.symptoms.slice(0, 3);
    const symptomsHTML = limitedSymptoms.map(symptom => `<li>${symptom}</li>`).join('');
    
    const favoriteClass = isFavorite(item.id) ? 'active' : '';
    
    card.innerHTML = `
        <button class="favorite-btn ${favoriteClass}" onclick="toggleFavorite('${item.id}', event)">
            <i class="${isFavorite(item.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button class="share-btn" onclick="shareItem(vitaminsData.find(v => v.id === '${item.id}'), event)">
            <i class="fas fa-share-alt"></i>
        </button>
        <div class="card-header" onclick="openModal(vitaminsData.find(v => v.id === '${item.id}'))">
            <div class="card-icon">${item.icon}</div>
            <div class="card-title">
                <h2>${item.name}</h2>
                <p>${item.scientificName}</p>
            </div>
        </div>
        <span class="card-category ${item.category}">
            ${item.category === 'vitamins' ? 'فيتامين' : 'معدن'}
        </span>
        <div class="card-symptoms" onclick="openModal(vitaminsData.find(v => v.id === '${item.id}'))">
            <h3><i class="fas fa-exclamation-circle"></i> أعراض النقص:</h3>
            <ul>${symptomsHTML}</ul>
        </div>
        <div class="card-footer" onclick="openModal(vitaminsData.find(v => v.id === '${item.id}'))">
            <span class="view-more">
                عرض التفاصيل <i class="fas fa-arrow-left"></i>
            </span>
            <div class="severity-indicator">
                ${severityDots}
            </div>
        </div>
    `;
    
    return card;
}

// Open modal with detailed information
function openModal(item) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    const detailedSymptomsHTML = item.detailedSymptoms.map(symptom => `<li>${symptom}</li>`).join('');
    const sourcesHTML = item.sources.map(source => 
        `<span class="source-tag"><i class="fas fa-check"></i> ${source}</span>`
    ).join('');
    const riskGroupsHTML = item.riskGroups.map(group => `<li>${group}</li>`).join('');
    
    const favoriteButtonText = isFavorite(item.id) ? 
        '<i class="fas fa-heart"></i> إزالة من المفضلة' : 
        '<i class="far fa-heart"></i> إضافة للمفضلة';
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon">${item.icon}</div>
            <h2>${item.name}</h2>
            <p>${item.scientificName}</p>
        </div>
        
        <div class="modal-section">
            <h3><i class="fas fa-exclamation-triangle"></i> الأعراض التفصيلية لنقص ${item.name}</h3>
            <ul>${detailedSymptomsHTML}</ul>
        </div>
        
        <div class="modal-section">
            <h3><i class="fas fa-utensils"></i> المصادر الغذائية</h3>
            <div class="sources-list">
                ${sourcesHTML}
            </div>
        </div>
        
        <div class="modal-section">
            <h3><i class="fas fa-calculator"></i> الاحتياج اليومي</h3>
            <p style="font-size: 1.1rem; color: #667eea; font-weight: 600;">${item.dailyRequirement}</p>
        </div>
        
        <div class="modal-section">
            <h3><i class="fas fa-users"></i> الفئات الأكثر عرضة للنقص</h3>
            <ul>${riskGroupsHTML}</ul>
        </div>
        
        <div class="modal-actions">
            <button class="modal-action-btn primary" onclick="toggleFavoriteFromModal('${item.id}')">
                ${favoriteButtonText}
            </button>
            <button class="modal-action-btn secondary" onclick="shareItem(vitaminsData.find(v => v.id === '${item.id}'))">
                <i class="fas fa-share-alt"></i> مشاركة
            </button>
        </div>
        
        <div class="warning-box">
            <h4><i class="fas fa-info-circle"></i> تنبيه مهم</h4>
            <p>إذا كنت تعاني من أي من هذه الأعراض، يُرجى استشارة الطبيب لإجراء الفحوصات اللازمة. لا تتناول المكملات الغذائية دون استشارة طبية.</p>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Toggle favorite from modal
function toggleFavoriteFromModal(itemId) {
    toggleFavorite(itemId);
    // Refresh modal
    const item = vitaminsData.find(v => v.id === itemId);
    openModal(item);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        renderVitaminCards(activeFilter, searchTerm);
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            const searchTerm = searchInput.value.trim();
            renderVitaminCards(filter, searchTerm);
        });
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Favorites button
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', function() {
            const favFilter = document.querySelector('.filter-btn[data-filter="favorites"]');
            if (favFilter) {
                favFilter.click();
            }
        });
    }
    
    // Modal close button
    const closeBtn = document.getElementById('closeModal');
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    const modal = document.getElementById('detailModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}
