$(document).ready(() => {
    $.get(`/api/notifications`,notificationData => {
        outputNotifications(notificationData, $(".resultsContainer"))
    })
})

$("#markNotificationsAsRead").click(() =>  markNotificationsAsOpened())
