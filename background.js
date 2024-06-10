chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetch-risk-assessments') {
    console.log('Received message to fetch risk assessments:', message);
    fetch('http://5.78.64.27:3000/api/assess-risk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemNames: message.itemNames }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('API response data:', data);
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error('Error fetching risk assessments:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;  // Keeps the message channel open to send a response asynchronously
  }
});
