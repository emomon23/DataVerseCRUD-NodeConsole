import myDataverse from "../myDataverse.js";

export default {
  execute: async (primaryKeys) => {
    console.log(
      "***************************************************************\n\n"
    );
    console.log(
      "************************** DELETE METHODS ***************************\n"
    );

    await myDataverse.delete("contacts", primaryKeys.newContactId);
    await myDataverse.delete("accounts", primaryKeys.newAccountId);
  },
};
