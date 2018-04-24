$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        //home page
        this.get('index.html', displayHome);
        this.get('#/home', displayHome);

        //about page
        this.get('#/about', function (ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/about/about.hbs')
            })
        })

        //login page
        this.get('#/login', function (ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs')
            })
        })
        this.post('#/login', function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            auth.login(username, password)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('LOGGED IN SUCCESSFULLY');
                    displayHome(ctx);
                }).catch(auth.handleError)
        })

        //logout

        this.get('#/logout', function (ctx) {
            auth.logout().then(function () {
                sessionStorage.clear();
                auth.showInfo('Logged out!');
                displayHome(ctx);
            }).catch(auth.handleError);
        })

        //register page

        this.get('#/register', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });
        this.post('#/register', function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPassword = ctx.params.repeatPassword;
            if (password !== repeatPassword) {
                auth.showError('Password mismatch!');
            } else {
                auth.register(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        auth.showInfo('REGISTERED');
                        displayHome(ctx)
                    })
                    .catch(auth.handleError);
            }
        });

        //catalog page

        this.get('#/catalog', displayCatalog);

        // create team page

        this.get('#/create', function () {
            this.loggedIn = sessionStorage.getItem('authtoken') !== null;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs'
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            });
        });
        this.post('#/create', function (ctx) {
            let teamName = ctx.params.name;
            let comment = ctx.params.comment;
            teamsService.createTeam(teamName, comment)
                .then(function (teamInfo) {
                    teamsService.joinTeam(teamInfo._id)
                        .then(function (userInfo) {
                            auth.saveSession(userInfo);
                            auth.showInfo(`team ${teamName} created!`);
                            displayCatalog(ctx);
                        }).catch(auth.handleError);
                }).catch(auth.handleError);
        });

        // teams display page

        this.get('#/catalog/:id', function (ctx) {
            let teamId = ctx.params.id.substr(1);

            teamsService.loadTeamDetails(teamId)
                .then(function (teamInfo) {
                    ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.teamId = teamInfo._id;
                    ctx.name=teamInfo.name;
                    ctx.comment=teamInfo.comment;
                    ctx.isOnTeam=teamInfo._id===sessionStorage.getItem('teamId');
                    ctx.isAuthor = teamInfo._acl.creator === sessionStorage.getItem('userId');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        teamControls: './templates/catalog/teamControls.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/details.hbs');
                    })
                }).catch(auth.handleError);

        });

        //join team by id

        this.get('#/join/:id', function (ctx) {
            let teamId = this.params.id.substr(1);

            teamsService.joinTeam(teamId)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('team joined successfully!');
                    displayCatalog(ctx);
                }).catch(auth.handleError);
        });

        // leave team

        this.get('#/leave', function (ctx) {
            teamsService.leaveTeam().
                then(function (userInfo) {
                auth.saveSession(userInfo);
                auth.showInfo('team left');
                displayCatalog(ctx);
            }).catch(auth.handleError);
        });

//edit team
        this.get('#/edit/:id', function (ctx) {
            let teamId = this.params.id.substr(1);
            teamsService.loadTeamDetails(teamId).then(function (teamInfo) {
                ctx.teamId=teamId;
                ctx.name=teamInfo.name;
                ctx.comment=teamInfo.comment;
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    editForm: './templates/edit/editForm.hbs'
                }).then(function () {
                    this.partial('./templates/edit/editPage.hbs');
                })
            }).catch(auth.handleError)
        });
        this.post('#/edit/:id', function (ctx) {
            let teamId = ctx.params.id.substr(1);
            let name = ctx.params.name;
            let comment = ctx.params.comment;
            teamsService.edit(teamId,name,comment)
                .then(function () {
                    auth.showInfo(`team ${name} edited`);
                    displayCatalog(ctx);
                }).catch(auth.handleError);
        });
        //delete team by id (only if you're creator)
        this.get('#/delete/:id',function (ctx) {
            let teamId = ctx.params.id.substr(1);
           // console.log(teamId);
            teamsService.deleteTeam(teamId)
                .then(function () {
                    auth.showInfo(`team deleted`);
                    displayCatalog(ctx);
                }).catch(auth.handleError);
        })
        function displayHome(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.hasTeam = sessionStorage.getItem('teamId') !== "undefined"
                || sessionStorage.getItem('teamId') !== null;
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/home/home.hbs')
            })
        }
        function displayCatalog(ctx) {
            teamsService.loadTeams()
                .then(function (data) {
                    ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.hasTeam = sessionStorage.getItem('teamId') !== null;
                    ctx.hasNoTeam = sessionStorage.getItem('teamId') === null
                        || sessionStorage.getItem('teamId') === "undefined";
                    ctx.teams = data;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        team: './templates/catalog/team.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/teamCatalog.hbs');
                    });
                });
        }
    });

    app.run();
});