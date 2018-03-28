function attachEvents() {

    const URL = "https://baas.kinvey.com/appdata/kid_r1xE0dM9f/"
    const username = 'peter';
    const password = 'p';
    const base64auth = btoa(username + ":" + password);
    const authHeaders = {'Authorization': 'Basic ' + base64auth};
    let posts={};

    $("#btnLoadPosts").click(loadPostsClick);
    $("#btnViewPost").click(viewPostClick);
    
    function viewPostClick() {
        let postId=$('#posts').val();
        let title=$('#posts').find('option:selected').text();
        //$('#post-title').empty();
        $('#post-title').text(title);
        $('#post-body').append(`<li>${posts[postId]}</li>`);

        $.ajax({
            url: URL + `comments/?query={"post_id":"${postId}"}`,
            headers: authHeaders

        }).then(function(res){
            $('#post-comments').empty();
            for(let com of res){
                $('#post-comments').append(`<li>${com.text}</li>`)
            }

        })
            .catch(displayError);
        
    }
    function loadPostsClick() {
        $.ajax({
            url: URL + 'posts',
            headers: authHeaders
        }).then(displayPosts).catch(displayError)
    }

    function displayPosts(res) {
        $("#posts").empty();
        for (let post of res) {
            let option = $("<option>")
                .text(post.title)
                .val(post._id);
            $("#posts").append(option);
            posts[post._id]=post.body;
            console.log(posts);
        }

    }
    function displayError(err) {
        let errorDiv = $("<div>").text("Error: " +
            err.status + ' (' + err.statusText + ')');
        $(document.body).prepend(errorDiv);
        setTimeout(function() {
            $(errorDiv).fadeOut(function() {
                $(errorDiv).remove();
            });
        }, 3000);

    }
}
