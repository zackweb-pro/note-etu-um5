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
                        isValid: false,
                        elements: [] // Add array to store elements
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
                // Handle Element (EM) rows
                else if (moduleType === 'EM' && currentModule) {
                    const element = {
                        name: moduleName,
                        type: moduleType,
                        session1Note: parseFloat(session1Note) || 0,
                        session1Result: session1Result,
                        session2Note: parseFloat(session2Note) || 0,
                        session2Result: session2Result,
                        // We'll calculate the weight and points needed later
                    };
                    
                    currentModule.elements.push(element);
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
        displayDiv.className = 'um5-notes-calculator';
        
        const validModules = modules.filter(module => module.isValid);
        const invalidModules = modules.filter(module => !module.isValid);
        
        // Determine if student is Admis or Ajourné
        const studentStatus = determineStatus(average, modules.length, invalidModules.length);
        
        displayDiv.innerHTML = `
            <div class="calculator-header">
                <h4><i class="fas fa-chart-line"></i> Moyennes Calculées</h4>
                <span class="extension-badge"><i class="fas fa-university"></i> Extension UM5</span>
            </div>
            
            <div class="averages-container">
                <div class="average-display main-average">
                    <span class="average-label"><i class="fas fa-trophy"></i> Moyenne Générale:</span>
                    <span class="average-value ${getAverageColorClass(average)}">${average}/20</span>
                </div>
                <div class="semester-averages">
                    ${Object.keys(semesterAverages.averages).map(semester => `
                        <div class="average-display semester-average">
                            <span class="average-label"><i class="fas fa-calendar-alt"></i> Moyenne ${semester}:</span>
                            <span class="average-value ${getAverageColorClass(semesterAverages.averages[semester])}">${semesterAverages.averages[semester]}/20</span>
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
            </div>
            
            <div class="status-container">
                <div class="status-display">
                    <span class="status-label"><i class="fas fa-graduation-cap"></i> Statut:</span>
                    <span class="status-value ${studentStatus.isAdmis ? 'status-admis' : 'status-ajourne'}">${studentStatus.status}</span>
                </div>
                <div class="status-explanation">
                    <p><i class="fas fa-info-circle"></i> Pour être admis: Moyenne ≥ 12 et Modules Non Validés ≤ ${studentStatus.maxAllowedNonValidated} (1/4 du total)</p>
                </div>
            </div>
            
            <div class="calculation-details">
                <!-- <button class="toggle-details"><i class="fas fa-info-circle"></i> Voir les détails</button> -->
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
        // const toggleButton = displayDiv.querySelector('.toggle-details');
        // const detailsContent = displayDiv.querySelector('.details-content');
        //   toggleButton.addEventListener('click', () => {
        //     if (detailsContent.style.display === 'none') {
        //         detailsContent.style.display = 'block';
        //         toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i> Masquer les détails';
        //     } else {
        //         detailsContent.style.display = 'none';
        //         toggleButton.innerHTML = '<i class="fas fa-info-circle"></i> Voir les détails';
        //     }
        // });

        // Insert the display after the table
        const table = document.querySelector('table.table-bordered');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(displayDiv, table.nextSibling);
        }
    }    // Function to remove existing display
    function removeExistingDisplay() {
        const existingDisplay = document.querySelector(`#${EXTENSION_ID}-display`);
        if (existingDisplay) {
            existingDisplay.remove();
        }
        // Also remove highlighting from the table
        removeHighlighting();
    }// Function to highlight notes in the actual table
    function highlightNotesInTable(modules, generalAverage) {
        const table = document.querySelector('table.table-bordered tbody');
        if (!table) return;

        const rows = Array.from(table.querySelectorAll('tr'));
        let moduleIndex = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                const moduleType = cells[1].textContent.trim();                // Only highlight module (MO) rows
                if (moduleType === 'MO' && moduleIndex < modules.length) {
                    const module = modules[moduleIndex];
                    const session1NoteCell = cells[2];
                    const session2NoteCell = cells[5];
                    
                    // Get the actual note values from the table
                    const session1Note = parseFloat(cells[2].textContent.trim()) || 0;
                    const session2Note = parseFloat(cells[5].textContent.trim()) || 0;
                    const session1Result = cells[4].textContent.trim();
                    const session2Result = cells[7].textContent.trim();

                    // Determine which note was used as final note (same logic as in parseNotesData)
                    let usedNoteCell = null;
                    let usedNote = 0;

                    if (session1Result === 'Validé') {
                        usedNoteCell = session1NoteCell;
                        usedNote = session1Note;
                    } else if (session1Result === 'Rattrapage' && session2Result === 'Validé') {
                        usedNoteCell = session2NoteCell;
                        usedNote = session2Note;
                    } else if (session1Result === 'Rattrapage' && session2Result === 'Non Validé') {
                        usedNoteCell = session2NoteCell;
                        usedNote = session2Note;
                    } else if (session1Result === 'Ajourné' && session2Result === 'Admis') {
                        usedNoteCell = session2NoteCell;
                        usedNote = session2Note;
                    } else if (session1Result === 'Ajourné' && session2Result) {
                        usedNoteCell = session2NoteCell;
                        usedNote = session2Note;
                    } else {
                        // Default to session 1 note
                        usedNoteCell = session1NoteCell;
                        usedNote = session1Note;
                    }

                    // If the selected note is empty/0 but we expected session 2, fall back to session 1
                    if (usedNote === 0 && usedNoteCell === session2NoteCell && session1Note > 0) {
                        usedNoteCell = session1NoteCell;
                        usedNote = session1Note;
                    }

                    // Apply highlighting based on 12/20 threshold (passing grade)
                    if (usedNoteCell && usedNote > 0) {
                        // Remove any existing highlighting classes first
                        session1NoteCell.classList.remove('um5-note-above-average', 'um5-note-below-average');
                        session2NoteCell.classList.remove('um5-note-above-average', 'um5-note-below-average');

                        // Apply new highlighting class to the used note
                        if (usedNote >= 12) {
                            // Green for 12/20 or above (passing grade)
                            usedNoteCell.classList.add('um5-note-above-average');
                        } else {
                            // Red for below 12/20 (failing grade)
                            usedNoteCell.classList.add('um5-note-below-average');
                        }
                    }

                    moduleIndex++;
                }
            }
        });
    }    // Function to remove highlighting from the table
    function removeHighlighting() {
        const table = document.querySelector('table.table-bordered tbody');
        if (!table) return;

        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                const session1NoteCell = cells[2];
                const session2NoteCell = cells[5];

                // Remove highlighting classes from both note cells
                session1NoteCell.classList.remove('um5-note-above-average', 'um5-note-below-average');
                session2NoteCell.classList.remove('um5-note-above-average', 'um5-note-below-average');
            }
        });
    }// Function to get color class based on average value
    function getAverageColorClass(averageValue) {
        const numericValue = parseFloat(averageValue);
        return numericValue >= 12.0 ? 'average-passing' : 'average-failing';
    }
    
    // Function to determine if student is Admis or Ajourné
    function determineStatus(generalAverage, totalModules, nonValidatedModules) {
        const minimumAverage = 12.0;
        const maxAllowedNonValidated = Math.floor(totalModules / 4);
        
        // Student is Admis if average is at least 12 AND non-validated modules 
        // are not more than 1/4 of total modules
        const isAdmis = parseFloat(generalAverage) >= minimumAverage && 
                        nonValidatedModules <= maxAllowedNonValidated;
        
        return {
            status: isAdmis ? 'Admis' : 'Ajourné',
            isAdmis: isAdmis,
            maxAllowedNonValidated: maxAllowedNonValidated
        };
    }

    // Main function to run the calculator
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
        highlightNotesInTable(modules, generalAverage);
        
        // Apply validation indicators for non-validated modules
        applyValidationIndicators(modules);
        
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
