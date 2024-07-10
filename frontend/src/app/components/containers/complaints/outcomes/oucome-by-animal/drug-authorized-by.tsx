import { forwardRef, useImperativeHandle, useState } from "react";
import { DrugAuthorizationV2 } from "../../../../../types/app/complaints/outcomes/wildlife/drug-authorization";
import { CompSelect } from "../../../../common/comp-select";
import { useAppSelector } from "../../../../../hooks/hooks";
import { selectOfficersByAgencyDropdown } from "../../../../../store/reducers/officer";
import { ValidationDatePicker } from "../../../../../common/validation-date-picker";
import Option from "../../../../../types/app/option";
import { REQUIRED } from "../../../../../constants/general";

type props = {
  agency: string;
  drugAuthorization: DrugAuthorizationV2;
  update: Function;
};

type refProps = {
  isValid: Function;
};

export const DrugAuthorizedBy = forwardRef<refProps, props>((props, ref) => {
  const {
    agency,
    update,
    drugAuthorization: { officer, date },
  } = props;

  const officers = useAppSelector(selectOfficersByAgencyDropdown(agency));

  //-- errors
  const [officerError, setOfficerError] = useState("");
  const [authorizationDateError, setAuthorizationDateError] = useState("");

  //-- this allows the developers to consume functions within the
  //-- drug-used component in a parent component
  useImperativeHandle(ref, () => {
    return {
      isValid,
    };
  });

  //-- use to validate the drug-authorized-by component inputs
  const isValid = (): boolean => {
    let result = true;

    if (!officer) {
      setOfficerError(REQUIRED);
      result = false;
    }

    if (!date) {
      setAuthorizationDateError(REQUIRED);
      result = false;
    }

    return result;
  };

  const getValue = (property: string): Option | undefined => {
    if (property === "officer") {
      return officers.find((item) => item.value === officer);
    }
  };

  const updateModel = (property: string, value: string | Date | null | undefined) => {
    const source = { officer, date };
    const authorization = { ...source, [property]: value };

    update("drugAuthorization", authorization);
  };

  //-- event handlers
  const handleOfficerChange = (input: Option | null) => {
    updateModel("officer", input?.value);

    if (officerError && input?.value) {
      setOfficerError("");
    }
  };

  const handleAuthorizationDateChange = (input: Date) => {
    updateModel("date", input);

    if (authorizationDateError && input) {
      setAuthorizationDateError("");
    }
  };

  return (
    <fieldset className="comp-animal-drugs-authorized-by">
      <legend>Drugs authorized by</legend>
      <div className="comp-details-form">
        <div
          className="comp-details-form-row"
          id="officer-assigned-pair-id"
        >
          <label
            id="officer-assigned-authorization-select-label-id"
            htmlFor="officer-assigned-authorization-select-id"
          >
            Officer
          </label>
          <div className="comp-details-input full-width">
            <CompSelect
              id="officer-assigned-authorization-select-id"
              classNamePrefix="comp-select"
              onChange={(evt) => {
                handleOfficerChange(evt);
              }}
              className="comp-details-input"
              options={officers}
              placeholder="Select"
              enableValidation={true}
              value={getValue("officer")}
              errorMessage={officerError}
            />
          </div>
        </div>
        <div
          className="comp-details-form-row"
          id="officer-assigned-pair-id"
        >
          <label
            id="drug-authorization-incident-time-label-id"
            htmlFor="drug-authorization-incident-time"
          >
            Date
          </label>
          <div className="comp-details-input">
            <ValidationDatePicker
              id="drug-authorization-incident-time"
              maxDate={new Date()}
              onChange={(input: Date) => {
                handleAuthorizationDateChange(input);
              }}
              selectedDate={date}
              classNamePrefix="comp-details-edit-calendar-input"
              className={"animal-drug-auth-details-input"}
              placeholder={"Select"}
              errMsg={authorizationDateError}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
});
DrugAuthorizedBy.displayName = "DrugAuthorizedBy";
