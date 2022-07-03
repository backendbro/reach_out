$(document).ready(async () => {
    const response = await fetch(`/api/chats`, {unreadOnly:true})
    const chatData = await response.json()
    outputChatList(chatData, $(".resultsContainer"))
})

