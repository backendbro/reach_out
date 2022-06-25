$(document).ready(async () => {
    const response = await fetch(`/api/chats`)
    const chatData = await response.json()
    outputChatList(chatData, $(".resultsContainer"))
})

function outputChatList(chatData, container){
    container.html("")

    chatData.forEach(chat => {
        const html = createChatHtml(chat)
        container.append(html)
    })

    if(chatData.length == 0){
        container.append(`<span class="noResult">Nothing to show</span>`)
    }
}



function createChatHtml(chatData) {
    let chatName = getChatName(chatData);
    let image = getChatImageElements(chatData);
    let recentMessage = getRecentMessage(chatData.recentMessage);

    let activeClass = !chatData.recentMessage || chatData.recentMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
    
    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${recentMessage}</span>
                </div>
            </a>`;
}

function getChatName(chatData){
    let chatName = chatData.chatName
    if(!chatName){
        const otherChatUsers = getOtherChatUsers(chatData.users)
        const otherChatUsersNameArray = otherChatUsers.map(user => user.full_name)
        const namesArray = otherChatUsersNameArray.join(", ")
       chatName = namesArray
    }
    return chatName
}

function getOtherChatUsers(users){
    if(users.length == 1) return users
    return users.filter(user => user._id !== userLoggedIn._id)
}

function getChatImageElements(chatData){
    let otherChatUsers = getOtherChatUsers(chatData.users)
    let groupChatClass=""
    let chatImage = getUserChatImageElement(otherChatUsers[0])

    if(otherChatUsers.length > 1){
        groupChatClass="groupChatImage"
        chatImage+=getUserChatImageElement(otherChatUsers[1])
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
}

function getUserChatImageElement(user){
    if(!user || !user._id) return console.log('User object is not populated')
    return `<img src="${user.profilePic}" alt="User Profile Pic">`
}


function getRecentMessage(recentMessage){
    if(recentMessage != null){
        let sender = recentMessage.sender
        return `${sender.full_name}: ${recentMessage.content}`
    }

    return "New Chat"
}