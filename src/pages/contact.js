import React, { useState } from 'react';

const ChoreAssignmentApp = () => {
  // State management
  const [numRoommates, setNumRoommates] = useState(3);
  const [currentRoommate, setCurrentRoommate] = useState(1);
  const [roommateRankings, setRoommateRankings] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState(false);
  const [currentRanking, setCurrentRanking] = useState([]);
  const [pairings, setPairings] = useState([]);

  const choreItems = [
    { id: 'floor', name: '🧹 Floor' },
    { id: 'toilet-seat', name: '🚽 Toilet Seat' },
    { id: 'sink', name: '🚰 Sink' },
    { id: 'mirror', name: '🪞 Mirror' },
    { id: 'curtain', name: '🚿 Curtain' },
    { id: 'shower-wall', name: '🛁 Shower Wall' },
    { id: 'toilet-scrub', name: '🧽 Toilet Scrub' }
  ];

  // Initialize default ranking for new roommate
  const getDefaultRanking = () => choreItems.map(item => item.id);

  // Progress calculation
  const getProgress = () => {
    if (currentStep === 1) return 0;
    if (currentStep === 2) {
      return 20 + (60 * (currentRoommate - 1) / numRoommates);
    }
    if (currentStep === 3) return 100;
    return 0;
  };

  // Step 1 functions
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setNumRoommates(value);
    setValidationError(value < 2 || value > 10 || isNaN(value));
  };

  const startRankingProcess = () => {
    if (numRoommates < 2 || numRoommates > 10 || isNaN(numRoommates)) {
      setValidationError(true);
      return;
    }

    setCurrentRoommate(1);
    setRoommateRankings({});
    setCurrentRanking(getDefaultRanking());
    setCurrentStep(2);
  };

  // Drag and drop functions
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      const newRanking = [...currentRanking];
      const draggedItem = newRanking[dragIndex];
      newRanking.splice(dragIndex, 1);
      newRanking.splice(dropIndex, 0, draggedItem);
      setCurrentRanking(newRanking);
    }
  };

  // Navigation functions
  const nextRoommate = () => {
    // Save current roommate's ranking
    const newRankings = {
      ...roommateRankings,
      [currentRoommate]: [...currentRanking]
    };
    setRoommateRankings(newRankings);
    
    if (currentRoommate === numRoommates) {
      // Generate pairings with all rankings
      generatePairings(newRankings);
      setCurrentStep(3);
    } else {
      // Move to next roommate
      const nextId = currentRoommate + 1;
      setCurrentRoommate(nextId);
      
      // Load next roommate's ranking or default
      if (newRankings[nextId]) {
        setCurrentRanking([...newRankings[nextId]]);
      } else {
        setCurrentRanking(getDefaultRanking());
      }
    }
  };

  const previousRoommate = () => {
    if (currentRoommate > 1) {
      // Save current roommate's ranking
      const newRankings = {
        ...roommateRankings,
        [currentRoommate]: [...currentRanking]
      };
      setRoommateRankings(newRankings);
      
      // Move to previous roommate
      const prevId = currentRoommate - 1;
      setCurrentRoommate(prevId);
      
      // Load previous roommate's ranking
      setCurrentRanking([...newRankings[prevId]]);
    }
  };

  // Helper function to generate all possible pairings for even numbers
  const generateAllPossiblePairings = (roommates) => {
    if (roommates.length === 2) {
      return [[[roommates[0], roommates[1]]]];
    }
    
    const allPairings = [];
    const first = roommates[0];
    
    // Try pairing the first roommate with each other roommate
    for (let i = 1; i < roommates.length; i++) {
      const partner = roommates[i];
      const remaining = roommates.filter(r => r !== first && r !== partner);
      
      // Recursively get all pairings for the remaining roommates
      const subPairings = generateAllPossiblePairings(remaining);
      
      // Add the current pair to each sub-pairing
      for (const subPairing of subPairings) {
        allPairings.push([[first, partner], ...subPairing]);
      }
    }
    
    return allPairings;
  };

  // Find optimal pairing for even number of roommates - FIXED VERSION
  const findOptimalEvenPairing = (rankings) => {
    const roommates = Array.from({length: numRoommates}, (_, i) => i + 1);
    const allPossiblePairings = generateAllPossiblePairings(roommates);
    
    let bestPairing = null;
    let bestTotalSum = Infinity;
    
    console.log(`Evaluating ${allPossiblePairings.length} possible pairing configurations...`);
    
    // Evaluate each possible pairing configuration
    for (const pairingConfig of allPossiblePairings) {
      const pairingResults = [];
      let configurationTotalSum = 0;
      let configurationValid = true;
      
      console.log(`Testing pairing: ${pairingConfig.map(pair => `(${pair[0]},${pair[1]})`).join(' + ')}`);
      
      // Generate results for each pair in this configuration
      for (const pair of pairingConfig) {
        const result = generateTwoRoomatePairing(pair, rankings);
        if (result) {
          pairingResults.push(result);
          // Sum both roommates' preference totals for this pair
          const pairTotal = result.roommate1.sum + result.roommate2.sum;
          configurationTotalSum += pairTotal;
          console.log(`  Pair (${pair[0]},${pair[1]}): R${pair[0]} sum=${result.roommate1.sum}, R${pair[1]} sum=${result.roommate2.sum}, pair total=${pairTotal}`);
        } else {
          configurationValid = false;
          break;
        }
      }
      
      // Keep the configuration with the lowest total sum across all pairs
      if (configurationValid && pairingResults.length === pairingConfig.length) {
        console.log(`  Configuration total sum: ${configurationTotalSum}`);
        if (configurationTotalSum < bestTotalSum) {
          console.log(`  *** NEW BEST! Previous best: ${bestTotalSum}`);
          bestTotalSum = configurationTotalSum;
          bestPairing = pairingResults;
        }
      }
    }
    
    console.log(`Final best total sum: ${bestTotalSum}`);
    return bestPairing;
  };

  // Generate all pairings based on number of roommates
  const generateAllPairings = (rankings) => {
    const pairings = [];
    
    if (numRoommates % 2 === 0) {
      // Even number - generate one optimal pairing
      const optimalPairing = findOptimalEvenPairing(rankings);
      if (optimalPairing) {
        // Calculate total sum across all pairs for display
        const totalSum = optimalPairing.reduce((sum, pair) => 
          sum + pair.roommate1.sum + pair.roommate2.sum, 0
        );
        pairings.push({
          title: `Optimal Pairing (Total Sum: ${totalSum})`,
          pairs: optimalPairing
        });
      }
    } else {
      // Odd number - show all possible pairs
      for (let i = 1; i <= numRoommates; i++) {
        for (let j = i + 1; j <= numRoommates; j++) {
          const pairing = generateTwoRoomatePairing([i, j], rankings);
          if (pairing) {
            const pairSum = pairing.roommate1.sum + pairing.roommate2.sum;
            pairings.push({
              title: `Roommate ${i} & ${j} (Sum: ${pairSum})`,
              pairs: [pairing]
            });
          }
        }
      }
    }
    
    return pairings;
  };

  // Main pairing generation function
  const generatePairings = (finalRankings) => {
    try {
      let pairingResults = [];
      
      if (numRoommates === 2) {
        const pairing = generateTwoRoomatePairing([1, 2], finalRankings);
        const pairSum = pairing.roommate1.sum + pairing.roommate2.sum;
        pairingResults = [{
          title: `Roommate 1 & 2 (Sum: ${pairSum})`,
          pairs: [pairing]
        }];
      } else {
        pairingResults = generateAllPairings(finalRankings);
      }
      
      setPairings(pairingResults);
    } catch (error) {
      console.error('Error generating pairings:', error);
      setPairings([]);
    }
  };

  // Generate pairing between two specific roommates
  const generateTwoRoomatePairing = (roommateIds, rankings) => {
    const [roommate1Id, roommate2Id] = roommateIds;
    const ranking1 = rankings[roommate1Id];
    const ranking2 = rankings[roommate2Id];
    
    if (!ranking1 || !ranking2) {
      console.error('Missing rankings for roommates', roommate1Id, roommate2Id);
      return null;
    }
    
    // Create preference maps for each roommate
    const roommate1Preferences = {};
    const roommate2Preferences = {};
    
    ranking1.forEach((taskId, index) => {
      roommate1Preferences[taskId] = index + 1; // priority 1-7
    });
    
    ranking2.forEach((taskId, index) => {
      roommate2Preferences[taskId] = index + 1; // priority 1-7
    });
    
    const optimalSplit = findOptimalSplit(roommate1Preferences, roommate2Preferences);
    
    return {
      roommate1: {
        id: roommate1Id,
        tasks: optimalSplit.group1.map(taskId => ({
          id: taskId,
          name: choreItems.find(item => item.id === taskId).name,
          weight: roommate1Preferences[taskId]
        })),
        sum: optimalSplit.sum1
      },
      roommate2: {
        id: roommate2Id,
        tasks: optimalSplit.group2.map(taskId => ({
          id: taskId,
          name: choreItems.find(item => item.id === taskId).name,
          weight: roommate2Preferences[taskId]
        })),
        sum: optimalSplit.sum2
      },
      totalDifference: Math.abs(optimalSplit.sum1 - optimalSplit.sum2)
    };
  };

  // Find optimal split of tasks between two roommates
  const findOptimalSplit = (prefs1, prefs2) => {
    const allTasks = choreItems.map(item => item.id);
    let bestSplit = null;
    let bestScore = Infinity;
    
    // Try all possible ways to split 7 tasks into groups of 3-4 and 4-3
    for (let i = 0; i < 128; i++) {
      const group1 = [];
      const group2 = [];
      
      for (let j = 0; j < 7; j++) {
        if (i & (1 << j)) {
          group1.push(allTasks[j]);
        } else {
          group2.push(allTasks[j]);
        }
      }
      
      // Only consider valid splits (3-4 tasks each)
      if (group1.length < 3 || group1.length > 4 || 
          group2.length < 3 || group2.length > 4) {
        continue;
      }
      
      // Calculate preference weights for each roommate
      const sum1 = group1.reduce((sum, taskId) => sum + prefs1[taskId], 0);
      const sum2 = group2.reduce((sum, taskId) => sum + prefs2[taskId], 0);
      
      // Score: balance workload difference with preference satisfaction
      // Lower preference numbers are better (1 is best, 7 is worst)
      const workloadDiff = Math.abs(sum1 - sum2);
      const totalPreferences = sum1 + sum2;
      const score = workloadDiff * 3 + totalPreferences * 0.5;
      
      if (score < bestScore) {
        bestScore = score;
        bestSplit = {
          group1: [...group1],
          group2: [...group2],
          sum1: sum1,
          sum2: sum2
        };
      }
    }
    
    // Fallback
    return bestSplit || {
      group1: allTasks.slice(0, 4),
      group2: allTasks.slice(4),
      sum1: allTasks.slice(0, 4).reduce((sum, taskId) => sum + prefs1[taskId], 0),
      sum2: allTasks.slice(4).reduce((sum, taskId) => sum + prefs2[taskId], 0)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
      <div className="max-w-2xl mx-auto bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-center mb-8 text-gray-700 text-3xl font-bold">
          🏠 Multi-Roommate Chore Assignment
        </h1>
        
        {/* Progress Bar */}
        <div className="bg-gray-200 h-2 rounded mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        {/* Step 1: Number of Roommates */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-5 text-gray-600">Step 1: How many roommates?</div>
            <div className="mb-10">
              <h2 className="text-gray-800 mb-4 text-xl flex items-center">
                <div className="w-1 h-5 bg-indigo-500 mr-3 rounded"></div>
                👥 Number of Roommates
              </h2>
              <div className="flex items-center gap-4 mb-3">
                <label className="font-semibold text-gray-700">Roommate Count:</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={numRoommates}
                  onChange={handleQuantityChange}
                  className={`p-3 border-2 rounded-lg text-base w-24 transition-all ${
                    validationError 
                      ? 'border-red-500' 
                      : 'border-gray-200 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-100'
                  }`}
                />
              </div>
              {validationError && (
                <div className="text-red-500 text-sm mt-1">
                  Please enter a number between 2 and 10
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={startRankingProcess}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Start Ranking Process
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Individual Rankings */}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-5 text-gray-600">
              Step 2: Roommate {currentRoommate} of {numRoommates}
            </div>
            <div className="text-center mb-6 p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl">
              <h2 className="text-xl mb-2">🎯 Roommate {currentRoommate}: Rank Your Preferences</h2>
              <p>Drag items to reorder them from most important (1) to least important (7)</p>
              {/* Debug info */}
              <div className="mt-2 text-sm opacity-80">
                Saved rankings: {Object.keys(roommateRankings).map(id => `R${id}`).join(', ') || 'None yet'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 border-2 border-dashed border-gray-300">
              {currentRanking.map((itemId, index) => {
                const choreItem = choreItems.find(item => item.id === itemId);
                return (
                  <div
                    key={itemId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex items-center p-4 bg-white rounded-xl cursor-grab hover:-translate-y-1 hover:shadow-lg transition-all select-none active:cursor-grabbing active:scale-105"
                    style={{
                      border: '4px solid #fbb6ce',
                      marginBottom: '16px',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#f687b3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#fbb6ce';
                    }}
                  >
                    <div 
                      className="text-white w-9 h-9 rounded-full flex items-center justify-center font-bold mr-4 text-sm"
                      style={{
                        background: 'linear-gradient(to right, #fbb6ce, #f687b3)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 font-semibold text-gray-800 capitalize">
                      {choreItem.name}
                    </div>
                    <div className="text-gray-400 text-xl cursor-grab">⋮⋮</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-8">
              {currentRoommate > 1 && (
                <button
                  onClick={previousRoommate}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-full text-base font-semibold hover:bg-gray-300 hover:-translate-y-1 transition-all"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={nextRoommate}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {currentRoommate === numRoommates ? 'Generate Pairings' : 'Next Roommate →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && (
          <div className="mt-8 p-5 bg-green-50 border-2 border-green-300 rounded-xl">
            <h3 className="text-green-800 mb-4 text-center text-xl font-bold">🎯 Optimal Chore Pairings</h3>
            <div>
              {pairings.map((pairingSet, setIndex) => (
                <div key={setIndex} className="mb-6 p-5 bg-white rounded-xl border-l-4 border-green-400">
                  <h4 className="text-green-800 mb-4 text-center font-bold">{pairingSet.title}</h4>
                  {pairingSet.pairs.map((pairing, pairIndex) => (
                    <div key={pairIndex}>
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                        <h5 className="text-gray-800 mb-2 font-semibold">
                          👤 Roommate {pairing.roommate1.id} (Weight: {pairing.roommate1.sum})
                        </h5>
                        <ul className="list-none p-0">
                          {pairing.roommate1.tasks.map((task, idx) => (
                            <li key={idx} className="py-1 text-gray-700">
                              • {task.name} (Priority: {task.weight})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                        <h5 className="text-gray-800 mb-2 font-semibold">
                          👤 Roommate {pairing.roommate2.id} (Weight: {pairing.roommate2.sum})
                        </h5>
                        <ul className="list-none p-0">
                          {pairing.roommate2.tasks.map((task, idx) => (
                            <li key={idx} className="py-1 text-gray-700">
                              • {task.name} (Priority: {task.weight})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-center text-green-800 font-semibold mt-3">
                        ⚖️ Balance Difference: {pairing.totalDifference} points | 
                        Pair Sum: {pairing.roommate1.sum + pairing.roommate2.sum}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoreAssignmentApp;