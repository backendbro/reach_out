let lastTypingTime 
let typing = false


$(document).ready(() => {

    socket.emit("join room", chatId);
    socket.on("typing", () => $(".typingDots").show());
    socket.on("stop typing", () => $(".typingDots").hide());

    

    $.get(`/api/chats/${chatId}`, (data) =>{ 
        $("#chatName").text(getChatName(data))
    })

    $.get(`/api/chats/${chatId}/messages`, (messageData) => {
        let messages = [];
        let lastSenderId = "";

        messageData.forEach((message, index) => {
            let html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);

            lastSenderId = message.sender._id;
        })
       
        const messagesHtml = messages.join("");
      
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(true);
        markMessagesAsRead()
    })

    $('.loadingSpinnerContainer').remove()
    $(".chatContainer").css('visibility', 'visible')
})



$("#chatNameButton").click(event => {
    const content = $("#chatNameTextbox").val()
    $.ajax({
        url:`/api/chats/${chatId}`,
        type:'PUT',
        data:{chatName:content},
        success:(data,status, xhr) => {
            if(xhr.status !== 204){
                alert('Could not update')
                return
            }   
            location.reload()
        }
    })    
})

$('.sendMessageButton').click(() => {
    messageSubmitted()
})

$(".inputTextbox").keydown(event => {
    updateTyping()
    if(event.which == 13 || event.keyCode == 13){
        messageSubmitted()
        return 
    }
})

function updateTyping(){
    if(!connected) return;
    if(!typing) {
        typing = true;
        socket.emit("typing", chatId);
    }

    lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    setTimeout(() => {
        let timeNow = new Date().getTime();
        let timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing) {
            socket.emit('stop typing', chatId)
            typing = false;
        }
    }, timerLength);
}

function messageSubmitted(){
    const content = $('.inputTextbox').val()
    if(content){
        sendMessage(content)
        $(".inputTextbox").val("")
        socket.emit('stop typing', chatId)
        typing=false
    }
}

async function sendMessage(content){
    const post = {
        content,
        chatId
    }

   $.ajax({
    url:`/api/messages/`,
    type:'POST',
    data:post,
    success:(messageData)=>{
        addMessageToChat(messageData)
    
        if(connected){
            socket.emit("new message", messageData)
        }
    } 
})
}

function addMessageToChat(messageData){
    let messageHtml = createMessageHtml(messageData, null, "")
    addMessagesHtmlToPage(messageHtml)
    scrollToBottom(true);   
}

function createMessageHtml(message, nextMessage, lastSenderId) {

    let sender = message.sender;
    let senderName = sender.full_name;

    let currentSenderId = sender._id;
    let nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    let isFirst = lastSenderId != currentSenderId;
    let isLast = nextSenderId != currentSenderId;

    let isMine = message.sender._id == userLoggedIn._id;
    let liClassName = isMine ? "mine" : "theirs";

    let nameElement = "";
    if(isFirst) {
        liClassName += " first";

        if(!isMine) {
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }

    let profileImage = "";
    if(isLast) {
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'>`;
    }

    let imageContainer = "";
    if(!isMine) {
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function addMessagesHtmlToPage(html) {
    $(".chatMessages").append(html);
}

function scrollToBottom(animated) {
    let container = $(".chatMessages");
    let scrollHeight = container[0].scrollHeight;


    if(animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    }
    else {
        container.scrollTop(scrollHeight);
    }
}


function markMessagesAsRead(){
    $.ajax({
        url:`/api/chats/${chatId}/messages/markAsRead`,
        type:'PUT',
        success:refreshMessagesBadge()
    })
}

$("#leaveGroupButton").click(() => {
    $.ajax({
        url:`/api/chats/${chatId}/leave`,
        type:'PUT',
        data:{userId:userLoggedIn._id},
        success:(data, status, xhr) => {
        if(xhr.status != 200){
            alert('Could not leave, Retry')
        }
       window.location.href = `/messages`
        }
    })
})

$("#deleteGroupButton").click(() => { 
    $.ajax({
        url:`/api/chats/${chatId}/delete`,
        type:'DELETE',
        data:{userId:userLoggedIn._id},
        success:(data, status, xhr) => {
        if(xhr.status != 200){
            alert('Could not leave, Retry')
        }
       window.location.href = `/messages`
        }
    })
})

