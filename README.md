Sample code to execute CRUD operations in a server 2 server manner. In this case, using a node console application.
No user interface will be provided to a user to login when this app runs.

To execute these CRUD samples against your own Dataverse, hosted in Azure, install Node and NPM

1: Clone this repo

2: Open in VS Code, from terminal

   npm install axios
   
   npm install @azure/msal-node

3: Create a new .env file

4: Add the following to your .env file

BASE_URL=
CLIENT_ID=
TENNENT_ID=
CLIENT_SECRET=

Set these values in the .env file as you register your app in portal.azure.com by following the steps in this youtube video
STARTING AT MINUTE: 2:10

https://youtu.be/DuJ0DxB73zI

node app.js to execute this console application
