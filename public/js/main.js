//GLOBAL VARIABLES
let data = new Object();
let formData;
let cropper;
let timer
let selectedUsers = []

$(document).ready(() => {
    refreshNotificationsBadge()
    refreshMessagesBadge()
})

//////////// =========== POST TEXTAREA AND BUTTON BEGIN ======= //////////
$("#postTextarea").keyup(event => {
    const textbox = $(event.target);
    const value = textbox.val().trim();
    
    const submitButton = $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#replyTextarea").keyup(event => {
    const textbox = $(event.target)
    const value = textbox.val().trim()

    const submitButton = $("#submitReplyButton")
    if(value == ""){
        submitButton.prop('disabled', true)
        return;
    }

    submitButton.prop('disabled', false)
})

$("#submitPostButton").click(async (event) => {
    const button = $(event.target);
    const textbox = $("#postTextarea");
    
    data = {
        content: textbox.val(),
        postImage: formData
    }

    
    if(data.postImage === undefined){
        displayGif()
        $.post(`/api/posts`, {value: data.content}, postData => {
        hideGif()
        displayPostData(postData, $(".postsContainer"), textbox, button)
    })
    }

   if (data.postImage !== undefined){
        const formData = data.postImage
        if(data.content !== undefined){
            formData.append('post', data.content)
            displayGif()
            $.ajax({
                url:`/api/posts`,
                type:'POST',
                data:formData,
                processData:false,
                contentType:false,
                success:() => {
                    hideGifImage()
                    location.reload()
                }
            })
        }else{
            displayGif()
            $.ajax({
                url:`/api/posts`,
                type:'POST',
                data:formData,
                processData:false,
                contentType:false,
                success:() => {
                    hideGifImage()
                    location.reload()
                }
            })
        }
        }else{
            return;
        }


})

function displayPostData(postData, container, textbox, button){
    const html = createPostHtml(postData)
    container.prepend(html)
    textbox.val("")
    button.prop('disabled', true)
}

$("#submitReplyButton").click(async (event) => {
    const button = $(event.target)
    const post = $("#replyTextarea").val()
    const postId = button.data().id
    
    if(postId == null) return console.log('PostId is null')

    const content = {
        value:post,
        replyTo:postId
    }

    $.ajax({
        url:'/api/posts',
        type:'POST',
        data:content,
        success:(postData) => {
            emitNotification(postData.replyTo.postedBy)
            location.reload()
        }
    })
})

//////////// =========== POST TEXTAREA AND BUTTON END ======= //////////



//////////// ===========  SEARCH BEGIN ========= //////////
$("#userSearchTextbox").keydown(event => {
    clearTimeout(timer)
    const textbox = $(event.target)
    let value = textbox.val()
    $("#createChatButton").prop('disabled', false)

    if(value == "" && (event.which == 8 || event.keyCode == 8 )){
        selectedUsers.pop()
        updateSelectedUsers()
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0){
            $("#createChatButton").prop('disabled', true)
        }
        return 
    }

    timer = setTimeout(() => {
        const data = textbox.val().trim()
        if(data == ""){
            $(".resultsContainer").html("")
        }else{
            getUsers(data)
        }
   }, 1000)
})
//////////// ===========  SEARCH END ========= //////////


//////////// =========== CHAT BEGIN ======== //////////
$("#createChatButton").click(async event => {
    const data = JSON.stringify(selectedUsers)
    $.post(`/api/chats`, {users:data}, chatData => {
        window.location.href = `/messages/${chatData._id}`
    })
})

function getUsers(searchTerm){
    $.get(`/api/users`, {search:searchTerm}, userData => {
        outputSelectedUsers(userData, $(".resultsContainer"))
    })
}

function outputSelectedUsers(results, container) {
    container.html("");

    results.forEach(result => {
        
        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)) {
            return;
        }

        const html = createUserHtml(result, false);
        const element = $(html);
        element.click(() => userSelected(result))

        container.append(element);
    });

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function userSelected(user){
    selectedUsers.push(user)
    updateSelectedUsers()
    $("#userSearchTextbox").val("").focus()
    $(".resultsContainer").html("")
    $("#createChatButton").prop('disabled', false)   
}

function updateSelectedUsers(){
    let elements = []

    selectedUsers.forEach(user => {
        const name = user.full_name
        const userElement = $(`<span class="selectedUser">${name}</span>`)
        elements.push(userElement)
    })

    $('.selectedUser').remove()
    $('#selectedUsers').prepend(elements)
}

function outputChatList(chatData, container){
    container.html("")

    chatData.forEach(chat => {       
        const html = createChatHtml(chat)
        container.append(html)
    })

    if(chatData.length == 0){
        container.append(`<span class="noResult">Nothing to show</span>`)
    }

}

function createChatHtml(chatData) {
    let chatName = getChatName(chatData);
    let image = getChatImageElements(chatData);
    let recentMessage = getRecentMessage(chatData.recentMessage);
    
    let activeClass = ""
    if(chatData.recentMessage && chatData.byMe !== userLoggedIn._id){
        activeClass=!chatData.recentMessage || chatData.recentMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
    }

    return `<div class="chat" data-id='${chatData._id}'>
        <a class='resultListItem ${activeClass}' href="/messages/${chatData._id}">
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${recentMessage}</span>
                </div>
               
            </a>
    </div>
    
    `;
}

function getChatName(chatData){
    let chatName = chatData.chatName
    if(!chatName){
        const otherChatUsers = getOtherChatUsers(chatData.users)
        const otherChatUsersNameArray = otherChatUsers.map(user => user.full_name)
        const namesArray = otherChatUsersNameArray.join(", ")
       chatName = namesArray
    }
    return chatName
}

function getOtherChatUsers(users){
    if(users.length == 1) return users
    return users.filter(user => user._id !== userLoggedIn._id)
}

function getChatImageElements(chatData){
    let otherChatUsers = getOtherChatUsers(chatData.users)
    let groupChatClass=""
    let chatImage = getUserChatImageElement(otherChatUsers[0])

    if(otherChatUsers.length > 1){
        groupChatClass="groupChatImage"
        chatImage+=getUserChatImageElement(otherChatUsers[1])
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
}

function getUserChatImageElement(user){
    if(!user || !user._id) return console.log('User object is not populated')
    return `<img src="${user.profilePic}" alt="User Profile Pic">`
}


function getRecentMessage(recentMessage){
    if(recentMessage != null){
        let sender = recentMessage.sender
        return `${sender.full_name}: ${recentMessage.content}`
    }

    return "New Chat"
}
//////////// =========== CHAT END  ======== //////////



///////////// ======= IMAGE UPLOAD BEGIN ======== /////////////////
$("#filePhoto").change(function(){
    if(this.files && this.files[0]){
        let reader = new FileReader()
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview')
            imagePreview.src = e.target.result

            if(cropper !== undefined){
                console.log('It exists')
                cropper.destroy()
            }

            cropper = new Cropper(imagePreview, {
                aspectRatio: 1/1,
                background:false
            })
            console.log(cropper)
        }
        reader.readAsDataURL(this.files[0])
    }
})

$("#coverPhoto").change(function(){
    if(this.files && this.files[0]){
        let reader = new FileReader()
        reader.onload = (e) => {
            const imagePreview = document.getElementById('coverPreview')
            imagePreview.src = e.target.result

            if(cropper !== undefined){
                console.log('It exists')
                cropper.destroy()
            }

            cropper = new Cropper(imagePreview, {
                aspectRatio: 16 / 9,
                background:false
            })
            console.log(cropper)
        }
        reader.readAsDataURL(this.files[0])
    }
})

$("#imageUploadButton").click(event => {
   const canvas = cropper.getCroppedCanvas()
   if(canvas == null){
    return console.log('There is no image, Please select an image')
   }

   canvas.toBlob(blob => {
    const formData = new FormData();
    formData.append('profileImageUpload', blob)
    $.ajax({
        type:'POST',
        url:`/api/users/profilepicture`,
        data:formData,
        processData: false,
        contentType: false,
        success:(xhr) => {
            if(xhr.status == 400){
                alert('Please reupload again')
            }
            location.reload()
        }
    })
   })
})

$("#coverPhotoButton").click(event => {
    const canvas = cropper.getCroppedCanvas()
    if(canvas == null){
     return console.log('There is no image, Please select an image')
    }
 
    canvas.toBlob(blob => {
     const formData = new FormData();
     formData.append('coverImageUpload', blob)
     $.ajax({
         type:'POST',
         url:`/api/users/coverpicture`,
         data:formData,
         processData: false,
         contentType: false,
         success:(xhr) => {
             if(xhr.status == 400){
                 alert('Please reupload again')
             }
             location.reload()
         }
     })
    })
})

$("#postFile").change(function(){
    if(this.files && this.files[0]){
        const reader = new FileReader()
        reader.onload = async (e) => {
            const image = e.target.result

            const display = await fetch(image)
            const blob = await display.blob()

            formData = new FormData()
            formData.append('postImage', blob)
            $("#submitPostButton").prop('disabled', false)
        }
        
        reader.readAsDataURL(this.files[0])
    }
})
///////////// ======= IMAGE UPLOAD END ======== /////////////////


///////////// ======= FOLLOW, LIKE, SHARE, DELETE, PIN, VIEW IMAGE BEGIN ======== /////////////////

$(document).on('click', '.followButton', async event => {
    const button = $(event.target)
   const userId = button.data().user
    if(userId == undefined) return 

   const response = await fetch(`/api/users/${userId}/follow`, {
    method:'PUT',
    headers:{
        "Content-type":"application/json"
    }
   })
   
   const userData = await response.json()
   
   let difference =  1
   if(userData.followers && userData.followers.includes(userLoggedIn._id)){
    button.addClass('following')
    button.text('Following')
    emitNotification(userId)
    }else{
    button.removeClass('following')
    button.text('Follow')
    difference = -1
    }

    let followersLabel = $("#followersValue");
   if(followersLabel.length != 0) {
       let followersText = followersLabel.text();
       followersText = parseInt(followersText);
       followersLabel.text(followersText + difference);
   }
})

$(document).on('click','.likeButton', async event => {
    const button = $(event.target)
    const postId = getPostId(button)
    if(postId === undefined) return;

    const response = await fetch(`/api/posts/${postId}/like`, {
        method:'PUT',
        headers:{
            "Content-type":"application/json"
        }
    })
    const postData = await response.json()
    button.find("span").text(postData.likes.length || "")
    if(postData.likes.includes(userLoggedIn._id)){
        button.addClass('active')
        emitNotification(postData.postedBy)
    }else{
        button.removeClass('active')
    }
})

$(document).on("click", ".shareButton", async (event) => {
    let button = $(event.target);
    let postId = getPostId(button);
    
    if(postId === undefined) return;

    const response = await fetch(`/api/posts/${postId}/share`, {
        method:'POST',
        headers:{
            "Content-type":'application/json'
        }
    })

    const postData = await response.json()
    button.find('span').text(postData.sharedUsers.length || "")
    if(postData.sharedUsers.includes(userLoggedIn._id)){
        button.addClass('active')
        emitNotification(postData.postedBy)
    }else{
        button.removeClass('active')
    }

})

$(document).on('click', '.postImg', async event => {
    const image = $(event.target)
    const postId = getPostId(image)
    if(postId == null) return;

    const response = await fetch(`/api/posts/${postId}/getImage`)
    const postImageUrl = await response.text()
    window.location.href = postImageUrl
})

$(document).on('click', '.post', async event => {
    const post = $(event.target)
    const postId = getPostId(post)
    if(postId === undefined) return;

    if(postId !== null && !post.is('button') && !post.is('img') && !post.is('li')){
        window.location.href = `/post/${postId}`
    }
})

$(document).on('click', '.deleteButton', async event => {
    const button = $(event.target)
    const postId = getPostId(button)
    if(postId == null) return 

    const response = await fetch(`/api/posts/${postId}`, {
        method:'DELETE',
        headers:{
            'Content-type':'application/json'
        }
    })
    location.reload()
    
})

$(document).on('click', '#pinPostButton', async event => {
    const button = $(event.target)
    const postId  = button.data().id
    if(postId == undefined) return 

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not pin post");
                return;
            }
               
            location.reload();
        }
    }) 
 
})


$(document).on('click', "#unpinPostButton", async event => {
    const button = $(event.target)
    const postId = button.data().id
    if(postId ==  undefined) return 

   $.ajax({
    url:`/api/posts/${postId}`,
    type:'PUT',
    data:{pinned:false},
    success:(data, status, xhr) => {
        if(xhr.status !== 204){
            alert("could not pin post");
            return;
        }

        location.reload()
    }
   })
})
///////////// ======= FOLLOW, LIKE, SHARE, DELETE, PIN, VIEW IMAGE END ======== /////////////////


//////////// ========== MODAL EVENTS BEGIN =========== ///////////////
$("#confirmPinModal").on('show.bs.modal', async event => {
    const button = $(event.relatedTarget)
    const postId = getPostId(button)
    if(postId == null) return 
    $("#pinPostButton").data('id', postId)
})

$("#unpinModal").on('show.bs.modal', async event => {
    const button = $(event.relatedTarget)
    const postId = getPostId(button)
    if(postId == null) return 
    $("#unpinPostButton").data("id", postId)
})

$("#replyModal").on('show.bs.modal', async event => {
    const button = $(event.relatedTarget)
    const postId = getPostId(button)

    if(postId == null) return 
    $("#submitReplyButton").data("id", postId)
   
    const response = await fetch(`/api/posts/${postId}`)
    const results = await response.json()
    outputPosts(results.postData, $("#originalPostContainer"))
})

$("#replyModal").on("hidden.bs.modal", () => {
    $("#replyTextarea").val("")
    $("#originalPostContainer").html("")
});

//////////// ========== MODAL EVENTS END =========== ///////////////

///////////// =========  GET POST ID BEGIN =========== //////////////
function getPostId(element){
    const isRoot = element.hasClass('post')
    const rootElement = isRoot ? element : element.closest('.post')
    const postId = rootElement.data().id

    if(postId == null) return console.log('PostId is undefined')
    return postId
}
//////////// ========= GET POST ID END ============= ////////////////

//////////// ========== CREATING AND OUTPUTTING POST HTML BEGIN ======== /////////////
function createPostHtml(postData, largeFont=false) {

    if(postData == null) return alert("post object is null");

    const isShared = postData.sharedData !== undefined;
    const sharedBy = isShared ? postData.postedBy.username : null;
    postData = isShared ? postData.sharedData : postData;

    
    const postedBy = postData.postedBy;
        if(postedBy._id === undefined) {
            return console.log("User object not populated");
        }
   
    let replyToText = ""
    if(postData.replyTo && postData.replyTo._id){
            const replyTo = postData.replyTo.postedBy.username
            replyToText = `<span>
            Replying to <a href='/profile/${replyTo}'>@${replyTo}</a>    
        </span>`
        }else if (postData.isReply && postData.replyTo == null){
            replyToText = `<span>
            Replying to a deleted post 
        </span>`
        }

        let largeFontClass=""
        if(largeFont){
            largeFontClass = "largeFont"
        }

    const displayName = postedBy.full_name
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    const shareButtonActiveClass = postData.sharedUsers.includes(userLoggedIn._id) ? "active" : "";

    let postImage = ""
    if(postData.postImage){
       postImage = `
       <img class="postImg" src="${postData.postImage}" alt="" />
       `
    } 

    let sharedText = '';
    if(isShared) {
        sharedText = `<span>
                        <i class='fas fa-share'></i>
                        Shared by <a href='/profile/${sharedBy}'>@${sharedBy}</a>    
                    </span>`
    }

    let button = ""
    let pinnedPostText = ""
    let pinName = `<i class="fas fa-thumbtack"></i>`
    if(postData.postedBy._id == userLoggedIn._id){        
    let dataTarget = "#confirmPinModal"

    if(postData.pinned == true){
        dataTarget = "#unpinModal"
        pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
        pinName = `<i class="fas fa-unlink"></i>`
    }

        button = `
        <div class="dropDown">
        <button>
        <div class="buttonLink">
        <li class="hov"><i class="fas fa-ellipsis-v"></i>
          <ul class="mainLink">
            <li class="deleteButton"><i class="fas fa-trash"></i></li>
            <li data-toggle="modal" data-target="${dataTarget}">${pinName}</li>

          </ul>
        </li>
      </nav>
      </button>
      </div>
      `
    }
    
   if( replyToText !== ""){
     return ` <div class="post" data-id=${postData._id}>
     <div class='postActionContainer'>
                     ${replyToText}
                 </div>
     <div class='mainContentContainer'>
                     <div class='userImageContainer'>
                         <img src='${postedBy.profilePic}'>
                     </div>
                     <div class='postContentContainer'>
                     
                      <div class='pinnedPostText'>${pinnedPostText}</div>
                         <div class='header'>
                             <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                             <span class='username'>@${postedBy.username}</span>
                             <span class='date'>${timestamp}</span>
                             <a href="#">
                                ${button}
                            </a>
                             </div>
                             
                         <div class='postBody'>
                             <span class="">${postData.post}</span>
                             ${postImage}
                         </div>
                         
                         <div class="post-row">
                         <div class="activity-icons">
                             <div class='postButtonContainer'>
                             <button  data-toggle='modal' data-target='#replyModal'>
                                 <i class='far fa-comment'></i>
                                 
                             </button>
                             </div>
                             <div class='postButtonContainer blue'>
                             <button class='shareButton ${shareButtonActiveClass}'>
                                 <i class='fas fa-share'></i>
                                 <span>${postData.sharedUsers.length || ""}</span>
                             </button>
                         </div>
                         <div class='postButtonContainer red'>
                         <button class='likeButton ${likeButtonActiveClass}'>
                             <i class='far fa-heart'></i>
                             <span>${postData.likes.length || ""}</span>
                             </button>
                     </div>
                         </div>
                         
                     </div>
     
                     </div>
                 </div>
     </div>	`
   }else{
    return `
    <div class="post-containers post" data-id=${postData._id}>
    <div class='postActionContainer'>
                    ${sharedText}
                </div>
    <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                    
                     <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            <a href="#">
                                ${button}
                            </a>
                            </div>
                            
                        <div class='postBody'>
                            <span class="">${postData.post}</span>
                            ${postImage}
                        </div>
                        
                        <div class="post-row">
						<div class="activity-icons">
							<div class='postButtonContainer'>
                            <button  data-toggle='modal' data-target='#replyModal'>
                                <i class='far fa-comment'></i>
                            </button>
							</div>
                            <div class='postButtonContainer blue'>
                            <button class='shareButton ${shareButtonActiveClass}'>
                                <i class='fas fa-share'></i>
                                <span>${postData.sharedUsers.length || ""}</span>
                            </button>
                        </div>
                        <div class='postButtonContainer red'>
                        <button class='likeButton ${likeButtonActiveClass}'>
                            <i class='far fa-heart'></i>
                            <span>${postData.likes.length || ""}</span>
                            </button>
                    </div>
						</div>
						
					</div>
    
                    </div>
                </div>
    </div>	

    `
   }
}

function outputPosts(results, container) {
    container.html("");

    if(!Array.isArray(results)){
        results = [results]
    }
   
    results.forEach(result => {
        let html = createPostHtml(result,)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function outputPostWithReply(results, container){
   container.html("")
   
   if(results.replyTo !== undefined && results.replyTo._id !== undefined){
    const html = createPostHtml(results.replyTo, largeFont=true)
    container.append(html)
   }


   const mainPostHtml = createPostHtml(results.postData)
   container.append(mainPostHtml)
  

   results.replies.forEach(reply => {
    const html = createPostHtml(reply)
    container.append(html)
   })
}
//////////// ========== CREATING AND OUTPUTTING POST HTML END ======== /////////////



//////////// ========== CREATING AND OUTPUTTING USER HTML BEGIN ======== /////////////
function outputUsers(results, container){
    
    container.html("")
    
    results.forEach(result => {
        const html = createUserHtml(result, showFollowButton=true)
        container.append(html)
    })

    if(results.length == 0){
        container.append(`<span class="noResult">Nothing to show</span>`)
    }
}

function createUserHtml(userData, showFollowButton) {

    let name = userData.full_name;
    let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    let text = isFollowing ? "Following" : "Follow"
    let buttonClass = isFollowing ? "followButton following" : "followButton"

    let followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}
//////////// ========== CREATING AND OUTPUTTING USER HTML BEGIN ======== /////////////


//////////// ========== REFACTORING TIME BEGIN ======== /////////////
function timeDifference(current, previous) {

    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}
//////////// ========== REFACTORING TIME BEGIN ======== /////////////

/////////// ========== DISPLAYING GIF BEGIN ========= /////////////
function displayGif(){
    const imageSpinner = $(".imageSpinner")
    const img = document.createElement('img')
    img.src = `/images/loadingSpinner.gif`
    imageSpinner.append(img)
    $(".postsContainer").css('visibility', 'hidden')
    }

function hideGif(){
    $(".imageSpinner").css('visibility', 'hidden')
    $(".mainSectionContainer").find("div.imageSpinner").remove()
    $(".postsContainer").css('visibility', 'visible')
    }

function hideGifImage(){
    $(".imageSpinner").css('visibility', 'hidden')
    $(".mainSectionContainer").find("div.imageSpinner").remove()
}
/////////// ========== DISPLAYING GIF BEGIN ========= /////////////


/////////// ========== DISPLAYING MESSAGE POP UP BEGIN ========= /////////////
function newMessageRecieved(newMessage){
    if($(`[data-room = "${newMessage.chat._id}"]`).length == 0){
        showMessagePopup(newMessage)
        refreshMessagesBadge()
    }else{
        addMessageToChat(newMessage)
    }
}

function showMessagePopup(data) {
    if(!data.chat.recentMessage._id) {
        data.chat.recentMessage = data;
    }

    let html = createChatHtml(data.chat);
    let element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function refreshMessagesBadge() {
    let newData = []
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        data.forEach(data => {
            if(data.recentMessage.sender._id !== userLoggedIn._id){
                newData.push(data)
            }
        })
        let numResults = newData.length;

        if(numResults > 0) {
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            $("#messagesBadge").text("").removeClass("active");
        }

    })
}
/////////// ========== DISPLAYING MESSAGE POP UP BEGIN ========= /////////////



////////// ============ NOTIFICATION BEGIN ============ ///////////
function outputNotifications(results, container){
    container.html('')

    results.forEach(result => {
        const html = createNotificationHtml(result)
        container.append(html)
    })

    if(results.length == 0){
        container.append(`<span class="noResult">Nothing to Show </span>`)
    }
}

function createNotificationHtml(notification) {
    let userFrom = notification.userFrom;
    let text = getNotificationText(notification);
    let href = getNotificationUrl(notification);
    let className = notification.opened ? "" : "active";
    
    return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification) {

    let userFrom = notification.userFrom;

    if(!userFrom.full_name) {
        return alert("user from data not populated");
    }

    let userFromName = `${userFrom.full_name}`;

    let text;

    if(notification.notificationType == "shared") {
        text = `${userFromName} shared one of your posts`;
    }
    else if(notification.notificationType == "like") {
        text = `${userFromName} liked one of your posts`;
    }
    else if(notification.notificationType == "Reply") {
        text = `${userFromName} replied to one of your posts`;
    }
    else if(notification.notificationType == "follow") {
        text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) { 
    let url = "#";

    if(notification.notificationType == "shared" || 
        notification.notificationType == "like" || 
        notification.notificationType == "reply") {
            
        url = `/post/${notification.entityId}`;
    }
    else if(notification.notificationType == "follow") {
        url = `/profile/${notification.entityId}`;
    }

    return url;
}

$(document).on('click', ".notification.active", (e) => {
    const container = $(e.target);
    const notificationId = container.data().id

    let href = container.attr("href");
    e.preventDefault();

    let callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
})
 
function markNotificationsAsOpened(notificationId = null, callback = null) {
   
    if(callback == null) callback = () => location.reload();

    let url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
   
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
    })
}

function refreshNotificationsBadge() {
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        
        let numResults = data.length;
        if(numResults > 0) {
            $("#notificationBadge").text(numResults).addClass("active");
        }
        else {
            $("#notificationBadge").text("").removeClass("active");
        }

    })
}

function showNotificationPopup(data) {
    let html = createNotificationHtml(data);
    let element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}
////////// ============ NOTIFICATION END============ ///////////