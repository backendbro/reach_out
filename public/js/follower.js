$(document).ready(() => {
    if(selectedTab !== 'followers'){
        $.get(`/api/users/${userId}/`, userData => {
            outputUsers(userData, $(".resultsContainer"))
        })
    }else{
        console.log('Follower')
    }
})

function outputUsers(results, container){
    console.log(results)
    container.html("")

    if(!Array.isArray(results)){
        results = [results]
    }
    results.forEach(result => {
        const html = createUserHtml(result)
        container.append(html)
    })

    if(results.length == 0){
        container.append(`<span class="noResult">Nothing to show</span>`)
    }
}

function createUserHtml(userData, showFollowButton) {

    var name = userData.full_name;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"

    var followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}