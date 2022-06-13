$(document).ready(async () => {
    const response = await fetch(`/api/posts/${postId}`)
    const postData = await response.json()
    outputPostWithReply(postData, $(".postsContainer"))
})