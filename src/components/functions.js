export function findMaxDurationDelaySum(obj) {
    let maxSum = 0;

    function recursiveSearch(currentObj) {
        // Check if the current object has both `duration` and `delay` properties
        if (currentObj.hasOwnProperty('duration') && currentObj.hasOwnProperty('delay')) {
            // Calculate the sum of duration and delay
            const sum = currentObj.duration + currentObj.delay;
            // Update maxSum if this sum is greater than the current maxSum
            if (sum > maxSum) {
                maxSum = sum;
            }
            // Since we found the outermost object with both properties, we stop this branch
            return;
        }

        // Recursively search through all properties of the current object
        for (const key in currentObj) {
            if (currentObj.hasOwnProperty(key) && typeof currentObj[key] === 'object') {
                // Recursively search in subobjects
                recursiveSearch(currentObj[key]);
            }
        }
    }

    // Start the recursive search from the root object
    recursiveSearch(obj);

    // Return the maximum sum found
    return maxSum;
}