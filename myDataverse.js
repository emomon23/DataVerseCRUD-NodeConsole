import axios from "axios";
import * as msal from "@azure/msal-node";
import config from "./config.js";

let httpConfig = null;

const dataVerseLog = (msg) => {
  //uncomment || comment out console.log to see || hide logs from myDataver calls
  console.log(msg);
};

const authenticateWithAuzre = async () => {
  if (httpConfig) {
    return;
  }

  const authenticationData = {
    auth: {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      authority: config.authority,
    },
  };

  const cca = new msal.ConfidentialClientApplication(authenticationData);
  const result = await cca.acquireTokenByClientCredential({
    scopes: [config.scope],
  });

  if (result && result.accessToken) {
    dataVerseLog("** Authentication success!");
    httpConfig = {
      headers: {
        Authorization: `Bearer ${result.accessToken}`,
        "Content-Type": "application/json",
      },
    };
  } else {
    throw new Error("Failed to get access token");
  }
};

const extractGuid = (valueString) => {
  const regex =
    /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
  const match = valueString.match(regex);

  if (match) {
    return match[0]; // Return the first matched GUID
  } else {
    return null; // Return null if no GUID is found
  }
};

const mapOperatorString = (rawOperator) => {
  const lcaseOperator =
    rawOperator && rawOperator.toLowerCase ? rawOperator.toLowerCase() : "eq";
  let result = lcaseOperator;

  switch (lcaseOperator) {
    case "=":
    case "==":
    case "===":
      result = "eq";
      break;
    case ">":
      result = "gt";
      break;
    case "<":
      result = "lt";
      break;
    case ">=":
      result = "ge";
      break;
    case "<=":
      result = "le";
      break;
    case "!":
    case "!=":
    case "!==":
    case "<>":
    case "not =":
      result = "ne";
      break;
  }

  return result;
};

const convertQueryFiltersToString = (filtersArray) => {
  if (!(filtersArray && filtersArray.length)) {
    return "";
  }

  let resultString = "";
  for (let i = 0; i < filtersArray.length; i++) {
    const filter = filtersArray[i];
    const operator = mapOperatorString(filter.operator);
    const type = filter.type || "string";
    const filterKeys = Object.keys(filter).filter(
      (key) => key !== "type" && key !== "operator"
    );

    if (filterKeys.length !== 1) {
      throw new Error(
        "where filter missing the property to be filtered on (or has more than one property specified"
      );
    }

    const fieldName = filterKeys[0];
    const rawFieldValue = filter[fieldName];

    //to use single quotes or not to use single quotes, that is the question!
    const fieldValue =
      type !== "number" && type !== "numeric" && rawFieldValue !== "null"
        ? `'${rawFieldValue}'`
        : rawFieldValue;

    //  "name eq 'All States Ag Parts' or name eq 'Tonka Source'";
    resultString += `${fieldName} ${operator} ${fieldValue}`;
    if (i < filtersArray.length - 1) {
      resultString += " or ";
    }
  }

  return resultString;
};

const convertFilterGroupsToString = (filterGroupsArray) => {
  if (!(filterGroupsArray && filterGroupsArray.length)) {
    return "";
  }

  let result = "";
  for (let i = 0; i < filterGroupsArray.length; i++) {
    let filtersToOr = convertQueryFiltersToString(filterGroupsArray[i]);
    if (filtersToOr.length) {
      result = result.length ? result + " and " : result;
      result += `(${filtersToOr})`;
    }
  }

  if (result.length) {
    result = `$filter=${result}`;
  }

  return result;
};

const create = async (tableName, data) => {
  await authenticateWithAuzre();

  let result = null;
  const url = `${config.apiUrl}${tableName.toLowerCase()}`;
  const response = await axios.post(url, data, httpConfig);

  //I should be able to go right to response.data, but for some reason that value is undefined
  //and my status code is 204 (NO CONTENT), the record does get created however
  //I'm able to extract the new record primary key (guid) from the location value and
  // return that as the id for the new record
  if (response.headers.location) {
    result = extractGuid(response.headers.location);
  }

  return result;
};

const get = async (odataQueryString) => {
  await authenticateWithAuzre();
  const url = `${config.apiUrl}${odataQueryString}`;

  try {
    dataVerseLog({ axiosGet: url });

    return await axios.get(url, httpConfig);
  } catch (error) {
    console.error(
      "Error querying Dataverse:",
      error.response?.data || error.message
    );
  }
};

//** SAMPLE CODE **
//const query = myDataVerse.select('accountid,name').from('accounts').whereIdEquals(accountId)
//const record = await query.execute();
//
//const query = myDataVerse.select ('accountid,name')
//                         .where([{name: 'Tonka Source', operator: ">="}]) //default is 'eq'
//                           .and()
//                         .orderBy('name desc')
//                         .top(1)
//const records = await query.execute();
const select = (selectFieldList) => {
  let fieldList = null;
  if (selectFieldList !== "*") {
    fieldList = Array.isArray(selectFieldList)
      ? selectFieldList.map((s) => s.trim()).join(",")
      : selectFieldList.split(" ").join("");
  }

  return {
    tableName: "",
    fieldList,
    id: null,
    orderBys: [],
    filtersToAND: [],
    //use of 'this' keyword requires no arrow function (use function keyword)
    from: function (tblName) {
      this.tableName = tblName.toLowerCase();
      return this;
    },
    whereIdEquals: function (id) {
      this.id = id;
      return this;
    },
    where: function (filters) {
      // .where([{name:value, operator:"==="}])
      const filtersToOR = Array.isArray(filters) ? filters : [filters];
      this.filtersToAND.push(filtersToOR);
      return this;
    },
    and: function (filters) {
      const filtersToOR = Array.isArray(filters) ? filters : [filters];
      this.filtersToAND.push(filtersToOR);
      return this;
    },
    top: function (numberOfRecordsToReturn) {
      this.top = numberOfRecordsToReturn;
      return this;
    },
    orderBy: function (orderBy) {
      this.orderBys.push(orderBy); //.orderBy('name asc').orderBy('createddate desc').execute()
      return this;
    },
    execute: async function () {
      let requiresAmp = false;
      let queryString = `${this.tableName}`;
      if (this.id) {
        queryString += `(${this.id})`;
      }

      if (this.fieldList && this.fieldList.length) {
        queryString += `?$select=${this.fieldList}`;
        requiresAmp = true;
      }

      if (!this.id) {
        const filterString = convertFilterGroupsToString(this.filtersToAND);
        if (filterString && filterString.length) {
          queryString += requiresAmp ? "&" : "";
          queryString += filterString;
          requiresAmp = true;
        }

        if (this.top && !isNaN(this.top)) {
          queryString += requiresAmp ? "&" : "";
          queryString += `$top=${this.top}`;
          requiresAmp = true;
        }

        if (this.orderBys && this.orderBys.length) {
          queryString += requiresAmp ? "&" : "";
          //$orderby=revenue asc,name desc
          queryString += `$orderby=${this.orderBys.join(",")}`;
          requiresAmp = true;
        }
      }

      const response = await get(queryString);
      if (response.data) {
        //If there's only 1 record returned, return data, else return data.value
        return Array.isArray(response.data.value)
          ? response.data.value
          : response.data;
      } else {
        return response;
      }
    },
  };
};

const update = async (tableName, data, recordId) => {
  await authenticateWithAuzre();

  //eg. https:<org>.api.crm.dynamics.com/data/api/v9.2/accounts(0000-0000-0000-0001)
  const patchUrl = `${config.apiUrl}${tableName.toLowerCase()}(${recordId})`;
  const response = await axios.patch(patchUrl, data, httpConfig);
  return response.status;
};

const deleteRow = async (tableName, recordId) => {
  await authenticateWithAuzre();

  const deleteUrl = `${config.apiUrl}${tableName.toLowerCase()}(${recordId})`;

  dataVerseLog(`calling axios.delete(${deleteUrl})`);
  const response = await axios.delete(deleteUrl, httpConfig);

  dataVerseLog(`Delete Status: ${response.status}`);
  return response.status;
};

//These are the methods that "myDataVerse" exposes
export default {
  create,
  select,
  update,
  get,
  delete: deleteRow, // delete keyword can't be used as a const arrow function name :'(
};
