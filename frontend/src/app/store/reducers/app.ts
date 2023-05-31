import { createSlice } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";
import Profile from "../../types/app/profile";
import { RootState, AppThunk } from "../store";
import { SsoToken } from "../../types/app/sso-token";
import { AppState } from "../../types/app/app-state";

const initialState: AppState = {
  alerts: 2,
  profile: { givenName: "", surName: "", email: "", idir: "" },
  isSidebarOpen: true
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setTokenProfile: (state, action) => {
      const { payload } = action;
      const profile: Profile = {
        givenName: payload.givenName,
        surName: payload.surName,
        email: payload.email,
        idir: payload.idir,
      };
      return { ...state, profile };
    },
    toggleSidebar: (state) => {
      const { isSidebarOpen: isOpen } = state;

      return { ...state, isSidebarOpen: !isOpen}
    }
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setTokenProfile,toggleSidebar } = appSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const getTokenProfile = (): AppThunk => (dispatch) => {
  const token = localStorage.getItem("user");
  if (token) {
    const decoded: SsoToken = jwtDecode<SsoToken>(token);
    const { given_name, family_name, email, idir_user_guid } = decoded;

    dispatch(
      setTokenProfile({
        givenName: given_name,
        surName: family_name,
        email: email,
        idir: idir_user_guid,
      })
    );
  }
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const profileInitials = (state: RootState) => {
  const { profile } = state.app;
  return `${profile.givenName?.substring(0, 1)}${profile.surName?.substring(
    0,
    1
  )}`;
};

export const alertCount = (state: RootState) => state.app.alerts;

export const isSidebarOpen = (state: RootState) => state.app.isSidebarOpen;

export default appSlice.reducer;
