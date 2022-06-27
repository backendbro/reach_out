$(document).ready(async () => {
    const response = await fetch(`/api/chats`)
    const chatData = await response.json()
    outputChatList(chatData, $(".resultsContainer"))
})

