/**
 *
 * @returns
 */
function getIdentifier() {
 
  console.log("getIdentifier==============");
  let selection = window.getSelection();
  let anchorNode = selection.anchorNode;

   // if mark element is an immediate sibling then fetch its text count and append in offset.
    if (anchorNode.localName == 'mark') {
      
      // get Id of the mark node and use it in api call
    }

  let identifier = {};
  let selectionText = selection.toString();

  //Todo: Handle opposite selection for anchorOffset and focusOffset
  let selectionNodeData = {
    // textContent: selection.toString(),
    anchorOffset: selection.anchorOffset, // chaange for mark
    focusOffset: selection.focusOffset, // change for mark
  };
  identifier["selectionNodeData"] = selectionNodeData;
  identifier["idLevel"] = -1;
  identifier["maxLevel"] = -1;

  let nodePaths = {};
  let parentLevel = 0;
  // Navigate up to find the closest element with an ID
  while (anchorNode) {
    let nodePath = {};
    nodePath["id"] = anchorNode.id;
    nodePath["nodeType"] = anchorNode.nodeType;
    nodePath["className"] = anchorNode.className; // 'stack type'
    nodePath["nodeName"] = anchorNode.nodeName; // 'DIV'
    nodePath["localName"] = anchorNode.localName; // 'div
    nodePath["tagName"] = anchorNode.tagName; // 'DIV'
    nodePath["prevSiblingCount"] = 0;
    if (!nodePath["id"]){
      let siblingNode =  anchorNode.previousSibling;
      while (siblingNode && siblingNode != null) {
        if (siblingNode.localName == 'mark') {
          if (parentLevel == 0){
            // fetch the text in mark and add in offsets in anchorOffset & focusOffset
            let prevText = siblingNode.textContent;
            let prevTextLength = prevText.length;
            identifier["selectionNodeData"]["anchorOffset"] = 
              identifier["selectionNodeData"]["anchorOffset"] + prevTextLength;
            
            identifier["selectionNodeData"]["focusOffset"] = 
              identifier["selectionNodeData"]["focusOffset"] + prevTextLength;
          }
        }else{
          nodePath["prevSiblingCount"] = nodePath["prevSiblingCount"] + 1;
        }
  
        siblingNode = siblingNode.previousSibling;
      }
    }

    nodePaths[parentLevel] = nodePath;

    if (nodePath["id"]) {
      identifier["idLevel"] = parentLevel;
      break;
    } else {
      anchorNode = anchorNode.parentNode;
      parentLevel++;
    }
  }
  if (!identifier["idLevel"]) {
    identifier["maxLevel"] = parentLevel - 1;
  }

  identifier["nodePaths"] = nodePaths;
  // console.log("--------------identifier--------------",JSON.stringify(identifier));
  return {identifier, selectionText};
}

/**
 *
 * @param {*} identifier
 * @returns
 */
function showIdentifier(identifier, selectionText) {

  console.log("--------------showIdentifier start--------------", JSON.stringify(identifier));
  console.log("--------------selectionText--------------", selectionText);

  let inputNodePaths = identifier["nodePaths"];

  let idLevel = identifier["idLevel"];

  if (idLevel < 0) {
    console.log("--------------idLevel is undefined--------------");
    return;
  }

  let currentLevel = idLevel;
  let currentNodePath = inputNodePaths[currentLevel];

  let currentElement = document.getElementById(currentNodePath.id);


  while (currentLevel >= 0) {
    console.log("--------------currentLevel--------------",currentLevel, currentElement);
    if (!currentElement) {
      console.log("--------------Missing currentElement--------------",currentLevel);
      return;
    }



    let currentSiblingCount = currentNodePath.prevSiblingCount;
    while(currentSiblingCount > 0){
      if (!currentElement){
        console.log("--------------Missing Sibling--------------",currentSiblingCount);
        return;
      }
      if (currentElement.localName != 'mark') {
        currentSiblingCount--;
      }
      currentElement = currentElement.nextSibling;    
    }
    if (currentLevel == 0) {
      break;
    }

    currentLevel--;
    currentNodePath = inputNodePaths[currentLevel];
    currentElement = currentElement.childNodes[0];
  }

  let inputSelectionNodeData = identifier["selectionNodeData"];
  let startOffset = inputSelectionNodeData.anchorOffset;
  let endOffset = inputSelectionNodeData.focusOffset;

  console.log("lastElement for selection--------------",currentLevel, currentElement, inputSelectionNodeData);

  // Check for valid offsets
  if (
    startOffset >= endOffset ||
    startOffset < 0
  ) {
    console.log("Invalid offsets!");
    return;
  }

  console.log("--------------currentElement is Node Type--------------", currentElement.nodeType);
    
  //Todo: add data ids in mark element
  // Todo: fix offset. n position is shifted just after n+1 mark element
  // Todo: Fix getIdentifier the offsets are -1 if mark element is there. prevSiblingCount is wrong
 if (currentElement.nodeType === Node.TEXT_NODE || currentElement.localName == 'mark') {
    console.log("==currentElement===",currentElement, startOffset, endOffset);
    while(endOffset > 0){
      if (!currentElement){
        console.log("--------------Missing Sibling--------------",currentLevel);
        return;
      }

      if (currentElement.localName == 'mark'){
        let alreadyHighlightedTextLength = currentElement.textContent.length;
        endOffset = endOffset - alreadyHighlightedTextLength;
        startOffset = startOffset - alreadyHighlightedTextLength;
        currentElement =  currentElement.nextSibling;
        continue;
      } else{
        let textNode = currentElement;
        let totalLength = textNode.textContent.length;
        
        if (startOffset >= totalLength){
          startOffset = startOffset - totalLength;
          endOffset = endOffset - totalLength;     
          currentElement =  currentElement.nextSibling;    
          continue;
        }
        if (startOffset < 0){
          startOffset = 0;
        }

        let currentLocalEndOffset = endOffset;
        let currentLocalStartOffset = startOffset;

        if (endOffset > totalLength){
          currentLocalEndOffset = totalLength;
        }
        // Split the text node at the ending offset, moving text after the endOffset into a new text node.
        let endNode = textNode.splitText(currentLocalEndOffset);

        // Split the text node at the starting offset, moving text after the startOffset into a new text node.
        let middleNode = textNode.splitText(currentLocalStartOffset);

        // Now, middleNode contains the text to be highlighted. Create a new element to wrap it.
        let highlightMark = document.createElement("mark");
        highlightMark.className = "highlighted-text";

        // Replace middleNode with highlightMark, putting middleNode inside highlightMark.
        highlightMark.appendChild(middleNode);
        textNode.parentNode.insertBefore(highlightMark, endNode);

        startOffset =   startOffset - currentLocalStartOffset;
        endOffset = endOffset - currentLocalEndOffset;
        if (endOffset <= 0){
         return;
        }

        // check the correct logic here if nextElementSibling is needed
        currentElement = currentElement.nextElementSibling || currentElement.nextSibling;    
        currentElement = currentElement.nextSibling;    
      }
    }
  } else {
    console.log(
      "--------------currentElement is not a handled node type--------------",
      currentElement.nodeType, currentElement.localName
    );
    return;
  }
}


async function shoWCommentsPopup() {
  let modalContainer = document.createElement("div");
  modalContainer.style.position = "fixed";
  modalContainer.style.top = "0";
  modalContainer.style.right = "0";
  modalContainer.style.width = "100%";
  modalContainer.style.height = "100%";
  modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modalContainer.style.zIndex = "10000";
  modalContainer.style.display = "flex";
  modalContainer.style.justifyContent = "flex-end";

  let modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  modalContent.style.backgroundColor = "white";
  modalContent.style.padding = "50px";
  modalContent.style.width = "400px";
  modalContent.style.height = "100vh";

  modalContainer.appendChild(modalContent);
  let userCommentsForm = `
  <div class="user-info">
    // <img src="user-avatar.jpg" alt="User Avatar" class="user-avatar">
    <span class="username">Username</span>
  </div>
  <div class="input-container">
    <textarea id="comment" placeholder="Type your comment" rows="4" required></textarea>
  </div>
  <button id="post-comment-btn" class="post-comment-button">Post Comment</button>
`;

modalContent.innerHTML = userCommentsForm;
modalContainer.appendChild(modalContent);
document.body.appendChild(modalContainer);
}

function addStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
  .highlighted-text {
    background-color: rgb(210, 231, 209);
    color: black;
    cursor: pointer;
  }


  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .username {
    font-size: 16px;
    font-weight: bold;
  }

  .input-container textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    text-decoration: none;
    outline: none;
    width: 100%;
  }

  .post-comment-button {
    background-color: #0073e6;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
  `;

  document.head.appendChild(style);
}

addStyles();

(async function () {
  console.log("Add Comment- start");
  chrome.runtime.sendMessage({ type: "checkLoginStatus" }, (response) => {
    console.log("Received response:", response);
    if (response.isLoggedIn) {
      console.log("Add Comment- isLoggedIn");
      // shoWCommentsPopup();
      let {identifier, selectionText} = getIdentifier();
      showIdentifier(identifier, selectionText);
    } else {
      console.log("Add Comment- isLoggedOut");
      chrome.runtime.sendMessage({ type: "showLoginPopup" });
    }
  });
})();
