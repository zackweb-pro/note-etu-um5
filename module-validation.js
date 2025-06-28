// Module Validation Helper Functions for UM5 Notes Calculator
// This file contains additional functions to calculate points needed to validate modules

// Function to calculate element weights within a module
function calculateElementWeights(module) {
    if (!module.elements || module.elements.length === 0) {
        return;
    }

    const elements = module.elements;
    const moduleNote = module.finalNote;
    
    // First, determine the calculated grade for each element (based on session)
    elements.forEach(element => {
        // Determine which note to use based on module status
        if (module.session1Result === 'Rattrapage' || module.session1Result === 'Ajourné') {
            element.calculatedNote = element.session2Note || element.session1Note;
        } else {
            element.calculatedNote = element.session1Note;
        }
    });
    
    // Default to equal weights
    const equalWeight = 1 / elements.length;
    elements.forEach(element => {
        element.weight = equalWeight;
    });
    
    // Try to mathematically derive weights from the available data
    // This is only possible if we have both element notes and final module note
    if (elements.length >= 2 && moduleNote > 0) {
        // For 2 elements, we can solve for weights directly
        if (elements.length === 2) {
            // The equation is: w1*n1 + w2*n2 = moduleNote, where w1 + w2 = 1
            // Solve for w1: w1 = (moduleNote - n2) / (n1 - n2)
            const n1 = elements[0].calculatedNote;
            const n2 = elements[1].calculatedNote;
            
            if (Math.abs(n1 - n2) > 0.01) { // Avoid division by zero or near-zero
                let w1 = (moduleNote - n2) / (n1 - n2);
                
                // Check if the calculated weight makes sense
                // If not, it's likely that the module uses equal weights
                if (w1 >= 0 && w1 <= 1) {
                    const w2 = 1 - w1;
                    elements[0].weight = w1;
                    elements[1].weight = w2;
                }
            }
        }
        // For 3+ elements, we can still try to estimate weights, but with less certainty
        else if (elements.length === 3) {
            // Try different weight combinations and select the one that gets closest to the module note
            const weightSets = [
                [0.34, 0.33, 0.33], // Nearly equal
                [0.4, 0.3, 0.3],    // First element weighted higher
                [0.5, 0.3, 0.2],    // Strongly weighted toward first
                [0.3, 0.4, 0.3],    // Middle element weighted higher
                [0.3, 0.5, 0.2],    // Strongly weighted toward middle
                [0.3, 0.3, 0.4],    // Last element weighted higher
                [0.2, 0.3, 0.5]     // Strongly weighted toward last
            ];
            
            let bestDiff = Infinity;
            let bestWeights = null;
            
            // Find the weight set that produces a grade closest to the actual module grade
            for (const weights of weightSets) {
                let calculatedGrade = 0;
                for (let i = 0; i < elements.length; i++) {
                    calculatedGrade += elements[i].calculatedNote * weights[i];
                }
                
                const diff = Math.abs(calculatedGrade - moduleNote);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestWeights = weights;
                }
            }
            
            // If we found a good match (within reasonable error margin)
            if (bestDiff < 0.5 && bestWeights) {
                for (let i = 0; i < elements.length; i++) {
                    elements[i].weight = bestWeights[i];
                }
            }
        }
    }
    
    // For any module type, perform a validation check:
    // Calculate what the module grade would be with our current weights
    const calculatedModuleGrade = elements.reduce((sum, element) => 
        sum + (element.calculatedNote * element.weight), 0);
    
    // If our calculation is significantly off from the actual module grade,
    // it likely means the module actually uses equal weights
    const gradeDifference = Math.abs(calculatedModuleGrade - moduleNote);
    if (gradeDifference > 0.5) {
        // Reset to equal weights
        elements.forEach(element => {
            element.weight = equalWeight;
        });
    }
    
    // Assign normalized weights (should sum to 1)
    const totalWeight = elements.reduce((sum, el) => sum + el.weight, 0);
    
    if (totalWeight > 0) {
        elements.forEach(element => {
            element.normalizedWeight = element.weight / totalWeight;
        });
    } else {
        // Fallback to equal weights if something went wrong
        elements.forEach(element => {
            element.normalizedWeight = equalWeight;
        });
    }
}

// Function to calculate points needed to validate a module
function calculatePointsNeeded(module) {
    // If module is already validated, no points needed
    if (module.isValid || module.finalNote >= 12) {
        return 0;
    }

    // Calculate how many points are needed to reach 12
    let pointsNeeded = 12 - module.finalNote;
    
    // If we don't have elements, return the total points needed
    if (!module.elements || module.elements.length === 0) {
        return pointsNeeded;
    }
    
    // Calculate weights if not already done
    calculateElementWeights(module);
    
    // Calculate current contributions and initial state
    const elements = module.elements;
    elements.forEach(element => {
        element.contributionToModule = element.normalizedWeight * element.calculatedNote;
        element.pointsToAdd = 0; // Initialize
    });
    
    // Calculate the maximum possible grade with optimal improvements
    let maxPossibleGrade = module.finalNote;
    elements.forEach(element => {
        if (element.calculatedNote < 20) {
            const maxImprovement = (20 - element.calculatedNote) * element.normalizedWeight;
            maxPossibleGrade += maxImprovement;
        }
    });
    
    // If even with maximum improvements we can't reach 12, adjust expectations
    if (maxPossibleGrade < 12) {
        // In this case, we aim for the maximum possible grade
        pointsNeeded = maxPossibleGrade - module.finalNote;
    }
    
    // Use a simulated approach to find the most efficient distribution of points
    // Define a simulation function that tries different point allocations
    function simulatePointAllocation() {
        const strategies = [];
        
        // Strategy 3: Optimize for minimum total points added (now our primary strategy)
        const strategy3 = simulateMinTotalPoints();
        strategies.push(strategy3);
        
        // Strategy 1: Prioritize lowest grades first, especially below 5
        const strategy1 = simulateLowScoreFirst();
        strategies.push(strategy1);
        
        // Strategy 2: Prioritize highest-weighted elements first
        const strategy2 = simulateHighWeightFirst();
        strategies.push(strategy2);
        
        // Find best strategy (one that uses fewest points and distributes most sensibly)
        return findBestStrategy(strategies);
    }
    
    // Strategy 1: Focus on low scores first (especially below 5)
    function simulateLowScoreFirst() {
        const result = {
            elementPointsToAdd: {},
            totalPointsAdded: 0
        };
        
        // Sort elements by score (lowest first), then by weight (highest first)
        const sortedElements = [...elements].sort((a, b) => {
            // First prioritize elements below 5
            if (a.calculatedNote < 5 && b.calculatedNote >= 5) return -1;
            if (b.calculatedNote < 5 && a.calculatedNote >= 5) return 1;
            
            // Then sort by score
            if (a.calculatedNote !== b.calculatedNote)
                return a.calculatedNote - b.calculatedNote;
            
            // If scores are equal, prioritize by weight
            return b.normalizedWeight - a.normalizedWeight;
        });
        
        // Calculate how many points we need to add to the module
        let pointsStillNeeded = pointsNeeded;
        
        // First, ensure all elements have at least 5 points
        for (const element of sortedElements) {
            // Skip elements with score >= 12, as they don't need improvement
            if (element.calculatedNote >= 12) continue;
            
            if (element.calculatedNote < 5) {
                const pointsTo5 = 5 - element.calculatedNote;
                result.elementPointsToAdd[element.name] = pointsTo5;
                result.totalPointsAdded += pointsTo5;
                pointsStillNeeded -= pointsTo5 * element.normalizedWeight;
            }
        }
        
        // Then distribute remaining points optimally
        if (pointsStillNeeded > 0) {
            for (const element of sortedElements) {
                // Skip elements that already got points above or have score >= 12
                if (result.elementPointsToAdd[element.name] || element.calculatedNote >= 12) continue;
                
                // Calculate optimal points for this element
                const maxPointsPossible = 20 - element.calculatedNote;
                const pointsForElement = Math.min(
                    pointsStillNeeded / element.normalizedWeight,
                    maxPointsPossible
                );
                
                if (pointsForElement > 0) {
                    result.elementPointsToAdd[element.name] = pointsForElement;
                    result.totalPointsAdded += pointsForElement;
                    pointsStillNeeded -= pointsForElement * element.normalizedWeight;
                    
                    if (pointsStillNeeded <= 0) break;
                }
            }
        }
        
        return result;
    }
    
    // Strategy 2: Prioritize highest-weighted elements first
    function simulateHighWeightFirst() {
        const result = {
            elementPointsToAdd: {},
            totalPointsAdded: 0
        };
        
        // Sort elements by weight (highest first)
        const sortedElements = [...elements].sort((a, b) => 
            b.normalizedWeight - a.normalizedWeight
        );
        
        // Calculate how many points we need to add to the module
        let pointsStillNeeded = pointsNeeded;
        
        // Distribute points based on weight
        for (const element of sortedElements) {
            // Skip elements with score >= 12, as they don't need improvement
            if (element.calculatedNote >= 12) continue;
            
            // Calculate how many points to add (maximal impact)
            const maxPointsPossible = 20 - element.calculatedNote;
            const pointsForElement = Math.min(
                pointsStillNeeded / element.normalizedWeight,
                maxPointsPossible
            );
            
            // Ensure we're adding at least enough to get to 5 if below
            const minimumPoints = element.calculatedNote < 5 ? 
                Math.max(pointsForElement, 5 - element.calculatedNote) : 
                pointsForElement;
            
            if (minimumPoints > 0) {
                result.elementPointsToAdd[element.name] = minimumPoints;
                result.totalPointsAdded += minimumPoints;
                pointsStillNeeded -= minimumPoints * element.normalizedWeight;
                
                if (pointsStillNeeded <= 0) break;
            }
        }
        
        return result;
    }
    
    // Strategy 3: Minimize total points added while reaching validation
    function simulateMinTotalPoints() {
        const result = {
            elementPointsToAdd: {},
            totalPointsAdded: 0
        };
        
        // Filter out elements that already have scores >= 12
        const eligibleElements = elements.filter(e => e.calculatedNote < 12);
        
        // If no eligible elements remain, return empty result
        if (eligibleElements.length === 0) {
            return result;
        }
        
        // First ensure all elements have at least 5 points (this is a prerequisite)
        eligibleElements.forEach(element => {
            if (element.calculatedNote < 5) {
                const pointsTo5 = 5 - element.calculatedNote;
                result.elementPointsToAdd[element.name] = pointsTo5;
                result.totalPointsAdded += pointsTo5;
            }
        });
        
        // Calculate how many points we've already added for minimum grades of 5
        let moduleImprovementSoFar = 0;
        eligibleElements.forEach(element => {
            const pointsAdded = result.elementPointsToAdd[element.name] || 0;
            moduleImprovementSoFar += pointsAdded * element.normalizedWeight;
        });
        
        // Calculate how many more points we need to add to the module to reach 12
        let pointsStillNeeded = Math.max(0, pointsNeeded - moduleImprovementSoFar);
        
        // If we've already reached the goal, return current result
        if (pointsStillNeeded <= 0.01) {
            return result;
        }
        
        // For very small modules with 1-2 elements, we can use the simple approach
        if (eligibleElements.length <= 2) {
            // Sort by efficiency (weight/effort ratio)
            const sortedElements = [...eligibleElements].sort((a, b) => {
                const aEfficiency = a.normalizedWeight / (1 - a.normalizedWeight);
                const bEfficiency = b.normalizedWeight / (1 - b.normalizedWeight);
                return bEfficiency - aEfficiency; // Most efficient first
            });
            
            // Add points to the most efficient element
            const bestElement = sortedElements[0];
            const maxPointsPossible = 20 - bestElement.calculatedNote;
            const pointsForElement = Math.min(
                pointsStillNeeded / bestElement.normalizedWeight,
                maxPointsPossible
            );
            
            const currentPoints = result.elementPointsToAdd[bestElement.name] || 0;
            result.elementPointsToAdd[bestElement.name] = currentPoints + pointsForElement;
            result.totalPointsAdded += pointsForElement;
            
            return result;
        }
        
        // For 3+ elements, try all possible combinations to find the most optimal
        // First, create a set of possible point increments for each element
        const possibleIncrements = {};
        const maxIncrements = 4; // Limit to keep the search space manageable
        
        eligibleElements.forEach(element => {
            // Skip elements that already have improvements to 5
            const currentPoints = result.elementPointsToAdd[element.name] || 0;
            const maxAdditional = 20 - (element.calculatedNote + currentPoints);
            
            if (maxAdditional <= 0) return;
            
            // Create array of possible point increments
            const increments = [];
            const stepSize = maxAdditional / maxIncrements;
            
            for (let i = 0; i <= maxIncrements; i++) {
                const increment = Math.min(i * stepSize, maxAdditional);
                increments.push(increment);
            }
            
            possibleIncrements[element.name] = increments;
        });
        
        // Find the best combination using a greedy approach
        let bestCombination = null;
        let minTotalPoints = Infinity;
        
        // Helper function to recursively try combinations
        function tryAllCombinations(elementIndex, currentCombination, totalPoints, moduleImprovement) {
            // Base case: we've assigned points to all elements
            if (elementIndex >= eligibleElements.length) {
                // Check if this combination achieves the target
                if (moduleImprovement >= pointsStillNeeded && totalPoints < minTotalPoints) {
                    minTotalPoints = totalPoints;
                    bestCombination = {...currentCombination};
                }
                return;
            }
            
            const element = eligibleElements[elementIndex];
            const increments = possibleIncrements[element.name] || [0];
            const currentPoints = result.elementPointsToAdd[element.name] || 0;
            
            // Try each possible increment for this element
            for (const increment of increments) {
                currentCombination[element.name] = currentPoints + increment;
                const newTotal = totalPoints + increment;
                const newImprovement = moduleImprovement + (increment * element.normalizedWeight);
                
                // Optimistically prune branches that can't improve the best solution
                if (newTotal < minTotalPoints) {
                    tryAllCombinations(elementIndex + 1, currentCombination, newTotal, newImprovement);
                }
            }
            
            // Reset this element's points before backtracking
            delete currentCombination[element.name];
        }
        
        // Start the recursive search
        tryAllCombinations(0, {}, 0, 0);
        
        // Apply the best combination to our result
        if (bestCombination) {
            // Update the result with our optimized combination
            for (const [elementName, points] of Object.entries(bestCombination)) {
                const currentPoints = result.elementPointsToAdd[elementName] || 0;
                const additionalPoints = points - currentPoints;
                
                if (additionalPoints > 0) {
                    result.elementPointsToAdd[elementName] = points;
                    result.totalPointsAdded += additionalPoints;
                }
            }
        } else {
            // Fallback strategy if no optimal solution found
            // This uses the original approach as backup
            const sortedElements = [...eligibleElements].sort((a, b) => {
                const aEfficiency = a.normalizedWeight / 1;
                const bEfficiency = b.normalizedWeight / 1;
                return bEfficiency - aEfficiency; // Highest weight first
            });
            
            // Add points to elements in order of weight
            let remainingPoints = pointsStillNeeded;
            for (const element of sortedElements) {
                if (remainingPoints <= 0.01) break;
                
                const currentPoints = result.elementPointsToAdd[element.name] || 0;
                const maxAdditional = 20 - (element.calculatedNote + currentPoints);
                
                if (maxAdditional <= 0) continue;
                
                const additionalPoints = Math.min(
                    remainingPoints / element.normalizedWeight,
                    maxAdditional
                );
                
                if (additionalPoints > 0) {
                    result.elementPointsToAdd[element.name] = currentPoints + additionalPoints;
                    result.totalPointsAdded += additionalPoints;
                    remainingPoints -= additionalPoints * element.normalizedWeight;
                }
            }
        }
        
        return result;
    }
    
    // Choose the best strategy
    function findBestStrategy(strategies) {
        // Filter out invalid strategies (those that don't reach module validation)
        const validStrategies = strategies.filter(strategy => {
            // Calculate module grade after applying this strategy
            let totalGradeImprovement = 0;
            elements.forEach(element => {
                const pointsAdded = strategy.elementPointsToAdd[element.name] || 0;
                totalGradeImprovement += pointsAdded * element.normalizedWeight;
            });
            
            // Check if this strategy will validate the module
            return totalGradeImprovement >= pointsNeeded - 0.01; // Account for floating-point imprecision
        });
        
        if (validStrategies.length === 0) {
            // If no strategy was valid, use the first one (better than nothing)
            return strategies[0]; 
        }
        
        // Find strategy with minimum total points added
        const minPointsStrategy = validStrategies.reduce((best, current) => 
            current.totalPointsAdded < best.totalPointsAdded ? current : best, validStrategies[0]);
        
        // If multiple strategies use the same number of points, prefer the one that
        // distributes points across more elements (more balanced approach)
        const equalPointStrategies = validStrategies.filter(
            s => Math.abs(s.totalPointsAdded - minPointsStrategy.totalPointsAdded) < 0.01
        );
        
        if (equalPointStrategies.length > 1) {
            return equalPointStrategies.reduce((best, current) => {
                const currentCount = Object.keys(current.elementPointsToAdd).length;
                const bestCount = Object.keys(best.elementPointsToAdd).length;
                
                // If one strategy uses more elements, prefer it
                if (currentCount !== bestCount) {
                    return currentCount > bestCount ? current : best;
                }
                
                // If they use the same number of elements, prefer the one with more balanced distribution
                // (lower standard deviation of point additions)
                const currentPoints = Object.values(current.elementPointsToAdd);
                const bestPoints = Object.values(best.elementPointsToAdd);
                
                const currentStdDev = standardDeviation(currentPoints);
                const bestStdDev = standardDeviation(bestPoints);
                
                return currentStdDev < bestStdDev ? current : best;
            }, equalPointStrategies[0]);
        }
        
        return minPointsStrategy;
    }
    
    // Helper function to calculate standard deviation
    function standardDeviation(values) {
        if (values.length <= 1) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    // Run simulation to find best point allocation
    const bestStrategy = simulatePointAllocation();
    
    // Apply the best strategy to our elements
    for (const element of elements) {
        const pointsToAdd = bestStrategy.elementPointsToAdd[element.name] || 0;
        element.pointsToAdd = pointsToAdd;
        element.potentialContribution = element.normalizedWeight * (element.calculatedNote + pointsToAdd);
    }
    
    // Return total points needed for validation
    return pointsNeeded;
}

// Function to create tooltip with validation info
function createValidationTooltip(element, module) {
    if (!element.pointsToAdd) return '';
    
    // Calculate potential new grade
    const newGrade = (element.calculatedNote + element.pointsToAdd).toFixed(1);
    
    // Calculate the change in module grade this would contribute
    const moduleImprovement = (element.potentialContribution - element.contributionToModule).toFixed(2);
    
    // Calculate a confidence indicator for the weight estimation
    let confidenceText = "";
    
    // If we have exactly 2 elements, the math is more reliable
    if (module.elements.length === 2) {
        // Check if elements have very different weights (indicating non-equal weights)
        const weightDiff = Math.abs(module.elements[0].normalizedWeight - module.elements[1].normalizedWeight);
        if (weightDiff < 0.1) {
            confidenceText = "Coefficients égaux (haute confiance)";
        } else {
            confidenceText = "Coefficients variables (confiance moyenne)"; 
        }
    } else {
        // For 3+ elements, show lower confidence
        confidenceText = "Estimation des coefficients";
    }
    
    // Calculate "efficiency" of points added to this element
    const efficiency = element.normalizedWeight / 1;
    const efficiencyPercentage = Math.round(efficiency * 100);
    
    // Calculate how much this element contributes to total module improvement
    const totalPointsAdded = module.elements.reduce((sum, el) => sum + (el.pointsToAdd || 0), 0);
    const contributionPercentage = totalPointsAdded > 0 
        ? Math.round((element.pointsToAdd / totalPointsAdded) * 100) 
        : 0;
    
    return `
        <div class="validation-tooltip">
            <div class="tooltip-row">Note actuelle: <strong>${element.calculatedNote.toFixed(1)}/20</strong></div>
            <div class="tooltip-row">Poids estimé: <strong>${Math.round(element.normalizedWeight * 100)}%</strong></div>
            <div class="tooltip-row confidence-text">${confidenceText}</div>
            <div class="tooltip-row">Contribution actuelle: <strong>${element.contributionToModule.toFixed(2)} points</strong></div>
            <div class="tooltip-row">Points à ajouter: <strong>${Math.ceil(element.pointsToAdd * 10) / 10}</strong></div>
            <div class="tooltip-row">Nouvelle note: <strong>${newGrade}/20</strong></div>
            <div class="tooltip-row">Impact sur le module: <strong>+${moduleImprovement} points</strong></div>
            <div class="tooltip-row">Efficacité: <strong>${efficiencyPercentage}%</strong> (impact/point)</div>
        </div>
    `;
}

// Function to apply validation indicators to element rows
function applyValidationIndicators(modules) {
    const table = document.querySelector('table.table-bordered tbody');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    let currentModuleIndex = -1;
    let currentModule = null;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) {
            const moduleType = cells[1].textContent.trim();
            const moduleName = cells[0].textContent.trim();
            
            // When we find a module row, update our current module reference
            if (moduleType === 'MO') {
                currentModuleIndex++;
                if (currentModuleIndex < modules.length) {
                    currentModule = modules[currentModuleIndex];
                    
                    // Only calculate points needed for non-validated modules
                    if (!currentModule.isValid && currentModule.finalNote < 12) {
                        calculatePointsNeeded(currentModule);
                    }
                }
            } 
            // When we find an element row, add validation indicators if needed
            else if (moduleType === 'EM' && currentModule && !currentModule.isValid && currentModule.finalNote < 12) {
                const element = currentModule.elements.find(e => e.name === moduleName);
                if (element && element.pointsToAdd > 0) {
                    // Create indicator element
                    const indicatorDiv = document.createElement('div');
                    indicatorDiv.className = 'validation-indicator';
                    indicatorDiv.innerHTML = `
                        <span class="points-badge">+${Math.ceil(element.pointsToAdd * 10) / 10}</span>
                        ${createValidationTooltip(element, currentModule)}
                    `;
                    
                    // Add to the row
                    const noteCell = cells[2]; // Session 1 note cell
                    noteCell.style.position = 'relative';
                    noteCell.appendChild(indicatorDiv);
                }
            }
        }
    });
}
