let auth = (() => {
    function isAuth() {
        return sessionStorage.getItem('authtoken') !== null;
    }

    function saveSession(userData) {
        sessionStorage.setItem('authtoken', userData._kmd.authtoken);
        sessionStorage.setItem('username', userData.username);
        sessionStorage.setItem('userId', userData._id);
        sessionStorage.setItem('subscriptions', JSON.stringify(userData.subscriptions));
    }


    function register(username, password) {
        let subscriptions = ['test'];
        let obj = {username, password, subscriptions};

        return remote.post('user', '', 'basic', obj);
    }

    function login(username, password) {
        let obj = {username, password};

        return remote.post('user', 'login', 'basic', obj)
    }

    function logout() {
        return remote.post('user', '_logout', 'kinvey');
    }

    return {
        isAuth,
        login,
        logout,
        register,
        saveSession
    }
})();
