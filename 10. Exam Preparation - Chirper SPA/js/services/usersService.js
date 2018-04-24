let users = (() => {
    function getAllUsers() {
        return remote.get('user', '', 'kinvey');
    }

    function loadUserFollowers(username) {
        let endpoint = `?query={"subscriptions":"${username}"}`;

        return remote.get('user', endpoint, 'kinvey');
    }
    function loadUserByUsername(username) {
        let endpoint = `?query={"username":"${username}"}`;

        return remote.get('user', endpoint, 'kinvey');
    }
    function modifyUser(userId, newSubs) {
        let newUser = {
            subscriptions: newSubs
        };

        return remote.update('user', userId, 'kinvey', newUser)
    }
    return {
        getAllUsers,
        loadUserFollowers,
        loadUserByUsername,
        modifyUser
    }
})();
