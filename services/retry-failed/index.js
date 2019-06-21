// Check for jobs failed with a retryCount < retriedCount
// If they have a retry count > 0 move it back to the message queue and increment
// the retriedCount by 1.
// Repeat this process until the retriedCount is tried the max number of times.
