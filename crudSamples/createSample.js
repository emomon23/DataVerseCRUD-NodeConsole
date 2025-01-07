import myDataverse from "../myDataverse.js";

const execute = async () => {
  console.log(
    "************************** CREATE METHODS ***************************\n"
  );
  //******************************************************************************/
  //INSERT INTO accounts the following object, and return the new accountId value
  const account = {
    name: `Tonka Source`,
    accountnumber: new Date().getTime().toString(),
    address1_city: "Minneapolis",
    address1_stateorprovince: "MN",
    creditlimit: 25000,
  };

  const newAccountId = await myDataverse.create("accounts", account);

  //*************************************************************************************/
  //INSERT INTO contacts this data, associating it with the account record just created
  const contactData = {
    firstname: "Mike",
    lastname: `Emo`,
    emailaddress1: `mike.emo@tonkasource.com`,
    "parentcustomerid_account@odata.bind": `/accounts(${newAccountId})`,
  };

  const newContactId = await myDataverse.create("contacts", contactData);
  console.log(
    "**myDataVerse.create called, once for account and one for contact"
  );
  console.log({ newAccountId, newContactId });

  //Return the ids of the new records
  return { newAccountId, newContactId };
};

export default {
  execute,
};
