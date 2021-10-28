# PersonalNotesApp

Server.js is the main starting point for the application.

For this project
Admin credentials will be created automatically when server runs.
So if you already have those credentials. Please remove 
  require('./adminCredentials.js')
from server.js

To perform admin operations. You will have to specify 'x-auth' token in the header.

For users, they can register to database only if admin registers him/her. Then save your password for future use.
Later on, if you wish to do something Login using your credentials first and save your 'x-login-auth' token from the header & then you will have to add this as header with every request you make. Just so server can verify it's you.

