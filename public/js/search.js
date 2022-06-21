let timer;
$("#searchBox").keydown((event) => {
    clearTimeout(timer)
    let textbox = $(event.target)
    const searchQuery = textbox.data().search

   timer = setTimeout(() => {
        const data = textbox.val().trim()
        if(data == ""){
            $(".resultsContainer").html("")
        }else{
            search(data, searchQuery)
        }
   }, 1000)
})

function search(data, searchQuery){
    let url = searchQuery == "posts" ? `/api/posts` : `/api/users`
   if(searchQuery == "posts"){
    $.get(url, {search:data}, (result) => {
        outputPosts(result, $(".resultsContainer"))
    })
   }else{
    $.get(url, {search:data}, (result) => {
        outputUsers(result, $(".resultsContainer"))
    })
   }
}