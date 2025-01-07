import myDataverse from "../myDataverse.js";

const execute = async (primaryKeys) => {
  console.log(
    "***********************************************************************\n\n"
  );
  console.log(
    "************************** UPDATE METHOD ***************************\n"
  );

  //*********************************************
  // UPDATE accounts SET name = "TonkaSaurus GRRRR RahH"
  // WHERE accountId = primaryKeys.newAccountId
  const accountPatch = {
    name: "TonkaSaurus GRRRR RahH",
  };

  const pleaseReturnTheseFieldsUponUpdate = "accountid,name";

  const updatedData = await myDataverse.update(
    "accounts",
    accountPatch,
    primaryKeys.newAccountId,
    pleaseReturnTheseFieldsUponUpdate
  );

  console.log("** myDataVerse.updateCalled");
  console.log({ updatedData });
};

export default {
  execute,
};
