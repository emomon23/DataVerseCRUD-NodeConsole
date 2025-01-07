import dotenv from "dotenv";
dotenv.config();

export default {
  baseUrl: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  tennentId: process.env.TENNENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  authority: "https://login.microsoftonline.com/" + process.env.TENNENT_ID,
  scope: process.env.BASE_URL + "/.default",
  apiUrl: process.env.BASE_URL + "/api/data/v9.2/",
};
