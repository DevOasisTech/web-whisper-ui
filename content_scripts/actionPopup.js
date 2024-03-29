(async function() {
  console.log("Add Comment- start");
  chrome.runtime.sendMessage({type: 'checkLoginStatus'}, response => {
      console.log('Received response:', response);
      if (response.isLoggedIn) {
          console.log("Add Comment- isLoggedIn");
          chrome.runtime.sendMessage({ type: "ShowHome" }, () => {
            chrome.runtime.sendMessage({ type: "addCommentPopup"});
            chrome.runtime.sendMessage({ type: "showCommentPopup", kind: "page"});
          });
      } else{
        console.log("Add Comment- isLoggedOut");
        chrome.runtime.sendMessage({type: 'showLoginPopup'});
      }
  });
})();