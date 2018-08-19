const fs = require("fs");
const login = require("facebook-chat-api");

var credentials = {email: "email here", password: "password here"};

login(credentials, (err, api) => {
    if(err) return console.error(err);

    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
});
