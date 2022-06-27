let lastTypingTime 
let typing = false

$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) =>{ 
        $("#chatName").text(getChatName(data))
    
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
            if(xhr.status !== 200){
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
    if(!typing) {
        typing = true;
    }

    lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    setTimeout(() => {
        let timeNow = new Date().getTime();
        let timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing) {
            typing = false;
        }
    }, timerLength);
}

function messageSubmitted(){
    const content = $('.inputTextbox').val()
    if(content){
        sendMessage(content)
        $(".inputTextbox").val("")
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
    } 
})

}

function addMessageToChat(messageData){
    console.log(messageData)
}