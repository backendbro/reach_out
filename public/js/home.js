$(document).ready(async () => {
    $.get(`/api/posts`, {showOnlyFollowingPost:true} , postData => {
        outputPosts(postData, $(".postsContainer"))
    })
})

