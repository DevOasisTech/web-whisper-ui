async function createLoggedInContainer() {
  let mainDivClassId = 'logged-in-modal-container';

  let mainContainerEle = document.getElementById(mainDivClassId);
  if (mainContainerEle == null) {
    await chrome.storage.local.get(["token"], function (result) {
      const token = result.token;
      console.log("tokentoken", token);
      if (token) {
        const userData = getUserDataFromToken(token);
        let mainContainer = document.createElement("div");
        mainContainer.id = mainDivClassId;
      
        mainContainer.style.position = "fixed";
        mainContainer.style.top = "0";
        mainContainer.style.right = "0";
        mainContainer.style.width = "100%";
        mainContainer.style.height = "100%";
        mainContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        mainContainer.style.zIndex = "10000";
        mainContainer.style.display = "flex";
        mainContainer.style.justifyContent = "flex-end";
        mainContainer.style.overflowY = "auto";

        
        let loggedInHeader = document.createElement("div");
        loggedInHeader.className = "modal-content";
        loggedInHeader.style.backgroundColor = "white";
        loggedInHeader.style.padding = "20px 50px";
        loggedInHeader.style.width = "400px";
        loggedInHeader.style.height = "100vh";
        loggedInHeader.style.overflowY = "auto";
    
      const loggedInContainer = `
      <button id="close-button" class="close-button">X</button>
        <div class="logged-in-container">
            <div class="username" id="login-user-name">${userData.username}</div>
            <button id="logout-btn" class="logout-button">Logout</button>
        </div>
        `;

        const logoContainer = `
        <div class="logo-container">
            <img src='https://static.truesparrow.com/assets/images/word-wishper.png' height='52' width='52' alt='Logo' />
            <div class="logo-text">WebWishper</div>
        </div>
        `;
        
        const addCommentSection = `<div id="add-comment-section"></div>`
        const showCommentSection = `<div id="show-comment-section"></div>`

        let modalContentHtml = logoContainer + addCommentSection + showCommentSection + loggedInContainer;
        loggedInHeader.innerHTML = modalContentHtml;
        
        mainContainer.appendChild(loggedInHeader);
        document.body.appendChild(mainContainer);
    
        const closeButton = document.getElementById("close-button");
        closeButton.addEventListener("click", function () {
          console.log("closeButton");
          mainContainer.style.display = 'none';
        });
    
        const logoutButton = document.getElementById("logout-btn");
        logoutButton.addEventListener("click", function () {
          console.log("logout clicked");
          chrome.storage.local.remove(["token"], function () {
            mainContainer.remove();
            chrome.runtime.sendMessage({ type: "showLoginPopup" });
          });
        });
        mainContainerEle = mainContainer;
      }
    });
  }
  
  if (mainContainerEle){
    mainContainerEle.style.display = 'flex';
  }
  console.log("createLoggedInContainer");

}

function getUserDataFromToken(token) {
  try {
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userData = {
      username: tokenPayload.email,
    };
    return userData;
  } catch (error) {
    console.error("Error decoding token or extracting user data:", error);
    return null;
  }
}

async function showHome() {
  createLoggedInContainer();
}

(async function () {
  console.log("showHome popup.");
  await showHome();
})();
