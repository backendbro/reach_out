$(document).ready(() => {
    $.get(`/api/notifications`,notificationData => {
        outputNotifications(notificationData, $(".resultsContainer"))
    })
})

function outputNotifications(results, container){
    container.html('')

    results.forEach(result => {
        const html = createNotificationHtml(result)
        container.append(html)
    })

    if(results.length == 0){
        container.append(`<span class="noResult">Nothing to Show </span>`)
    }
}



function createNotificationHtml(notification) {
    let userFrom = notification.userFrom;
    let text = getNotificationText(notification);
    let href = getNotificationUrl(notification);
    let className = notification.opened ? "" : "active";

    return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification) {

    let userFrom = notification.userFrom;

    if(!userFrom.full_name) {
        return alert("user from data not populated");
    }

    let userFromName = `${userFrom.full_name}`;

    let text;

    if(notification.notificationType == "shared") {
        text = `${userFromName} shared one of your posts`;
    }
    else if(notification.notificationType == "like") {
        text = `${userFromName} liked one of your posts`;
    }
    else if(notification.notificationType == "reply") {
        text = `${userFromName} replied to one of your posts`;
    }
    else if(notification.notificationType == "follow") {
        text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) { 
    let url = "#";

    if(notification.notificationType == "shared" || 
        notification.notificationType == "like" || 
        notification.notificationType == "reply") {
            
        url = `/post/${notification.entityId}`;
    }
    else if(notification.notificationType == "follow") {
        url = `/profile/${notification.entityId}`;
    }

    return url;
}