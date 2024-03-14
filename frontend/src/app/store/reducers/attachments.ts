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
import { getThumbnailFile, injectComplaintIdentifierToFilename, injectComplaintIdentifierToThumbFilename, isImage } from "../../common/methods";
import { ToggleError, ToggleSuccess } from "../../common/toast";
import axios from "axios";
import AttachmentEnum from "../../constants/attachment-enum";

const initialState: AttachmentsState = {
  complaintsAttachments: [],
  outcomeAttachments: []
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
      return { ...state, complaintsAttachments: attachments ?? [] };
    },

    // used when removing an attachment from a complaint
    removeAttachment: (state, action) => {
      return {
        ...state,
        complaintsAttachments: state.complaintsAttachments.filter(attachment => attachment.id !== action.payload),
      };
    },

    // used when adding an attachment to a complaint
    addAttachment: (state, action) => {
      const { name, type, size, id } = action.payload; // Extract relevant info
      const serializedFile = { name, type, size, id }; 

      return {
        ...state,
        complaintsAttachments: [...state.complaintsAttachments, serializedFile],
      };
    },

    // used when retrieving attachments from objectstore
    setOutcomeAttachments: (state, action) => {
      const {
        payload: { attachments },
      } = action;
      return { ...state, outcomeAttachments: attachments ?? [] };
    },

    // used when removing an attachment from a complaint
    removeOutcomeAttachment: (state, action) => {
      return {
        ...state,
        outcomeAttachments: state.outcomeAttachments.filter(attachment => attachment.id !== action.payload),
      };
    },

    // used when adding an attachment to a complaint
    addOutcomeAttachment: (state, action) => {
      const { name, type, size, id } = action.payload; // Extract relevant info
      const serializedFile = { name, type, size, id }; 

      return {
        ...state,
        outcomeAttachments: [...state.outcomeAttachments, serializedFile],
      };
    },

    clearAttachments: (state) => {
      return {
        ...state,
        complaintsAttachments: [],
        outcomeAttachments: [],
      };
    },
    
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setAttachments, removeAttachment , addAttachment, setOutcomeAttachments, removeOutcomeAttachment , addOutcomeAttachment, clearAttachments } = attachmentsSlice.actions;

// Get list of the attachments and update store
export const getAttachments =
  (complaint_identifier: string, attachmentType: AttachmentEnum): AppThunk =>
  async (dispatch) => {
    try {
      const parameters = generateApiParameters(
        `${config.COMS_URL}/object?bucketId=${config.COMS_BUCKET}`
      );
      let response = await get<Array<COMSObject>>(dispatch, parameters, {
        "x-amz-meta-complaint-id": complaint_identifier,
        "x-amz-meta-is-thumb": "N",
        "x-amz-meta-attachment-type": attachmentType,
      });

      if (response && from(response).any()) {
        for (const attachment of response) {
          if (isImage(attachment.name)) {
            const thumbArrayResponse = await get<Array<COMSObject>>(
              dispatch, parameters, {
                "x-amz-meta-complaint-id": complaint_identifier,
                "x-amz-meta-is-thumb": "Y",
                "x-amz-meta-thumb-for": attachment?.id,
              }
            );
      
            const thumbId = thumbArrayResponse[0]?.id;
      
            if (thumbId) {
              const thumbParameters = generateApiParameters(
                `${config.COMS_URL}/object/${thumbId}?download=url`
              );
      
              const thumbResponse = await get<string>(dispatch, thumbParameters);
              attachment.imageIconString = thumbResponse;
              attachment.imageIconId = thumbId;
            }
          }
        }
      
        const attachmentList: Array<COMSObject> = response ?? [];
      
        switch (attachmentType) {
          case AttachmentEnum.COMPLAINT_ATTACHMENT:
            dispatch(setAttachments({ attachments: attachmentList }));
            break;
          case AttachmentEnum.OUTCOME_ATTACHMENT:
            dispatch(setOutcomeAttachments({ attachments: attachmentList }));
            break;
        }
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
          if(isImage(attachment.name))
          {
            const thumbParameters = generateApiParameters(
              `${config.COMS_URL}/object/${attachment.imageIconId}`
            );

            await deleteMethod<string>(dispatch, thumbParameters);
          }
          ToggleSuccess(`Attachment ${decodeURIComponent(attachment.name)} has been removed`);
        } catch (error) {
          ToggleError(`Attachment ${decodeURIComponent(attachment.name)} could not be deleted`);
        }
      }
    }

  };



// save new attachment(s) to object store
export const saveAttachments =
  (attachments: File[], complaint_identifier: string, attachmentType: AttachmentEnum): AppThunk =>
  async (dispatch) => {

    if (!attachments) {
      return;
    }

    for (const attachment of attachments) {
      const header = {
        "x-amz-meta-complaint-id": complaint_identifier,
        "x-amz-meta-is-thumb": "N",
        "x-amz-meta-attachment-type": attachmentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(injectComplaintIdentifierToFilename(
          attachment.name,
          complaint_identifier,
          attachmentType
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
        switch (attachmentType) {
          case AttachmentEnum.COMPLAINT_ATTACHMENT:
            dispatch(addAttachment(response)); // dispatch with serializable payload
            break;
          case AttachmentEnum.OUTCOME_ATTACHMENT:
            dispatch(addOutcomeAttachment(response)); // dispatch with serializable payload
        }

        if(isImage(attachment.name))
        {
          const thumbHeader = {
            "x-amz-meta-complaint-id": complaint_identifier,
            "x-amz-meta-is-thumb": "Y",
            "x-amz-meta-thumb-for": response.id,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(injectComplaintIdentifierToThumbFilename(
              attachment.name,
              complaint_identifier,
              attachmentType
            ))}"`,
            "Content-Type": "image/jpeg",
          };  

          const thumbnailFile = await getThumbnailFile(attachment).catch(error => {
            //we are just going to ignore this and move on
            console.error('Error occurred while getting thumbnail file:', error);
          });

          if (thumbnailFile) {
            await putFile<COMSObject>(
              dispatch,
              parameters,
              thumbHeader,
              thumbnailFile
            );
          }
        }

        if (response) {
          ToggleSuccess(`Attachment "${attachment.name}" saved`);
        }

      } catch (error) {
        handleError(attachment, error);
      }
    }
  };

  const handleError = (attachment: File, error: any) => {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      ToggleError(`Attachment "${attachment.name}" could not be saved.  Duplicate file.`);
    } else {
      ToggleError(`Attachment "${attachment.name}" could not be saved.`);
    }
  };

//-- selectors
export const selectAttachments = (attachmentType: AttachmentEnum) => (state: RootState): COMSObject[]  => {
  const { attachments: attachmentsRoot } = state;
  const { complaintsAttachments, outcomeAttachments } = attachmentsRoot;
  
  switch (attachmentType) {
    case AttachmentEnum.COMPLAINT_ATTACHMENT:
      return complaintsAttachments ?? [];    
    case AttachmentEnum.OUTCOME_ATTACHMENT:
      return outcomeAttachments ?? [];
    
  }

};

export const selectOutcomeAttachments = () => (state: RootState): COMSObject[]  => {
  const { attachments: attachmentsRoot } = state;
  const { outcomeAttachments } = attachmentsRoot;

  return outcomeAttachments ?? [];
};

export default attachmentsSlice.reducer;
