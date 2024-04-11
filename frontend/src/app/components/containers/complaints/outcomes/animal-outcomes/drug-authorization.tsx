import { FC, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { CompSelect } from "../../../../common/comp-select";
import { useAppSelector } from "../../../../../hooks/hooks";
import { selectComplaintAssignedBy } from "../../../../../store/reducers/complaints";
import { selectOfficersByAgencyDropdown } from "../../../../../store/reducers/officer";
import Option from "../../../../../types/app/option";
import { DrugAuthorization as DrugAuthorizationType } from "../../../../../types/app/complaints/outcomes/wildlife/drug-authorization";
import { ValidationDatePicker } from "../../../../../common/validation-date-picker";

type Props = {
  agency: string;
  drugAuthorization?: DrugAuthorizationType;
  update: Function;
};

export const DrugAuthorization: FC<Props> = ({ agency, drugAuthorization, update }) => {
  const officers = useAppSelector(selectOfficersByAgencyDropdown(agency));
  const assigned = useAppSelector(selectComplaintAssignedBy);

  const [authorizedBy, setAuthorizedBy] = useState(drugAuthorization?.officer ?? assigned ?? undefined);
  const [authorizedOn, setAuthorizedOn] = useState(drugAuthorization?.date);

  const getValue = (property: string): Option | undefined => {

    if (property === "officer") {
      return officers.find((item) => item.value === authorizedBy);
    }
  };


  const handleAuthorizedByChange = (input: string | undefined) => {
    setAuthorizedBy(input);
    const newDrugAuth: DrugAuthorizationType = {officer: input ?? "", date: authorizedOn ?? undefined};
    update(newDrugAuth);

  };

  const handleAuthorizedOnChange = (input: Date | undefined | null) => {
    setAuthorizedOn(input ?? undefined);
    update({officer: authorizedBy, date: input ?? undefined});
  };

  return (
    <div className="comp-animal-outcome-report-inner-spacing">
      <Row>
        <Col md={5}>
          <div className="animal-drug-auth-label-input-pair" id="officer-assigned-pair-id">
            <label
              id="officer-assigned-authorization-select-label-id"
              htmlFor="officer-assigned-authorization-select-id"
            >
              Officer
            </label>
            <CompSelect
              id="officer-assigned-authorization-select-id"
              classNamePrefix="comp-select"
              className="animal-drug-auth-details-input"
              options={officers}
              enableValidation={true}
              placeholder="Select"
              errorMessage={drugAuthorization?.officerErrorMessage}
              onChange={(evt) => {
                handleAuthorizedByChange(evt?.value);
              }}
              value={getValue("officer")}
            />
          </div>
        </Col>

        <Col md="4">
          <div className="animal-drug-auth-label-input-pair" id="officer-assigned-pair-id">
            <label id="drug-authorization-incident-time-label-id" htmlFor="drug-authorization-incident-time">
              Date
            </label>
            <ValidationDatePicker
                  id="drug-authorization-incident-time"
                  maxDate={new Date()}
                  onChange={(date: Date) => handleAuthorizedOnChange(date)}
                  selectedDate={authorizedOn}
                  classNamePrefix="comp-details-edit-calendar-input" 
                  className={"animal-drug-auth-details-input"} 
                  placeholder={"Select"} 
                  errMsg={drugAuthorization?.dateErrorMessage ?? ""}         
                  />
          </div>
        </Col>
        <Col></Col>
        <Col></Col>
      </Row>
    </div>
  );
};
