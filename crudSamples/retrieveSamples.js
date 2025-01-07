import myDataverse from "../myDataverse.js";

export default {
  execute: async (primaryKeys) => {
    console.log(
      "***********************************************************************\n\n"
    );
    console.log(
      "************************** RETRIEVE METHODS ***************************\n"
    );
    //**********************************************************************
    //*************** SELECT ON PRIMARY KEY
    let query = myDataverse
      .select(
        "name,accountid,accountnumber,address1_city,address1_stateorprovince,creditlimit"
      )
      .from("accounts")
      .whereIdEquals(primaryKeys.newAccountId);

    let accountData = await query.execute();

    console.log(`** Select where id = ${primaryKeys.newAccountId} called`);
    console.log({ accountData });

    //**********************************************************************
    //************** SELECT * FROM ACCOUNT  *****************
    query = myDataverse.select("*").from("contacts");

    let contactData = await query.execute();
    console.log(`** Select * from contacts called`);
    console.log({ resultsCount: contactData.length });

    //**********************************************************************
    //************* SELECT ... FROM accounts
    //              WHERE
    //              (city === "Minneapolis" OR "creditlimit" > 20000)
    //              AND (state === "MN" OR state === "IA")
    query = myDataverse
      .select("name,accountid,address1_city,address1_stateorprovince")
      .top(10)
      .from("accounts")
      .where([
        { address1_city: "Minneapolis" },
        { creditlimit: 20000, operator: ">", type: "numeric" },
      ])
      .and(
        { address1_stateorprovince: "MN" },
        { address1_stateorprovince: "IA" }
      )
      .orderBy("name asc");

    console.log(
      `** Select from accounts where (or/and). results: ${accountData.length}`
    );
    console.log({ accountData });
  },
};
