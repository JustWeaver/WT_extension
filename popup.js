document.getElementById('checkRisks').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['content.js']
    });
    chrome.scripting.insertCSS({
      target: {tabId: tabs[0].id},
      files: ['content.css']
    });
  });
});
