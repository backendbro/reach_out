$(document).ready(async() => {
    if(selectedTab != 'replies' && selectedTab != 'media'){
       getUserPost()
    }else if(selectedTab == 'replies'){
      getReplies()
    }else if(selectedTab == 'media'){
        getMedia()
    }
})

function getUserPost(){

  $.get('/api/posts', {postedBy:profileUserId, pinned:true}, postData => {
    outputPinnedPost(postData, $('.pinnedPostContainer'))
  })  

    $.get(`/api/posts`, {postedBy: profileUserId, getReply:false}, postData => {
        outputPosts(postData, $(".postsContainer"))
    })
}

function getReplies(){
    $.get(`/api/posts`, {postedBy: profileUserId, getReply:true}, postData => {
        outputPosts(postData, $(".postsContainer"))
    })
}

function getMedia(){
    $.get(`/api/posts`, {postedBy: profileUserId, getMedia:true}, postData => {
        outputPosts(postData, $('.postsContainer'))
    })
}

function outputPinnedPost(results, container){
    if(results.length == 0){
        container.hide()
        return;
    }
    
    container.html("")

    results.forEach(result => {
        const html = createPostHtml(result)
        container.append(html)
    })
}