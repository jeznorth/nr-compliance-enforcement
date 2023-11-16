import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

import officers from "./reducers/officer";
import app from "./reducers/app";
import complaints from "./reducers/complaints";
import offices from "./reducers/office";
import codeTables from "./reducers/code-table";
import complaintLocations from "./reducers/complaint-locations";

const appPersistConfig = {
	key: "app",
	storage: storage,
	whitelist: ["profile", "alerts", "notifications", "configurations"],
};

export const rootReducer = combineReducers({
  app: persistReducer(appPersistConfig, app),
  officers,
  offices,
  complaints,
  codeTables,
  complaintLocations,
});
