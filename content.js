// UM5 Notes Calculator Content Script
(function() {
    'use strict';

    // Configuration
    const EXTENSION_ID = 'um5-notes-calculator';
    const HIGHLIGHT_COLOR = '#4CAF50';
    const TEXT_COLOR = '#ffffff';
    
    // Extension state
    let isExtensionActive = true;
    
    // Load extension state from storage
    function loadExtensionState() {
        chrome.storage.sync.get(['extensionActive'], function(result) {
            isExtensionActive = result.extensionActive !== false; // Default to true
            if (isExtensionActive && isNotesPage()) {
                runCalculator();
            } else {
                removeExistingDisplay();
            }
        });
    }// Function to check if we're on the notes page
    function isNotesPage() {
        // Check if we're on the UM5 domain and have the right page elements
        const isUM5Domain = window.location.hostname === 'etu.um5.ac.ma';
        const hasNotesTable = document.querySelector('table.table-bordered');
        const hasNotesTitle = document.querySelector('h6') && 
                             document.querySelector('h6').textContent.includes('Notes et résultats');
        
        return isUM5Domain && hasNotesTable && hasNotesTitle;
    }    // Function to parse notes from the table
    function parseNotesData() {
        const table = document.querySelector('table.table-bordered tbody');
        if (!table) return null;

        const rows = Array.from(table.querySelectorAll('tr'));
        const modules = [];
        let currentModule = null;
        let currentSemester = null;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                const moduleName = cells[0].textContent.trim();
                const moduleType = cells[1].textContent.trim();
                const session1Note = cells[2].textContent.trim();
                const session1Result = cells[4].textContent.trim();
                const session2Note = cells[5].textContent.trim();
                const session2Result = cells[7].textContent.trim();

                // Check if this is a semester row (SE01, SE02, etc.)
                if (moduleType.startsWith('SE0')) {
                    currentSemester = moduleType;
                    return; // Skip to next row
                }

                // Check if this is a MO (Module) row
                if (moduleType === 'MO') {
                    currentModule = {
                        name: moduleName,
                        type: moduleType,
                        semester: currentSemester, // Add semester information
                        session1Note: parseFloat(session1Note) || 0,
                        session1Result: session1Result,
                        session2Note: parseFloat(session2Note) || 0,
                        session2Result: session2Result,
                        finalNote: 0,
                        isValid: false
                    };

                    // Determine final note and validity
                    if (session1Result === 'Validé') {
                        currentModule.finalNote = currentModule.session1Note;
                        currentModule.isValid = true;
                    } else if (session1Result === 'Rattrapage' && session2Result === 'Validé') {
                        currentModule.finalNote = currentModule.session2Note;
                        currentModule.isValid = true;
                    } else if (session1Result === 'Rattrapage' && session2Result === 'Non Validé') {
                        currentModule.finalNote = currentModule.session2Note;
                        currentModule.isValid = false;
                    } else if (session1Result === 'Ajourné' && session2Result === 'Admis') {
                        currentModule.finalNote = currentModule.session2Note;
                        currentModule.isValid = true;
                    } else if (session1Result === 'Ajourné' && session2Result) {
                        currentModule.finalNote = currentModule.session2Note;
                        currentModule.isValid = false;
                    } else {
                        // Default to session 1 note
                        currentModule.finalNote = currentModule.session1Note;
                        currentModule.isValid = session1Result === 'Validé';
                    }

                    modules.push(currentModule);
                }
            }
        });

        return modules;
    }// Function to calculate general average (including all modules, even non-validated ones)
    function calculateGeneralAverage(modules) {
        if (modules.length === 0) return 0;

        const sum = modules.reduce((total, module) => total + module.finalNote, 0);
        return (sum / modules.length).toFixed(2);
    }    // Function to calculate semester averages
    function calculateSemesterAverages(modules) {
        // Group modules by semester
        const semesterGroups = {};
        
        modules.forEach(module => {
            if (module.semester) {
                if (!semesterGroups[module.semester]) {
                    semesterGroups[module.semester] = [];
                }
                semesterGroups[module.semester].push(module);
            }
        });

        const semesterAverages = {};
        
        // Calculate average for each semester
        Object.keys(semesterGroups).forEach(semester => {
            const semesterModules = semesterGroups[semester];
            if (semesterModules.length > 0) {
                const sum = semesterModules.reduce((total, module) => total + module.finalNote, 0);
                semesterAverages[semester] = (sum / semesterModules.length).toFixed(2);
            }
        });

        return {
            semesterGroups: semesterGroups,
            averages: semesterAverages
        };
    }// Function to create and insert the general average display
    function displayGeneralAverage(average, modules, semesterAverages) {
        // Remove existing display if present
        const existingDisplay = document.querySelector(`#${EXTENSION_ID}-display`);
        if (existingDisplay) {
            existingDisplay.remove();
        }

        // Create the display element
        const displayDiv = document.createElement('div');
        displayDiv.id = `${EXTENSION_ID}-display`;
        displayDiv.className = 'um5-notes-calculator';        const validModules = modules.filter(module => module.isValid);
        const invalidModules = modules.filter(module => !module.isValid);        displayDiv.innerHTML = `
            <div class="calculator-header">
                <h4><i class="fas fa-chart-line"></i> Moyennes Calculées</h4>
                <span class="extension-badge"><i class="fas fa-university"></i> Extension UM5</span>
            </div>
            <div class="averages-container">
                <div class="average-display main-average">
                    <span class="average-label"><i class="fas fa-trophy"></i> Moyenne Générale:</span>
                    <span class="average-value">${average}/20</span>
                </div>
                <div class="semester-averages">
                    ${Object.keys(semesterAverages.averages).map(semester => `
                        <div class="average-display semester-average">
                            <span class="average-label"><i class="fas fa-calendar-alt"></i> Moyenne ${semester}:</span>
                            <span class="average-value">${semesterAverages.averages[semester]}/20</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modules-summary">
                <div class="summary-item">
                    <span class="summary-label"><i class="fas fa-check-circle"></i> Modules Validés:</span>
                    <span class="summary-value valid">${validModules.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label"><i class="fas fa-times-circle"></i> Modules Non Validés:</span>
                    <span class="summary-value invalid">${invalidModules.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label"><i class="fas fa-book"></i> Total Modules:</span>
                    <span class="summary-value">${modules.length}</span>
                </div>
            </div>            <div class="calculation-details">
                <button class="toggle-details"><i class="fas fa-info-circle"></i> Voir les détails</button>
                <div class="details-content" style="display: none;">
                    <h5><i class="fas fa-list-alt"></i> Tous les modules inclus dans le calcul:</h5>
                    <div class="modules-list">
                        ${Object.keys(semesterAverages.semesterGroups).map(semester => `
                            <div class="semester-modules">
                                <h6><i class="fas fa-graduation-cap"></i> ${semester} (Moyenne: ${semesterAverages.averages[semester]}/20):</h6>
                                <ul>
                                    ${semesterAverages.semesterGroups[semester].map(module => 
                                        `<li>
                                            <span class="module-name">${module.name}:</span> 
                                            <span class="module-note ${module.isValid ? 'valid' : 'invalid'}">${module.finalNote}/20</span>
                                            <i class="fas ${module.isValid ? 'fa-check-circle' : 'fa-times-circle'}" style="color: ${module.isValid ? '#10b981' : '#ef4444'}; margin-left: 8px;"></i>
                                        </li>`
                                    ).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
        
                </div>
            </div>
        `;

        // Add event listener for toggle details
        const toggleButton = displayDiv.querySelector('.toggle-details');
        const detailsContent = displayDiv.querySelector('.details-content');
          toggleButton.addEventListener('click', () => {
            if (detailsContent.style.display === 'none') {
                detailsContent.style.display = 'block';
                toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i> Masquer les détails';
            } else {
                detailsContent.style.display = 'none';
                toggleButton.innerHTML = '<i class="fas fa-info-circle"></i> Voir les détails';
            }
        });

        // Insert the display after the table
        const table = document.querySelector('table.table-bordered');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(displayDiv, table.nextSibling);
        }
    }

    // Function to remove existing display
    function removeExistingDisplay() {
        const existingDisplay = document.querySelector(`#${EXTENSION_ID}-display`);
        if (existingDisplay) {
            existingDisplay.remove();
        }
    }    // Main function to run the calculator
    function runCalculator() {
        if (!isExtensionActive || !isNotesPage()) {
            return;
        }

        const modules = parseNotesData();
        if (!modules || modules.length === 0) {
            console.log('No modules found');
            return;
        }

        const generalAverage = calculateGeneralAverage(modules);
        const semesterAverages = calculateSemesterAverages(modules);
        displayGeneralAverage(generalAverage, modules, semesterAverages);
        
        console.log(`UM5 Notes Calculator: Calculated average = ${generalAverage}`);
        console.log('Modules analyzed:', modules);
    }    // Run the calculator when the page loads
    function init() {
        // Load extension state first
        loadExtensionState();

        // Also run when navigating (for SPA-like behavior)
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(() => {
                    if (isExtensionActive) {
                        runCalculator();
                    }
                }, 1000); // Delay to ensure page is loaded
            }
        }).observe(document, { subtree: true, childList: true });
    }    // Message listener for popup communication
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "checkPage") {
            sendResponse({isNotesPage: isNotesPage()});
        } else if (request.action === "toggleExtension") {
            isExtensionActive = request.isActive;
            if (isExtensionActive) {
                runCalculator();
            } else {
                removeExistingDisplay();
            }
        } else if (request.action === "runCalculator") {
            if (isExtensionActive) {
                runCalculator();
            }
        }
        return true;
    });

    // Initialize the extension
    init();
})();
