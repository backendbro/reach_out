$(document).ready(() => {
    if(selectedTab !== 'followers'){
        $.get(`/api/users/${userId}/following`, userData => {
            outputUsers(userData, $(".resultsContainer"))
        })
    }else{
        $.get(`/api/users/${userId}/follower`, userData => {
            outputUsers(userData, $(".resultsContainer"))
        })
    }
})

