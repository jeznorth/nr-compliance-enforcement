import { createSlice } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../store";
import {
  deleteMethod,
  generateApiParameters,
  get,
  putFile,
} from "../../common/api";
import { from } from "linq-to-typescript";
import { COMSObject } from "../../types/coms/object";
import { AttachmentsState } from "../../types/state/attachments-state";
import config from "../../../config";
import { injectComplaintIdentifierToFilename } from "../../common/methods";
import { ToggleError, ToggleSuccess } from "../../common/toast";
import axios from "axios";

const initialState: AttachmentsState = {
  attachments: [],
};

/**
 * Attachments for each complaint
 */
export const attachmentsSlice = createSlice({
  name: "attachments",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {

    // used when retrieving attachments from objectstore
    setAttachments: (state, action) => {
      const {
        payload: { attachments },
      } = action;
      return { ...state, attachments: attachments ?? [] };
    },

    // used when removing an attachment from a complaint
    removeAttachment: (state, action) => {
      return {
        ...state,
        attachments: state.attachments.filter(attachment => attachment.id !== action.payload),
      };
    },

    // used when adding an attachment to a complaint
    addAttachment: (state, action) => {
      const { name, type, size, id } = action.payload; // Extract relevant info
      const serializedFile = { name, type, size, id }; 

      return {
        ...state,
        attachments: [...state.attachments, serializedFile],
      };
    },
    
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setAttachments, removeAttachment , addAttachment} = attachmentsSlice.actions;

// Get list of the attachments and update store
export const getAttachments =
  (complaint_identifier: string): AppThunk =>
  async (dispatch) => {
    try {
      const parameters = generateApiParameters(
        `${config.COMS_URL}/object?bucketId=${config.COMS_BUCKET}`
      );
      const response = await get<Array<COMSObject>>(dispatch, parameters, {
        "x-amz-meta-complaint-id": complaint_identifier,
      });
      if (response && from(response).any()) {
        
        dispatch(
          setAttachments({
            attachments: response ?? [],
          })
        );
      }
    } catch (error) {
      ToggleError(`Error retrieving attachments`);
    }
  };

// delete attachments from objectstore
export const deleteAttachments =
  (attachments: COMSObject[]): AppThunk =>
  async (dispatch) => {
    if (attachments) {
      for (const attachment of attachments) {
        try {
          const parameters = generateApiParameters(
            `${config.COMS_URL}/object/${attachment.id}`
          );

          await deleteMethod<string>(dispatch, parameters);
          dispatch(removeAttachment(attachment.id)); // delete from store
          ToggleSuccess(`Attachment ${decodeURIComponent(attachment.name)} has been removed`);
        } catch (error) {
          ToggleError(`Attachment ${decodeURIComponent(attachment.name)} could not be deleted`);
        }
      }
    }

  };

// save new attachment(s) to object store
export const saveAttachments =
  (attachments: File[], complaint_identifier: string): AppThunk =>
  async (dispatch) => {
    if (attachments) {
      for (const attachment of attachments) {
        const header = {
          "x-amz-meta-complaint-id": complaint_identifier,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(injectComplaintIdentifierToFilename(
            attachment.name,
            complaint_identifier
          ))}"`,
          "Content-Type": attachment?.type,
        };

        try {
          const parameters = generateApiParameters(
            `${config.COMS_URL}/object?bucketId=${config.COMS_BUCKET}`
          );

          const response = await putFile<COMSObject>(
            dispatch,
            parameters,
            header,
            attachment
          );

          dispatch(addAttachment(response)); // dispatch with serializable payload

          if (response) {
            ToggleSuccess(`Attachment "${attachment.name}" saved`);
          }

        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 409) {
            ToggleError(`Attachment "${attachment.name}" could not be saved.  Duplicate file.`);
          } else {
            ToggleError(`Attachment "${attachment.name}" could not be saved.`);
          }
        }
      }
    }
  };

//-- selectors
export const selectAttachments = (state: RootState): COMSObject[]  => {
  const { attachments: attachmentsRoot } = state;
  const { attachments } = attachmentsRoot;

  return attachments ?? [];
};

export default attachmentsSlice.reducer;
