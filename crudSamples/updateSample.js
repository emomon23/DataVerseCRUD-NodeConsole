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

  const updateStatus = await myDataverse.update(
    "accounts",
    accountPatch,
    primaryKeys.newAccountId
  );

  console.log("** myDataVerse.updateCalled (look for 200 or 204 - NO CONTENT");
  console.log({ updateStatus });
};

export default {
  execute,
};
