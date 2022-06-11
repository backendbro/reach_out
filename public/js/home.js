$(document).ready(async () => {
    const response = await fetch(`/api/posts`)
    const postData = await response.json()
    outputPosts(postData, $(".postsContainer"))
})

