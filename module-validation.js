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
        
        // Strategy 4: Balanced distribution across all elements (now our primary strategy)
        const strategy4 = simulateBalancedDistribution();
        strategies.push(strategy4);
        
        // Strategy 3: Optimize for minimum total points added
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
    
    // Strategy 4: Distribute points in a balanced way across all elements
    function simulateBalancedDistribution() {
        const result = {
            elementPointsToAdd: {},
            totalPointsAdded: 0
        };
        
        // Filter eligible elements (those with scores < 12)
        const eligibleElements = elements.filter(e => e.calculatedNote < 12);
        
        if (eligibleElements.length === 0) {
            return result;
        }
        
        // First, ensure all elements have at least 5 points (mandatory requirement)
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
        
        // Calculate how many more points we need to reach 12
        let pointsStillNeeded = Math.max(0, pointsNeeded - moduleImprovementSoFar);
        
        if (pointsStillNeeded <= 0.01) {
            return result;
        }
        
        // COMPLETELY BALANCED APPROACH: Ignore weights for distribution, focus on equity
        // Get elements that still need improvements
        const remainingElements = eligibleElements.filter(element => 
            (element.calculatedNote + (result.elementPointsToAdd[element.name] || 0)) < 12
        );
        
        if (remainingElements.length === 0) {
            return result;
        }
        
        // Calculate initial equal distribution of points (ignoring weights)
        // This will ensure that all elements receive improvements
        
        // Phase 1: Ultra-Equal Distribution - completely ignore weights
        const numElements = remainingElements.length;
        if (numElements > 0) {
            // First, detect if we have an uneven weight distribution
            const weights = remainingElements.map(e => e.normalizedWeight);
            const maxWeight = Math.max(...weights);
            const minWeight = Math.min(...weights);
            const weightDisparity = maxWeight / minWeight;
            // Detect if any element has a significantly higher weight (40% or similar)
            // Note: This works regardless of which element (first, middle, or last) has the high weight
            const hasHighWeightElement = maxWeight > 0.35;
            
            // ULTRA-BALANCED STRATEGY IMPLEMENTATION
            // If we have a high-weight element (like 40%), use an ultra-balanced approach
            // to force distributing points to lower-weighted elements
            // This is the key innovation to ensure proper balance even with extreme weight disparities
            if (hasHighWeightElement && weightDisparity > 1.2) {
                // For uneven weight distributions, we assign more points to low-weighted elements
                // Sort by inverse weight (lowest weight first)
                // This sorting approach works regardless of which position the high-weight element is in
                // (whether it's the first, middle, or last element in the module)
                const sortedByLowWeight = [...remainingElements].sort((a, b) => 
                    a.normalizedWeight - b.normalizedWeight);
                
                // Calculate variable points based on inverse weights
                let totalInverseWeight = sortedByLowWeight.reduce((sum, el) => 
                    sum + (1 / (el.normalizedWeight * el.normalizedWeight)), 0); // Square the denominator for more aggressive inverse weighting
                
                for (const element of sortedByLowWeight) {
                    // Calculate inverse-weight-based points (more points to lower weights)
                    // Squaring the denominator makes the distribution more aggressively favor low-weighted elements
                    // Use inverse square weighting to dramatically favor elements with lower weights
                    // This non-linear function is key to counteracting the natural advantage of high-weight elements
                    const inverseWeightRatio = (1 / (element.normalizedWeight * element.normalizedWeight)) / totalInverseWeight;
                    
                    // Adjust boost factor dynamically based on weight disparity
                    // Higher disparity means stronger boost - this adapts the intensity of the balance correction
                    // to the specific module's weight distribution - more aggressive when needed, more moderate when not
                    const boostFactor = Math.max(1.5, Math.min(3.0, weightDisparity * 1.2));
                    const targetPoints = pointsStillNeeded * inverseWeightRatio * boostFactor;
                    
                    // Apply rule: Never add more than 5 points to elements with score > 10
                    const maxAllowedPoints = element.calculatedNote > 10 ? 5 : 20 - element.calculatedNote;
                    const currentPoints = result.elementPointsToAdd[element.name] || 0;
                    const additionalPoints = Math.min(targetPoints, maxAllowedPoints - currentPoints);
                    
                    if (additionalPoints > 0) {
                        result.elementPointsToAdd[element.name] = (currentPoints + additionalPoints);
                        result.totalPointsAdded += additionalPoints;
                    }
                }
            } else {
                // For more balanced weight distributions, use equal distribution
                let equalPoints = pointsStillNeeded / numElements;
                
                // Apply first round of equal distribution
                for (const element of remainingElements) {
                    // Apply rule: Never add more than 5 points to elements with score > 10
                    const maxAllowedPoints = element.calculatedNote > 10 ? 5 : 20 - element.calculatedNote;
                    const currentPoints = result.elementPointsToAdd[element.name] || 0;
                    const additionalPoints = Math.min(equalPoints, maxAllowedPoints - currentPoints);
                    
                    if (additionalPoints > 0) {
                        result.elementPointsToAdd[element.name] = (currentPoints + additionalPoints);
                        result.totalPointsAdded += additionalPoints;
                    }
                }
            }
            
            // Calculate if we've reached our target
            let currentModuleImprovement = 0;
            eligibleElements.forEach(element => {
                const pointsAdded = result.elementPointsToAdd[element.name] || 0;
                currentModuleImprovement += pointsAdded * element.normalizedWeight;
            });
            
            // Phase 2: If we still need more points, focus on the most efficient elements
            // BUT with a strong penalty for high-weighted elements to keep balance
            if (currentModuleImprovement < pointsNeeded - 0.01) {
                const remainingNeeded = pointsNeeded - currentModuleImprovement;
                
                // Sort by an anti-weight bias formula that favors:
                // 1. Elements with lower weights (to counteract the natural advantage of high-weighted elements)
                // 2. Elements with lower scores (to prioritize improving weaker elements)
                const balancingElements = eligibleElements
                    .filter(e => {
                        const current = result.elementPointsToAdd[e.name] || 0;
                        return (e.calculatedNote + current) < 12 && (current < (e.calculatedNote > 10 ? 5 : 20 - e.calculatedNote));
                    })
                    .sort((a, b) => {
                        const aPoints = result.elementPointsToAdd[a.name] || 0;
                        const bPoints = result.elementPointsToAdd[b.name] || 0;
                        
                        // Enhanced anti-weight bias - more aggressively reverse the weight advantage
                        // Using a non-linear function to prioritize lower-weighted elements
                        // Square the weight difference to make the bias more pronounced
                        const weightDifference = b.normalizedWeight - a.normalizedWeight;
                        
                        // Check if weights are significantly different
                        if (Math.abs(weightDifference) > 0.05) {
                            // Calculate bias with increasing intensity as the weight gap increases
                            const weightBias = Math.sign(weightDifference) * Math.pow(Math.abs(weightDifference) * 10, 1.5);
                            return weightBias; // Much higher priority to lower-weighted elements
                        } else {
                            // If weights are similar, prioritize by score first, then by points already added (less is better)
                            const scoreDiff = a.calculatedNote - b.calculatedNote;
                            if (Math.abs(scoreDiff) > 1) {
                                return scoreDiff; // Prioritize by score if difference is significant
                            } else {
                                // If scores are similar too, prioritize element that received fewer points so far
                                const aPoints = result.elementPointsToAdd[a.name] || 0;
                                const bPoints = result.elementPointsToAdd[b.name] || 0;
                                return aPoints - bPoints;
                            }
                        }
                    });
                
                // Second round of distribution using the anti-weight bias
                for (const element of balancingElements) {
                    const currentPoints = result.elementPointsToAdd[element.name] || 0;
                    const maxAdditional = element.calculatedNote > 10 ? 
                        Math.min(5 - currentPoints, 20 - element.calculatedNote - currentPoints) : 
                        20 - element.calculatedNote - currentPoints;
                    
                    if (maxAdditional <= 0) continue;
                    
                    // Use a more aggressive non-linear inverse weighting function
                    // Square the denominator to make the effect more pronounced for low-weighted elements
                    const effectiveWeight = 1 / Math.pow(Math.max(0.1, element.normalizedWeight), 2);
                    
                    // Calculate normalized effective weight using the same non-linear function for all elements
                    const normalizedEffectiveWeight = effectiveWeight / balancingElements.reduce((sum, el) => 
                        sum + (1 / Math.pow(Math.max(0.1, el.normalizedWeight), 2)), 0);
                    
                    // Apply a more aggressive multiplier that scales with the weight inequality in the module
                    // Higher weight disparity = more aggressive boost to counterbalance high-weight elements
                    const weights = balancingElements.map(e => e.normalizedWeight);
                    const maxElementWeight = Math.max(...weights);
                    const minElementWeight = Math.min(...weights);
                    const weightDisparityFactor = maxElementWeight / minElementWeight; 
                    
                    // Boost factor scales with weight disparity: higher disparity = stronger boost
                    const boostFactor = Math.max(2.0, Math.min(5.0, weightDisparityFactor * 2));
                    
                    // Adjust points based on normalized effective weight and boost factor
                    const additionalPoints = Math.min(
                        remainingNeeded * normalizedEffectiveWeight * boostFactor,
                        maxAdditional
                    );
                    
                    if (additionalPoints > 0) {
                        result.elementPointsToAdd[element.name] = currentPoints + additionalPoints;
                        result.totalPointsAdded += additionalPoints;
                        currentModuleImprovement += additionalPoints * element.normalizedWeight;
                        
                        if (currentModuleImprovement >= pointsNeeded - 0.01) break;
                    }
                }
            }
        }
        
        return result;
    }
    
    // Strategy 1: Focus on low scores first (below 10, but ensuring all are at least 5)
    function simulateLowScoreFirst() {
        const result = {
            elementPointsToAdd: {},
            totalPointsAdded: 0
        };
        
        // Sort elements by score (lowest first), then by weight (highest first)
        const sortedElements = [...elements].sort((a, b) => {
            // First prioritize elements below 5 (mandatory minimum)
            if (a.calculatedNote < 5 && b.calculatedNote >= 5) return -1;
            if (b.calculatedNote < 5 && a.calculatedNote >= 5) return 1;
            
            // Then prioritize elements below 10 (low scores)
            if (a.calculatedNote < 10 && b.calculatedNote >= 10) return -1;
            if (b.calculatedNote < 10 && a.calculatedNote >= 10) return 1;
            
            // Then sort by score
            if (a.calculatedNote !== b.calculatedNote)
                return a.calculatedNote - b.calculatedNote;
            
            // If scores are equal, prioritize by weight
            return b.normalizedWeight - a.normalizedWeight;
        });
        
        // Calculate how many points we need to add to the module
        let pointsStillNeeded = pointsNeeded;
        
        // First, ensure all elements have at least 5 points (mandatory requirement)
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
                
                // Apply rule: Never add more than 5 points to elements with score > 10
                const maxAllowedPoints = element.calculatedNote > 10 ? 5 : maxPointsPossible;
                
                const pointsForElement = Math.min(
                    pointsStillNeeded / element.normalizedWeight,
                    maxAllowedPoints
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
    
    // Strategy 2: Prioritize highest-weighted elements first, but ensure minimum 5 points
    function simulateHighWeightFirst() {
        const result = {
            elementPointsToAdd: {},
            totalPointsAdded: 0
        };
        
        // First we need to ensure minimum grades are met
        // Process elements below 5 first, regardless of weight
        const elementsBelow5 = [...elements]
            .filter(e => e.calculatedNote < 5 && e.calculatedNote < 12);
        
        let pointsStillNeeded = pointsNeeded;
        
        // First ensure all elements have at least 5 points (mandatory requirement)
        for (const element of elementsBelow5) {
            const pointsTo5 = 5 - element.calculatedNote;
            result.elementPointsToAdd[element.name] = pointsTo5;
            result.totalPointsAdded += pointsTo5;
            pointsStillNeeded -= pointsTo5 * element.normalizedWeight;
        }
        
        // Then sort remaining elements by weight (highest first)
        const remainingElements = [...elements]
            .filter(e => !result.elementPointsToAdd[e.name] && e.calculatedNote < 12)
            .sort((a, b) => b.normalizedWeight - a.normalizedWeight);
        
        // Distribute remaining points based on weight
        for (const element of remainingElements) {
            // Calculate how many points to add (maximal impact)
            const maxPointsPossible = 20 - element.calculatedNote;
            
            // Apply rule: Never add more than 5 points to elements with score > 10
            const maxAllowedPoints = element.calculatedNote > 10 ? 5 : maxPointsPossible;
            
            const pointsForElement = Math.min(
                pointsStillNeeded / element.normalizedWeight,
                maxAllowedPoints
            );
            
            if (pointsForElement > 0) {
                result.elementPointsToAdd[element.name] = pointsForElement;
                result.totalPointsAdded += pointsForElement;
                pointsStillNeeded -= pointsForElement * element.normalizedWeight;
                
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
            
            // Apply rule: Never add more than 5 points to elements with score > 10
            const maxAdditional = element.calculatedNote > 10 ? 
                Math.min(5, 20 - (element.calculatedNote + currentPoints)) : 
                20 - (element.calculatedNote + currentPoints);
            
            if (maxAdditional <= 0) return;
            
            // Create array of possible point increments
            const increments = [];
            
            // For elements below 10, provide more granular options
            const isLowScore = (element.calculatedNote + currentPoints) < 10;
            const stepSize = isLowScore ? 
                maxAdditional / (maxIncrements + 1) : // More granular for low scores
                maxAdditional / maxIncrements;
                
            for (let i = 0; i <= (isLowScore ? maxIncrements + 1 : maxIncrements); i++) {
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
        
        // Group strategies by total points (within a small margin of error)
        const strategyGroups = {};
        let minTotalPoints = Infinity;
        
        validStrategies.forEach(strategy => {
            // Round to nearest 0.5 points to group similar strategies
            const roundedTotal = Math.round(strategy.totalPointsAdded * 2) / 2;
            if (!strategyGroups[roundedTotal]) {
                strategyGroups[roundedTotal] = [];
            }
            strategyGroups[roundedTotal].push(strategy);
            minTotalPoints = Math.min(minTotalPoints, roundedTotal);
        });
        
        // Find strategies that use minimum points (with a tolerance of 1 point)
        const effectiveStrategies = [];
        for (const [pointTotal, strategies] of Object.entries(strategyGroups)) {
            if (parseFloat(pointTotal) <= minTotalPoints + 1) {
                effectiveStrategies.push(...strategies);
            }
        }
        
        // If we have multiple effective strategies, choose the one with the best balance
        if (effectiveStrategies.length > 1) {
            // Calculate a balance score for each strategy (higher is better)
            const scoredStrategies = effectiveStrategies.map(strategy => {
                // Get element contributions
                const contributions = {};
                elements.forEach(element => {
                    if (element.calculatedNote < 12) {
                        const pointsAdded = strategy.elementPointsToAdd[element.name] || 0;
                        if (pointsAdded > 0) {
                            contributions[element.name] = {
                                pointsAdded,
                                weight: element.normalizedWeight,
                                contribution: pointsAdded * element.normalizedWeight
                            };
                        }
                    }
                });
                
                // Score based on:
                // 1. How many elements receive points (more is better)
                // 2. Standard deviation of contributions (lower is better)
                // 3. Correlation between weight and points added (lower is better, to prevent bias toward high-weight elements)
                
                const numElements = Object.keys(contributions).length;
                const contributionValues = Object.values(contributions).map(c => c.contribution);
                const stdDev = standardDeviation(contributionValues);
                
                // Calculate correlation between weight and points
                const weights = Object.values(contributions).map(c => c.weight);
                const points = Object.values(contributions).map(c => c.pointsAdded);
                const weightPointCorrelation = Math.abs(correlation(weights, points));
                
                // Check if weights are uneven (one element has significantly higher weight)
                const maxWeight = Math.max(...weights);
                const weightUnevenness = maxWeight - (1 / numElements);
                
                // Calculate the extreme weight ratio (highest to lowest weight)
                const minWeight = Math.min(...weights);
                const weightRatio = minWeight > 0 ? maxWeight / minWeight : 0;
                
                // Calculate the coefficient of variation of weights (standardized measure of dispersion)
                const weightMean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
                const weightVariance = weights.reduce((sum, w) => sum + Math.pow(w - weightMean, 2), 0) / weights.length;
                const weightCV = weightMean > 0 ? Math.sqrt(weightVariance) / weightMean : 0;
                
                // Balance score components with enhanced sensitivity to weight disparities:
                // 1. More elements is better (multiplier 2) - unchanged
                // 2. Lower stddev is better (penalty multiplier increased to 4)
                // 3. Lower correlation with weights is better (penalty multiplier increased to 10)
                // 4. Enhanced bonus for uneven weights that scales with weight disparity
                
                // Calculate the bonus factor based on weight disparity metrics
                const disparityScore = Math.max(weightUnevenness, weightCV);
                const disparityFactor = Math.max(1, Math.min(3, weightRatio));
                
                // Higher bonus when weights are uneven AND correlation is low (anti-correlation is good)
                const unevennessBonus = disparityScore > 0.1 ? 
                    (1 - Math.pow(weightPointCorrelation, 2)) * 15 * disparityFactor : 0;
                
                // Enhanced balance score with stronger penalties and bonuses
                const balanceScore = numElements * 2 - stdDev * 4 - Math.pow(weightPointCorrelation, 2) * 10 + unevennessBonus;
                
                return { 
                    strategy, 
                    balanceScore, 
                    totalPoints: strategy.totalPointsAdded,
                    numElements,
                    stdDev,
                    weightPointCorrelation
                };
            });
            
            // Sort by balance score (highest first)
            scoredStrategies.sort((a, b) => b.balanceScore - a.balanceScore);
            
            // Return the strategy with the best balance score
            return scoredStrategies[0].strategy;
        }
        
        // If only one effective strategy, return it
        return effectiveStrategies[0];
    }
    
    // Helper function to calculate correlation between two arrays
    function correlation(x, y) {
        if (x.length !== y.length) return 0;
        if (x.length === 0) return 0;
        
        const n = x.length;
        const xMean = x.reduce((a, b) => a + b, 0) / n;
        const yMean = y.reduce((a, b) => a + b, 0) / n;
        
        let numerator = 0;
        let xVariance = 0;
        let yVariance = 0;
        
        for (let i = 0; i < n; i++) {
            const xDiff = x[i] - xMean;
            const yDiff = y[i] - yMean;
            numerator += xDiff * yDiff;
            xVariance += xDiff * xDiff;
            yVariance += yDiff * yDiff;
        }
        
        if (xVariance === 0 || yVariance === 0) return 0;
        return numerator / Math.sqrt(xVariance * yVariance);
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
                    
                    // Check if this module has session 2 notes (completed module)
                    const hasSession2Notes = currentModule.elements && 
                        currentModule.elements.some(e => e.session2Note && e.session2Note > 0);
                    
                    // Mark the module as having session 2 data
                    currentModule.hasSession2Data = hasSession2Notes;
                    
                    // Apply visual styling to indicate this is a module with session 2 data
                    if (hasSession2Notes) {
                        row.classList.add('module-with-session2');
                    }
                    
                    // Only calculate points needed for non-validated modules that don't have session 2 notes
                    // Since modules with session 2 notes are already completed and can't be improved
                    if (!currentModule.isValid && currentModule.finalNote < 12 && !hasSession2Notes) {
                        calculatePointsNeeded(currentModule);
                    }
                }
            } 
            // When we find an element row
            else if (moduleType === 'EM' && currentModule) {
                // If this is an element of a module with session 2 data, mark it 
                if (currentModule.hasSession2Data) {
                    row.classList.add('element-with-session2');
                }
                
                // Only add validation indicators for non-valid modules without session 2 notes
                if (!currentModule.isValid && currentModule.finalNote < 12 && !currentModule.hasSession2Data) {
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
        }
    });
}
