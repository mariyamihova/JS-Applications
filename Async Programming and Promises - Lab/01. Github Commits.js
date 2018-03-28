function loadCommits() {
    $("#commits").empty();

    let username=$('#username').val();
    let repo=$('#repo').val();

    let url=`https://api.github.com/repos/${username}/${repo}/commits`;

    $.get(url).then(displayInfo).catch(handleError);
    
    function displayInfo(allCommits) {
        for (let commit of allCommits)
            $("#commits").append($("<li>")
                .text(commit.commit.author.name + ": " +
                commit.commit.message
            ));

    }
    function handleError(er) {
        $("#commits").append($("<li>")
            .text(`Error: ${er.status} (${er.statusText})`));
    }
}
