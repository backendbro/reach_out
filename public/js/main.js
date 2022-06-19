let data = new Object();
let formData;
let cropper;

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
        success:() => {
           location.reload()
        }
    })
})

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
        type:'PUT',
        url:`/api/posts/profilepicture`,
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
         type:'PUT',
         url:`/api/posts/coverpicture`,
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
    
    if(postId !== null && !post.is('button') && !post.is('img') && !post.is('li')){
        window.location.href = `/post/${postId}`
    }
})

$(document).on('click', '.deleteButton', async event => {
    const button = $(event.target)
    const postId = getPostId(button)
    if(postId == null) return console.log('PostId is null')
    const response = await fetch(`/api/posts/${postId}`, {
        method:'DELETE',
        headers:{
            'Content-type':'application/json'
        }
    })
    const postData = await response.json()
    if(postData){
    location.reload()
    }
    
})

$(document).on('click', '#pinPostButton', async event => {
    const button = $(event.target)
    const postId  = button.data().id
    if(postId == undefined) return console.log('PostId is undefined')

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    }) 
 
})

$("#confirmPinModal").on('show.bs.modal', async event => {
    const button = $(event.relatedTarget)
    const postId = getPostId(button)
    $("#pinPostButton").data('id', postId)
})

$("#replyModal").on('show.bs.modal', async event => {
    const button = $(event.relatedTarget)
    const postId = getPostId(button)

    if(postId == null) return console.log('PostId is null')
    $("#submitReplyButton").data("id", postId)
   
    const response = await fetch(`/api/posts/${postId}`)
    const results = await response.json()
    outputPosts(results.postData, $("#originalPostContainer"))
})

$("#replyModal").on("hidden.bs.modal", () => {
    $("#replyTextarea").val("")
    $("#originalPostContainer").html("")
});


function getPostId(element){
    const isRoot = element.hasClass('post')
    const rootElement = isRoot ? element : element.closest('.post')
    const postId = rootElement.data().id

    if(postId == null) return console.log('PostId is undefined')
    return postId
}

function createPostHtml(postData, comment=false) {

    if(postData == null) return alert("post object is null");

    const isShared = postData.sharedData !== undefined;
    const sharedBy = isShared ? postData.postedBy.username : null;
    postData = isShared ? postData.sharedData : postData;

    
    const postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated");
    }

    let replyToText = ""
    if(comment && postData.replyTo && postData.replyTo._id){
            const replyTo = postData.replyTo.postedBy.username
            replyToText = `<span>
            Replying to <a href='/profile/${replyTo}'>@${replyTo}</a>    
        </span>`
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
    if(postData.postedBy._id == userLoggedIn._id){        
        button = `<button class='pinButton'>
        <nav>
        <li class="hov"><i class="fas fa-ellipsis-v"></i>
          <ul class="mainLink">
            <li class="deleteButton">DELETE</li>
            <li data-toggle="modal" data-target="#confirmPinModal">PIN</li>
          </ul>
        </li>
      </nav>
      </button>`
    }
    
   
    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${sharedText}
                    ${replyToText}
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
                            ${button}
                            </div>
                            
                        <div class='postBody'>
                            <span>${postData.post}</span>
                            ${postImage}
                        </div>
                        <div class='postFooter'>
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
            </div>`;
}

function outputPosts(results, container) {
    container.html("");

    if(!Array.isArray(results)){
        results = [results]
    }

    results.forEach(result => {
        var html = createPostHtml(result, comment=true)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function outputPostWithReply(results, container){
   container.html("")

   if(results.replyTo !== undefined && results.replyTo._id !== undefined){
    const html = createPostHtml(results.replyTo)
    container.append(html)
   }

   const mainPostHtml = createPostHtml(results.postData, true)
   container.append(mainPostHtml)

   results.replies.forEach(reply => {
    const html = createPostHtml(reply, true)
    container.append(html)
   })

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

function displayPostData(postData, container, textbox, button){
    const html = createPostHtml(postData)
    container.prepend(html)
    textbox.val("")
    button.prop('disabled', true)
}