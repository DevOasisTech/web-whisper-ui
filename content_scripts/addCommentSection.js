chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "Tab-addCommentPopup") {
    console.log(
      "--------------AddCommentSection Comment message.type--------------",
      message.type
    );
    showAddCommentsPopup(message.params);
    return false;
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function showAddCommentsPopup(params) {
  await sleep(60);
  let userPostCommentsForm = `
  <div class="container">
  <div class="success-message">You have added comment successfully.</div>
    <div class="comment-box">
    <mark class="comment-text">${params?.selectionText}</mark>
    </div>
      <input type="text" class="comment-input" id="comment-input" placeholder="Write a comment...">
        <div class="cta-buttons">
          <button class="cta-button post-button" id="post-button">Comment</button>
        </div>
    </div>
`;

  if (!params?.selectionText) {
    userPostCommentsForm = `
  <div class="container">
  <div class="success-message">You have added comment successfully.</div>
      <input type="text" class="comment-input" id="comment-input" placeholder="Write a comment...">
        <div class="cta-buttons">
          <button class="cta-button post-button" id="post-button">Comment</button>
        </div>
    </div>
`;
  }
  let devider = `<div style="border-bottom: 1px solid rgb(242, 242, 242); padding: 20px 0px"></div>`;
  let responses = `<div style="font-size: 22px; font-weight: bold; padding: 20px 0px;">All Comments</div>`;

  const addCommentSection = document.getElementById("add-comment-section");
  let modalContentHtml = userPostCommentsForm + devider + responses;
  addCommentSection.innerHTML = modalContentHtml;

  const postButton = document.getElementById("post-button");
  let token = "";
  chrome.storage.local.get(["token"], function (result) {
    token = result.token;
  });

  postButton.addEventListener("click", async function () {
    createCommentApi(token, params);
  });
}

async function createCommentApi(token, params) {
  const commentInput = document.getElementById("comment-input");
  const successMessage = document.querySelector(".success-message");

  const data = {
    identifier: params?.identifier || null,
    url: window.location.href || "",
    comment: commentInput.value || "",
    identifier_id: params?.identifierId || null,
    anchor_text: params?.selectionText || "",
  };

  const addCommentApiUrl = "http://localhost:8000/v1/comments";
  let requestData = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: token,
    },
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(addCommentApiUrl, requestData);
    if (!response.ok) {
      throw new Error("Something went wrong");
    }
    const data = await response.json();
    successMessage.style.display = "block";
    commentInput.value = "";

    if (!params?.selectionText){
      chrome.runtime.sendMessage({ type: "showCommentPopup", kind: "page"});
    }else{
      chrome.runtime.sendMessage({ type: "showCommentPopup", identifier: params?.identifier, 
      identifierId: data.position_id, selectionText: params?.selectionText, kind: "selection"});
    }


    if (!params?.identifierId && data.position_id) {
      chrome.runtime.sendMessage({
        type: "highlightAnchorText",
        identifier: params?.identifier,
        identifierId: data.position_id,
      });
      params.identifierId = data.position_id;
    }
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 2000);
  } catch (error) {
    console.error("API error:", error);
    // errorMsg.textContent = error.message;
  }
}

function addStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
  .success-message {
    background-color: lightgreen;
    color: black;
    padding: 10px;
    text-align: center;
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 5px;
    width: 100%;
    font-size: 12px;
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

.comment-container {
    display: flex;
    flex-direction: column;
    padding: 10px;
    margin-bottom: 10px;
    position: relative;
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
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
  }
  .container {
    position: relative;
    width: 300px;
    padding: 20px;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 8px;
}

.user-name {
  font-size: 18px;
  margin-bottom: 10px;
}

.comment-box {
  border-radius: 4px;
  font-size: 16px;
  padding: 15px 0px;
}

.comment-input {
    width: 100%;
    padding: 14px 10px !important;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
}

.cta-buttons {
    display: flex;
    justify-content: space-between;
}

.cta-button {
    padding: 8px 16px;
    border: none;
    cursor: pointer;
}

.post-button {
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
