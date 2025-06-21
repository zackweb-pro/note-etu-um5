// UM5 Notes Calculator Popup Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize extension state
    let isExtensionActive = true;

    // DOM elements
    const statusText = document.getElementById('status-text');
    const toggleSwitch = document.getElementById('toggle-switch');
    const toggleLabel = document.getElementById('toggle-label');
    const extensionStatus = document.getElementById('extension-status');

    // Load saved state
    chrome.storage.sync.get(['extensionActive'], function(result) {
        isExtensionActive = result.extensionActive !== false; // Default to true
        updateUI();
    });

    // Toggle switch event listener
    toggleSwitch.addEventListener('click', function() {
        isExtensionActive = !isExtensionActive;
        
        // Save state
        chrome.storage.sync.set({extensionActive: isExtensionActive});
        
        // Update UI
        updateUI();
        
        // Notify content script of state change
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "toggleExtension",
                    isActive: isExtensionActive
                }).catch(() => {
                    // Handle error silently if content script is not available
                });
            }
        });
    });

    // Update UI based on state
    function updateUI() {
        if (isExtensionActive) {
            toggleSwitch.classList.add('active');
            toggleLabel.textContent = 'ON';
            extensionStatus.classList.remove('inactive');
            extensionStatus.classList.add('active');
            extensionStatus.innerHTML = '<span>🟢 Extension activée et prête à fonctionner</span>';
        } else {
            toggleSwitch.classList.remove('active');
            toggleLabel.textContent = 'OFF';
            extensionStatus.classList.remove('active');
            extensionStatus.classList.add('inactive');
            extensionStatus.innerHTML = '<span>🔴 Extension désactivée</span>';
        }
    }

    // Check page status
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || !tabs[0]) return;
        
        const currentUrl = tabs[0].url;
        
        if (currentUrl && currentUrl.includes('etu.um5.ac.ma')) {
            // We're on UM5 domain, check if it's the notes page
            chrome.tabs.sendMessage(tabs[0].id, {action: "checkPage"}, function(response) {
                if (chrome.runtime.lastError) {
                    statusText.textContent = 'Sur le domaine UM5';
                    document.querySelector('.status-icon').textContent = '🏛️';
                } else if (response && response.isNotesPage) {
                    statusText.textContent = 'Page de notes détectée';
                    document.querySelector('.status-icon').textContent = '📊';
                    // Trigger calculator if extension is active
                    if (isExtensionActive) {
                        chrome.tabs.sendMessage(tabs[0].id, {action: "runCalculator"}).catch(() => {
                            // Handle error silently
                        });
                    }
                } else {
                    statusText.textContent = 'Naviguez vers vos notes';
                    document.querySelector('.status-icon').textContent = '🔍';
                }
            });
        } else {
            statusText.textContent = 'Allez sur etu.um5.ac.ma';
            document.querySelector('.status-icon').textContent = '⚠️';
        }
    });
});
