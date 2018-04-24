let chirps = (() => {
    function getAllChirps() {
        //const endpoint = 'chirps?query={"author":{"$in": [subs]}}&sort={"_kmd.ect": 1}';

        return remote.get('appdata', 'chirps', 'kinvey');
    }

    function createChirp(author, text) {
        let data = { author, text };

        return remote.post('appdata', 'chirps', 'kinvey', data);
    }

    function editPost(postId, author, title, description, url, imageUrl) {
        const endpoint = `posts/${postId}`;
        let data = { author, title, description, url, imageUrl };

        return remote.update('appdata', endpoint, 'kinvey', data);
    }

    function deleteChirp(chirpId) {
        const endpoint = `chirps/${chirpId}`;

        return remote.remove('appdata', endpoint, 'kinvey');
    }

    function getMyChirps(username) {
        const endpoint = `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }


    function loadAllChirpsByUsername(username) {
        let endpoint = `chirps?query={"author":"${username}"}&sort={"_kmd.ect": -1}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }
    function loadFollowersChirps(subs) {
        let endpoint = `chirps?query={"author":{"$in": [${subs}]}}&sort={"_kmd.ect": -1}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }
    return {
        getAllChirps,
        createChirp,
        editPost,
        deleteChirp,

        getMyChirps,
        loadAllChirpsByUsername,
        loadFollowersChirps
    }
})();
