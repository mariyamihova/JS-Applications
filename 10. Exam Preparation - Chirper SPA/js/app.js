$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');
        //homepage
        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);

        //register
        this.get('#/register', (ctx) => {

            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/forms/registerForm.hbs');
            })
        });
        this.post('#/register', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPass = ctx.params.repeatPass;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Username should be at least 3 characters long and contain only english alphabet letters');
            } else if (!/^[A-Za-z\d]{6,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and contain only english alphabet letters');
            } else if (repeatPass !== password) {
                notify.showError('Passwords must match!');
            } else {
                auth.register(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful!');
                        ctx.redirect('#/chirps');
                    })
                    .catch(notify.handleError);
            }
        });

        //login
        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;

            if (username === '' || password === '') {
                notify.showError('All fields should be non-empty!');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/chirps');
                    })
                    .catch(notify.handleError);
            }
        });

        // logout
        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        });

        //main feed
        this.get('#/chirps', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let subsArr = JSON.parse(sessionStorage.getItem('subscriptions')).map(e => `"${e}"`);
            let username = sessionStorage.getItem('username');
            Promise.all([chirps.loadAllChirpsByUsername(username), users.loadUserFollowers(username)])
                .then(([chirpsArr, followersArr]) => {
                    let chirpsCount = chirpsArr.length;
                    let following = JSON.parse(sessionStorage.getItem('subscriptions')).length;
                    let followers = followersArr.length;

                    chirps.loadFollowersChirps(subsArr)
                        .then((followersChirps) => {
                            followersChirps.forEach(c => {
                                c.time = calcTime(c._kmd.ect);
                            });

                            ctx.username = username;
                            ctx.chirpsCount = chirpsCount;
                            ctx.following = following;
                            ctx.followers = followers;
                            ctx.chirps = followersChirps;

                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                navigation: './templates/common/navigation.hbs',
                                chirp: './templates/chirps/chirp.hbs'
                            }).then(function () {
                                this.partial('./templates/chirps/chirpsPage.hbs');
                            })
                        }).catch(notify.handleError)
                }).catch(notify.handleError)

        })
        // create chirp
        this.post('#/create/chirp', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            let author = sessionStorage.getItem('username');
            let text = ctx.params.text;
            if (text.length > 150) {
                notify.showError('Chirp text cannot be longer than 150 characters!');
                return;
            }

            if (text === '') {
                notify.showError('Text is required!');
            }
            else {
                chirps.createChirp(author, text)
                    .then(() => {
                        notify.showInfo('Chirp created.');
                        ctx.redirect('#/chirps');
                    })
                    .catch(notify.handleError);
            }
        });
        //my profile
        this.get('#/mychirps', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let username = ctx.params.username;

            if (username) { // Other User Feed
                username = username.substr(1);
            } else { // My User Feed
                username = sessionStorage.getItem('username');
            }

            Promise.all([chirps.loadAllChirpsByUsername(username), users.loadUserFollowers(username), users.loadUserByUsername(username)])
                .then(([chirpsArr, followersArr, user]) => {
                    let chirpsCount = chirpsArr.length;
                    let following = user[0].subscriptions.length;
                    let followers = followersArr.length;

                    chirpsArr.forEach(c => {
                        c.time = calcTime(c._kmd.ect);
                        c.isAuthor = c.author === sessionStorage.getItem('username');
                    });

                    // I need an AutoMapper for this :/
                    ctx.username = username;
                    ctx.chirpsCount = chirpsCount;
                    ctx.following = following;
                    ctx.followers = followers;
                    ctx.chirps = chirpsArr;
                    ctx.isCurrentlyLogged = ctx.params.username === undefined;
                    ctx.isFollowed = JSON.parse(sessionStorage.getItem('subscriptions')).includes(username);

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        chirpsDelete: './templates/chirps/chirpsDelete.hbs'
                    }).then(function () {
                        this.partial('./templates/chirps/mychirpsPage.hbs');
                    })
                }).catch(notify.handleError)
        });
        //users chirps
        this.get('#chirps/:username', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let username = ctx.params.username;

            if (username) { // Other User Feed
                username = username.substr(1);
            } else { // My User Feed
                username = sessionStorage.getItem('username');
            }

            Promise.all([chirps.loadAllChirpsByUsername(username), users.loadUserFollowers(username), users.loadUserByUsername(username)])
                .then(([chirpsArr, followersArr, user]) => {
                    let chirpsCount = chirpsArr.length;
                    let following = user[0].subscriptions.length;
                    let followers = followersArr.length;

                    chirpsArr.forEach(c => {
                        c.time = calcTime(c._kmd.ect);
                        c.isAuthor = c.author === sessionStorage.getItem('username');
                    });

                    // I need an AutoMapper for this :/
                    ctx.username = username;
                    ctx.chirpsCount = chirpsCount;
                    ctx.following = following;
                    ctx.followers = followers;
                    ctx.chirps = chirpsArr;
                    ctx.isCurrentlyLogged = ctx.params.username === undefined;
                    ctx.isFollowed = JSON.parse(sessionStorage.getItem('subscriptions')).includes(username);

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        chirp: './templates/chirps/chirp.hbs'
                    }).then(function () {
                        this.partial('./templates/chirps/userChirpsPage.hbs');
                    })
                }).catch(notify.handleError)

        });
        // discover page
        this.get('#/discover', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            users.getAllUsers().then((users) => {
                ctx.isAuth = auth.isAuth();
                users.forEach(user => {
                    user.followers = users.filter(u => u.subscriptions.includes(user.username)).length;
                });
                users = users.filter(u => u.username !== sessionStorage.getItem('username'));
                ctx.users = users.sort((a, b) => b.followers - a.followers); // sort by descending followers
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    navigation: './templates/common/navigation.hbs',
                    user: './templates/users/user.hbs'
                }).then(function () {
                    this.partial('./templates/chirps/discoverPage.hbs');
                })
            }).catch(notify.handleError)
        });
        function getWelcomePage(ctx) {
            if (!auth.isAuth()) {
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    loginForm: './templates/forms/loginForm.hbs',
                    registerForm: './templates/forms/registerForm.hbs',
                }).then(function () {
                    this.partial('./templates/welcome-anonymous.hbs');
                })
            } else {
                ctx.redirect('#/chirps');
            }

        }
        //unfollow/follow
        this.get('#/unfollow/:username',(ctx)=>{
            let username = ctx.params.username.substr(1);
            let userId = sessionStorage.getItem('userId');
            let newSubArr = JSON.parse(sessionStorage.getItem('subscriptions')).splice(0);
            let indexOfEl = newSubArr.indexOf(username);
            newSubArr.splice(indexOfEl, 1);
            users.modifyUser(userId,newSubArr)
                .then(()=>{
                    notify.showInfo(`Unsubscribed to ${username}`);
                    sessionStorage.setItem('subscriptions', JSON.stringify(newSubArr));
                    ctx.redirect(`#chirps/:${username}`);
                }).catch(notify.handleError);

        });
        this.get('#/follow/:username',(ctx)=>{
            let username = ctx.params.username.substr(1);
            let userId = sessionStorage.getItem('userId');
            let newSubArr = JSON.parse(sessionStorage.getItem('subscriptions')).splice(0);
            newSubArr.push(username);
            users.modifyUser(userId,newSubArr)
                .then(()=>{
                    notify.showInfo(`Subscribed to ${username}`);
                    sessionStorage.setItem('subscriptions', JSON.stringify(newSubArr));
                    ctx.redirect(`#chirps/:${username}`);
                }).catch(notify.handleError);

        });
        //delete chirp
        this.get('#/delete/chirp/:chirpId', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let chirpId = ctx.params.chirpId;

            chirps.deleteChirp(chirpId)
                .then(() => {
                    notify.showInfo('Chirp deleted.');
                    ctx.redirect('#/chirps');
                })
                .catch(notify.handleError);
        });
        function calcTime(dateIsoFormat) {
            let diff = new Date - (new Date(dateIsoFormat));
            diff = Math.floor(diff / 60000);
            if (diff < 1) return 'less than a minute';
            if (diff < 60) return diff + ' minute' + pluralize(diff);
            diff = Math.floor(diff / 60);
            if (diff < 24) return diff + ' hour' + pluralize(diff);
            diff = Math.floor(diff / 24);
            if (diff < 30) return diff + ' day' + pluralize(diff);
            diff = Math.floor(diff / 30);
            if (diff < 12) return diff + ' month' + pluralize(diff);
            diff = Math.floor(diff / 12);
            return diff + ' year' + pluralize(diff);
            function pluralize(value) {
                if (value !== 1) return 's';
                else return '';
            }
        }

    });

    app.run();
});
