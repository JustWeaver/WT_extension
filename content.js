// Function to get the items from the DOM.
function getTradeItems() {
  const itemElements = document.querySelectorAll('.user.right .name.left');

  return Array.from(itemElements)
    .map((element) => ({
      element,
      name: element.firstChild.textContent.trim().split(' x')[0]
    }))
    .filter(({name}) => !!name); // Filter out empty item names
}

// Function to add risk level dots based on risk
function addRiskDots(riskAssessments) {
  const tradeItems = getTradeItems();

  riskAssessments
    .filter(({explanation}) => !!explanation)
    .forEach(({itemName, risk, explanation}) => {
      const tradeItem = tradeItems.find(({name}) => name === itemName)
      if (!tradeItem) {
        console.warn(`[RiskAssessment] Element not found for ${itemName}!`);
        return;
      }

      const {element} = tradeItem;

      element.querySelector('.risk-dot')?.remove();

      const dot = document.createElement('span');
      dot.classList.add("risk-dot");
      dot.title = explanation.match(/Risk Level Explanation:\s*(.*)$/m)[1].trim();
      if (risk === 'Low Risk') {
        dot.classList.add('low-risk');
      } else if (risk === 'Medium Risk') {
        dot.classList.add('medium-risk');
      } else if (risk === 'High Risk') {
        dot.classList.add('high-risk');
      } else {
        dot.style.backgroundColor = 'gray';
      }

      element.appendChild(dot);
    });
}

// Main function to run the script
async function checkRisk() {
  const itemNames = getTradeItems().map(({name}) => name);
  if (itemNames.length <= 0) return;

  const button = document.getElementById('risk-button');
  if (button) {
    button.textContent = 'Checking...';
    button.setAttribute("disabled", "");
  }

  chrome.runtime.sendMessage({action: 'fetch-risk-assessments', itemNames}, (response) => {
    if (response.success && Array.isArray(response.data)) {
      addRiskDots(response.data);

      if (button) {
        button.textContent = 'Success';
      }
    } else {
      console.error('[RiskAssessment] Error fetching risk assessments or invalid response:', response.error);

      if (button) {
        button.textContent = 'Failed!';
      }
    }

    setTimeout(() => {
      const button = document.getElementById('risk-button');
      if (!button) return;

      button.textContent = 'Check Item Risks';
      button.removeAttribute("disabled");
    }, 3000);
  });
}


// Function to add a button to the page
function addButton() {
  if (document.getElementById('risk-button')) return;

  const button = document.createElement('button');
  button.id = 'risk-button';
  button.textContent = 'Check Item Risks';
  button.addEventListener('click', checkRisk);

  const userTitle = document.querySelector('.user.right .title-black');
  if (!userTitle) {
    console.warn("[RiskAssessment] Couldn't find the user title.");
    return;
  }

  const ttHideValues = userTitle.querySelector('.tt-hide-values');
  if (ttHideValues) {
    ttHideValues.insertAdjacentElement('beforebegin', button);
  } else {
    userTitle.appendChild(button);
  }
}

(() => {
  const tradeContainer = document.querySelector('#trade-container');
  if (!tradeContainer) {
    console.warn("[RiskAssessment] Couldn't find trade container.");
    return;
  }

  new MutationObserver((mutations) => {
    const filteredMutations = mutations
      .flatMap((mutation) => Array.from(mutation.addedNodes))
      .filter((node) => node instanceof HTMLElement)
      .filter((node) => node.classList.contains('trade-cont'))
    if (!filteredMutations.length) return;

    addButton();
  }).observe(tradeContainer, {childList: true});
  addButton();
})();