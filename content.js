// UM5 Notes Calculator Content Script
(function() {
    'use strict';

    // Configuration
    const EXTENSION_ID = 'um5-notes-calculator';
    const HIGHLIGHT_COLOR = '#4CAF50';
    const TEXT_COLOR = '#ffffff';

    // Function to check if we're on the notes page
    function isNotesPage() {
        return document.querySelector('table.table-bordered') && 
               document.querySelector('h6') && 
               document.querySelector('h6').textContent.includes('Notes et résultats');
    }

    // Function to parse notes from the table
    function parseNotesData() {
        const table = document.querySelector('table.table-bordered tbody');
        if (!table) return null;

        const rows = Array.from(table.querySelectorAll('tr'));
        const modules = [];
        let currentModule = null;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                const moduleName = cells[0].textContent.trim();
                const moduleType = cells[1].textContent.trim();
                const session1Note = cells[2].textContent.trim();
                const session1Result = cells[4].textContent.trim();
                const session2Note = cells[5].textContent.trim();
                const session2Result = cells[7].textContent.trim();

                // Check if this is a MO (Module) row
                if (moduleType === 'MO') {
                    currentModule = {
                        name: moduleName,
                        type: moduleType,
                        session1Note: parseFloat(session1Note) || 0,
                        session1Result: session1Result,
                        session2Note: parseFloat(session2Note) || 0,
                        session2Result: session2Result,
                        finalNote: 0,
                        isValid: false
                    };                    // Determine final note and validity
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
    }    // Function to calculate general average (including all modules, even non-validated ones)
    function calculateGeneralAverage(modules) {
        if (modules.length === 0) return 0;

        const sum = modules.reduce((total, module) => total + module.finalNote, 0);
        return (sum / modules.length).toFixed(2);
    }

    // Function to calculate semester averages
    function calculateSemesterAverages(modules) {
        const semester1Sum = modules.reduce((total, module) => total + module.session1Note, 0);
        const semester2Sum = modules.reduce((total, module) => {
            // Only include session 2 notes if they exist (not 0)
            return total + (module.session2Note || module.session1Note);
        }, 0);
        
        const semester1Average = modules.length > 0 ? (semester1Sum / modules.length).toFixed(2) : 0;
        const semester2Average = modules.length > 0 ? (semester2Sum / modules.length).toFixed(2) : 0;
        
        return {
            semester1: semester1Average,
            semester2: semester2Average
        };
    }    // Function to create and insert the general average display
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
        
        displayDiv.innerHTML = `
            <div class="calculator-header">
                <h4>📊 Moyennes Calculées</h4>
                <span class="extension-badge">Extension UM5</span>
            </div>
            <div class="averages-container">
                <div class="average-display main-average">
                    <span class="average-label">Moyenne Générale:</span>
                    <span class="average-value">${average}/20</span>
                </div>
                <div class="semester-averages">
                    <div class="average-display semester-average">
                        <span class="average-label">Moyenne Semestre 1:</span>
                        <span class="average-value">${semesterAverages.semester1}/20</span>
                    </div>
                    <div class="average-display semester-average">
                        <span class="average-label">Moyenne Semestre 2:</span>
                        <span class="average-value">${semesterAverages.semester2}/20</span>
                    </div>
                </div>
            </div>
            <div class="modules-summary">
                <div class="summary-item">
                    <span class="summary-label">Modules Validés:</span>
                    <span class="summary-value valid">${validModules.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Modules Non Validés:</span>
                    <span class="summary-value invalid">${invalidModules.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Modules:</span>
                    <span class="summary-value">${modules.length}</span>
                </div>
            </div>
            <div class="calculation-details">
                <button class="toggle-details">Voir les détails</button>
                <div class="details-content" style="display: none;">
                    <h5>Tous les modules inclus dans le calcul:</h5>
                    <div class="modules-list">
                        <div class="valid-modules">
                            <h6>✅ Modules Validés:</h6>
                            <ul>
                                ${validModules.map(module => 
                                    `<li><span class="module-name">${module.name}:</span> <span class="module-note">${module.finalNote}/20</span></li>`
                                ).join('')}
                            </ul>
                        </div>
                        ${invalidModules.length > 0 ? `
                            <div class="invalid-modules">
                                <h6>❌ Modules Non Validés (inclus dans le calcul):</h6>
                                <ul>
                                    ${invalidModules.map(module => 
                                        `<li><span class="module-name">${module.name}:</span> <span class="module-note">${module.finalNote}/20</span></li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    <div class="calculation-note">
                        <p><strong>Note:</strong> Tous les modules (validés et non validés) sont inclus dans le calcul de la moyenne générale.</p>
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
                toggleButton.textContent = 'Masquer les détails';
            } else {
                detailsContent.style.display = 'none';
                toggleButton.textContent = 'Voir les détails';
            }
        });

        // Insert the display after the table
        const table = document.querySelector('table.table-bordered');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(displayDiv, table.nextSibling);
        }
    }

    // Main function to run the calculator
    function runCalculator() {
        if (!isNotesPage()) {
            return;
        }

        const modules = parseNotesData();
        if (!modules || modules.length === 0) {
            console.log('No modules found');
            return;
        }        const generalAverage = calculateGeneralAverage(modules);
        const semesterAverages = calculateSemesterAverages(modules);
        displayGeneralAverage(generalAverage, modules, semesterAverages);
        
        console.log(`UM5 Notes Calculator: Calculated average = ${generalAverage}`);
        console.log('Modules analyzed:', modules);
    }

    // Run the calculator when the page loads
    function init() {
        // Run immediately if page is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runCalculator);
        } else {
            runCalculator();
        }

        // Also run when navigating (for SPA-like behavior)
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(runCalculator, 1000); // Delay to ensure page is loaded
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Initialize the extension
    init();
})();
