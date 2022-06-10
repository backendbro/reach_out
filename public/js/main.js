let data = new Object();
let formData;

$("#postTextarea").keyup(event => {
    const textbox = $(event.target);
    const value = textbox.val().trim();
    
    var submitButton = $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

function displayPostData(postData, container, textbox, button){
    const html = createPostHtml(postData)
    container.prepend(html)
    textbox.val("")
    button.prop('disabled', true)
}

$("#submitPostButton").click(async (event) => {
    const button = $(event.target);
    const textbox = $("#postTextarea");

    data = {
        content: textbox.val(),
        postImage: formData
    }

    if(data.postImage === undefined){
        $.post(`/api/posts`, {value: data.content}, postData => {
        displayPostData(postData, $(".postsContainer"), textbox, button)
    })
    }

   if (data.postImage !== undefined){
        const formData = data.postImage
        if(data.content !== undefined){
            formData.append('post', data.content)
            $.ajax({
                url:`/api/posts`,
                type:'POST',
                data:formData,
                processData:false,
                contentType:false,
                success:(postData) => {
                    displayPostData(postData, $(".postsContainer"), textbox, button)
                }
            })
        }else{
           
            $.ajax({
                url:`/api/posts`,
                type:'POST',
                data:formData,
                processData:false,
                contentType:false,
                success:(postData) => {
                    console.log(postData)
                }
            })
        }
        }else{
            return;
        }


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
            console.log(formData)
            $("#submitPostButton").prop('disabled', false)
            
           
        }
        reader.readAsDataURL(this.files[0])
    }
})


$(document).on('click','.likeButton', async event => {
    const button = $(event.target)
    const postId = getPostId(button)
    
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
    }else{
        button.removeClass('active')
    }
})

$(document).on("click", ".shareButton", async (event) => {
    var button = $(event.target);
    var postId = getPostId(button);
    
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
    }else{
        button.removeClass('active')
    }

})

function getPostId(element){
    const isRoot = element.hasClass('post')
    const rootElement = isRoot ? element : element.closest('.post')
    const postId = rootElement.data().id

    if(postId == null) return console.log('PostId is undefined')
    return postId
}

function createPostHtml(postData) {

    if(postData == null) return alert("post object is null");

    const isShared = postData.sharedData !== undefined;
    const sharedBy = isShared ? postData.postedBy.username : null;
    postData = isShared ? postData.sharedData : postData;

    
    const postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated");
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

    var sharedText = '';
    if(isShared) {
        sharedText = `<span>
                        <i class='fas fa-retweet'></i>
                        Shared by <a href='/profile/${sharedBy}'>@${sharedBy}</a>    
                    </span>`
    }

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${sharedText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.post}</span>
                            ${postImage}
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button>
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
            </div>`;
}

function outputPosts(results, container) {
    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

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