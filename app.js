import createSample from "./crudSamples/createSample.js";
import retrieveSamples from "./crudSamples/retrieveSamples.js";
import updateSample from "./crudSamples/updateSample.js";
import deleteSample from "./crudSamples/deleteSample.js";

//****************************************************************
//*** Execute CRUD operations on the dataverse (C:create, R:retrieve, U:update, D:delete) */
const ids = await createSample.execute();
await retrieveSamples.execute(ids);
await updateSample.execute(ids);
await deleteSample.execute(ids);
