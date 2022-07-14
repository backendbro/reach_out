
$(document).ready(() => {
    $.get(`/api/posts`, {showOnlyFollowingPost:true} , postData => {
        outputPosts(postData, $(".postsContainer"))
    })
})

