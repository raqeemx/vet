// Calculator functionality
let selectedSymptoms = [];
let calculatorResults = [];

// Common symptoms mapped to vitamins
const symptomsDatabase = {
    'التعب والإرهاق المستمر': ['vitamin-d', 'vitamin-b12', 'iron', 'vitamin-c'],
    'ضعف المناعة والعدوى المتكررة': ['vitamin-c', 'vitamin-d', 'zinc', 'vitamin-a'],
    'تساقط الشعر': ['vitamin-b7', 'iron', 'zinc', 'vitamin-d'],
    'جفاف الجلد وتقشره': ['vitamin-a', 'vitamin-e', 'vitamin-c'],
    'آلام العظام والعضلات': ['vitamin-d', 'calcium', 'magnesium'],
    'شحوب الجلد': ['iron', 'vitamin-b12', 'vitamin-b9'],
    'ضعف الرؤية الليلية': ['vitamin-a'],
    'نزيف اللثة': ['vitamin-c', 'vitamin-k'],
    'تشقق الشفاه وزوايا الفم': ['vitamin-b2', 'vitamin-b6', 'iron'],
    'تنميل الأطراف': ['vitamin-b12', 'vitamin-b6', 'magnesium'],
    'الاكتئاب وتقلبات المزاج': ['vitamin-d', 'vitamin-b12', 'vitamin-b6', 'magnesium'],
    'ضيق التنفس': ['iron', 'vitamin-b12'],
    'هشاشة الأظافر': ['vitamin-b7', 'iron', 'calcium'],
    'صعوبة التركيز والذاكرة': ['vitamin-b12', 'vitamin-b6', 'iron', 'vitamin-d'],
    'التئام الجروح ببطء': ['vitamin-c', 'zinc', 'vitamin-a'],
    'الصداع المتكرر': ['vitamin-b2', 'magnesium', 'vitamin-d'],
    'تشنجات العضلات': ['magnesium', 'calcium', 'potassium'],
    'فقدان الشهية': ['zinc', 'vitamin-b1', 'vitamin-b3'],
    'الإمساك': ['magnesium', 'potassium'],
    'ضعف التذوق والشم': ['zinc'],
    'اضطراب نظم القلب': ['potassium', 'magnesium'],
    'برودة الأطراف': ['iron', 'vitamin-b12'],
    'التهاب اللسان': ['vitamin-b12', 'vitamin-b9', 'iron'],
    'ضعف العضلات': ['vitamin-d', 'vitamin-e', 'magnesium']
};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    loadDarkMode();
    generateSymptomsGrid();
    loadSavedResults();
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
});

// Generate symptoms grid
function generateSymptomsGrid() {
    const grid = document.getElementById('symptomsGrid');
    const symptoms = Object.keys(symptomsDatabase);
    
    symptoms.forEach(symptom => {
        const card = document.createElement('div');
        card.className = 'symptom-card';
        card.onclick = () => toggleSymptom(symptom, card);
        
        card.innerHTML = `
            <div class="symptom-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <div class="symptom-text">${symptom}</div>
        `;
        
        grid.appendChild(card);
    });
}

// Toggle symptom selection
function toggleSymptom(symptom, card) {
    card.classList.toggle('selected');
    
    if (selectedSymptoms.includes(symptom)) {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    } else {
        selectedSymptoms.push(symptom);
    }
}

// Navigate between steps
function goToStep(stepNumber) {
    if (stepNumber === 2 && selectedSymptoms.length === 0) {
        alert('الرجاء اختيار عرض واحد على الأقل');
        return;
    }
    
    // Hide all steps
    document.querySelectorAll('.calculator-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${(stepNumber / 3) * 100}%`;
    progressText.textContent = `الخطوة ${stepNumber} من 3`;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Calculate results
function calculateResults() {
    if (selectedSymptoms.length === 0) {
        alert('الرجاء اختيار أعراض أولاً');
        return;
    }
    
    // Count vitamin occurrences
    const vitaminCounts = {};
    
    selectedSymptoms.forEach(symptom => {
        const vitamins = symptomsDatabase[symptom];
        vitamins.forEach(vitamin => {
            vitaminCounts[vitamin] = (vitaminCounts[vitamin] || 0) + 1;
        });
    });
    
    // Sort by count and get top results
    const sortedVitamins = Object.entries(vitaminCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([vitaminId, count]) => {
            const vitamin = vitaminsData.find(v => v.id === vitaminId);
            const confidence = count / selectedSymptoms.length;
            return { vitamin, count, confidence };
        });
    
    calculatorResults = sortedVitamins;
    displayResults(sortedVitamins);
    goToStep(3);
}

// Display results
function displayResults(results) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#718096;">لم يتم العثور على نتائج واضحة. يُرجى استشارة الطبيب.</p>';
        return;
    }
    
    results.forEach(result => {
        const { vitamin, count, confidence } = result;
        const confidenceLevel = confidence >= 0.6 ? 'high' : confidence >= 0.3 ? 'medium' : 'low';
        const confidenceText = confidence >= 0.6 ? 'عالي' : confidence >= 0.3 ? 'متوسط' : 'منخفض';
        
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-header">
                <div class="result-icon">${vitamin.icon}</div>
                <div class="result-title">
                    <h3>${vitamin.name}</h3>
                    <p>${vitamin.scientificName}</p>
                </div>
                <span class="confidence-badge confidence-${confidenceLevel}">
                    احتمالية: ${confidenceText}
                </span>
            </div>
            <div class="result-body">
                <h4><i class="fas fa-exclamation-circle"></i> أعراض النقص المطابقة:</h4>
                <ul>
                    ${vitamin.symptoms.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                </ul>
                
                <h4><i class="fas fa-utensils"></i> المصادر الغذائية الموصى بها:</h4>
                <div class="food-tags">
                    ${vitamin.sources.slice(0, 4).map(s => `<span class="food-tag">${s}</span>`).join('')}
                </div>
                
                <h4><i class="fas fa-calculator"></i> الاحتياج اليومي:</h4>
                <p style="color: #667eea; font-weight: 600;">${vitamin.dailyRequirement}</p>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Save results
function saveResults() {
    const result = {
        date: new Date().toISOString(),
        symptoms: selectedSymptoms,
        results: calculatorResults.map(r => ({
            id: r.vitamin.id,
            name: r.vitamin.name,
            confidence: r.confidence
        }))
    };
    
    const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    history.unshift(result);
    
    // Keep only last 10 results
    if (history.length > 10) history.pop();
    
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    
    showNotification('تم حفظ النتائج بنجاح! ✅');
}

// Share results
async function shareResults() {
    const topResults = calculatorResults.slice(0, 3).map(r => r.vitamin.name).join('، ');
    
    const shareData = {
        title: 'نتائج حاسبة الفيتامينات',
        text: `بناءً على الأعراض، قد تحتاج إلى: ${topResults}`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
            showNotification('تم نسخ النتائج! 📋');
        }
    } catch (err) {
        console.log('Error sharing:', err);
    }
}

// Restart calculator
function restartCalculator() {
    selectedSymptoms = [];
    calculatorResults = [];
    
    // Reset selections
    document.querySelectorAll('.symptom-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset form
    document.querySelector('input[name="gender"][value="male"]').checked = true;
    document.getElementById('ageRange').value = 'adult';
    document.getElementById('dietType').value = 'normal';
    document.querySelector('input[name="sunExposure"][value="low"]').checked = true;
    
    goToStep(1);
}

// Load saved results
function loadSavedResults() {
    const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    
    if (history.length === 0) return;
    
    const container = document.getElementById('historyContainer');
    const savedSection = document.getElementById('savedResults');
    
    savedSection.style.display = 'block';
    
    history.forEach((item, index) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('ar-SA', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const div = document.createElement('div');
        div.className = 'history-item';
        div.onclick = () => viewHistoryItem(item);
        div.innerHTML = `
            <div class="history-date">${dateStr}</div>
            <div class="history-summary">
                ${item.results.length} نتيجة محتملة - ${item.symptoms.length} أعراض
            </div>
        `;
        
        container.appendChild(div);
    });
}

// View history item
function viewHistoryItem(item) {
    selectedSymptoms = item.symptoms;
    calculateResults();
}

// Dark mode functions
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
