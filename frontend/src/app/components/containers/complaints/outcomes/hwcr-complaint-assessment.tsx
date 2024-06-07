import { FC, useEffect, useState } from "react";
import Option from "../../../../types/app/option";
import { Button } from "react-bootstrap";
import { Officer } from "../../../../types/person/person";
import { useAppDispatch, useAppSelector } from "../../../../hooks/hooks";
import { selectOfficersByAgency } from "../../../../store/reducers/officer";
import {
  getComplaintById,
  selectComplaint,
  selectComplaintCallerInformation,
  selectComplaintHeader,
  selectComplaintAssignedBy,
} from "../../../../store/reducers/complaints";
import {
  selectAssessmentTypeCodeDropdown,
  selectJustificationCodeDropdown,
  selectYesNoCodeDropdown,
} from "../../../../store/reducers/code-table";
import { useParams } from "react-router-dom";
import { formatDate, getAvatarInitials, getSelectedOfficer } from "../../../../common/methods";
import { CompSelect } from "../../../common/comp-select";
import { ValidationCheckboxGroup } from "../../../../common/validation-checkbox-group";
import { resetAssessment } from "../../../../store/reducers/cases";
import { openModal } from "../../../../store/reducers/app";
import { CANCEL_CONFIRM } from "../../../../types/modal/modal-types";
import { ToggleError } from "../../../../common/toast";
import "react-toastify/dist/ReactToastify.css";
import { Assessment } from "../../../../types/outcomes/assessment";
import { ValidationDatePicker } from "../../../../common/validation-date-picker";
import { BsPencil } from "react-icons/bs";
import { CompTextIconButton } from "../../../common/comp-text-icon-button";

import "../../../../../assets/sass/hwcr-assessment.scss";
import { selectAssessment } from "../../../../store/reducers/case-selectors";
import { getAssessment, upsertAssessment } from "../../../../store/reducers/case-thunks";
import { OptionLabels } from "../../../../constants/option-labels";

export const HWCRComplaintAssessment: FC = () => {
  const dispatch = useAppDispatch();
  type ComplaintParams = {
    id: string;
    complaintType: string;
  };
  const [selectedActionRequired, setSelectedActionRequired] = useState<Option | null>();
  const [selectedJustification, setSelectedJustification] = useState<Option | null>();
  const [selectedDate, setSelectedDate] = useState<Date | null | undefined>();
  const [selectedOfficer, setSelectedOfficer] = useState<Option | null>();
  const [selectedAssessmentTypes, setSelectedAssessmentTypes] = useState<Option[]>([]);
  const [editable, setEditable] = useState<boolean>(true);

  const handleAssessmentTypesChange = (selectedItems: Option[]) => {
    setSelectedAssessmentTypes(selectedItems);
  };

  const [officerErrorMessage, setOfficerErrorMessage] = useState<string>("");
  const [assessmentDateErrorMessage, setAssessmentDateErrorMessage] = useState<string>("");
  const [actionRequiredErrorMessage, setActionRequiredErrorMessage] = useState<string>("");
  const [justificationRequiredErrorMessage, setJustificationRequiredErrorMessage] = useState<string>("");
  const [assessmentRequiredErrorMessage, setAssessmentRequiredErrorMessage] = useState<string>("");

  const complaintData = useAppSelector(selectComplaint);
  const assessmentState = useAppSelector(selectAssessment);
  const { id = "", complaintType = "" } = useParams<ComplaintParams>();
  const { ownedByAgencyCode } = useAppSelector(selectComplaintCallerInformation);
  const officersInAgencyList = useAppSelector(selectOfficersByAgency(ownedByAgencyCode?.agency));

  const assignableOfficers: Option[] =
    officersInAgencyList !== null
      ? officersInAgencyList.map((officer: Officer) => ({
          value: officer.person_guid.person_guid,
          label: `${officer.person_guid.first_name} ${officer.person_guid.last_name}`,
        }))
      : [];
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const toggleEdit = () => {
    setEditable(true);
  };

  const handleActionRequiredChange = (selected: Option | null) => {
    if (selected) {
      setSelectedActionRequired(selected);
      setSelectedJustification(null as unknown as Option);
    } else {
      setSelectedActionRequired(undefined);
    }
  };

  const handleJustificationChange = (selected: Option | null) => {
    if (selected) {
      setSelectedJustification(selected);
    } else {
      setSelectedJustification(undefined);
    }
  };

  const actionRequiredList = useAppSelector(selectYesNoCodeDropdown);
  const justificationList = useAppSelector(selectJustificationCodeDropdown);
  const assessmentTypeList = useAppSelector(selectAssessmentTypeCodeDropdown);
  const { personGuid } = useAppSelector(selectComplaintHeader(complaintType));
  const assigned = useAppSelector(selectComplaintAssignedBy);

  useEffect(() => {
    if (id && (!complaintData || complaintData.id !== id)) {
      dispatch(getComplaintById(id, complaintType));
    }
  }, [id, complaintType, complaintData, dispatch]);

  useEffect(() => {
    if (complaintData) {
      const officer = getSelectedOfficer(assignableOfficers, personGuid, complaintData);
      setSelectedOfficer(officer);
      dispatch(getAssessment(complaintData.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintData]);

  useEffect(() => {
    populateAssessmentUI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentState]);

  // clear the redux state
  useEffect(() => {
    return () => {
      dispatch(resetAssessment());
    };
  }, [dispatch]);

  const populateAssessmentUI = () => {
    const selectedOfficer = (
      assessmentState.officer
        ? {
            label: assessmentState.officer?.key,
            value: assessmentState.officer?.value,
          }
        : null
    ) as Option;

    const selectedActionRequired = (
      assessmentState.action_required
        ? {
            label: assessmentState.action_required,
            value: assessmentState.action_required,
          }
        : null
    ) as Option;

    const selectedJustification = (
      assessmentState.justification
        ? {
            label: assessmentState.justification?.key,
            value: assessmentState.justification?.value,
          }
        : null
    ) as Option;

    const selectedAssessmentTypes = assessmentState.assessment_type?.map((item) => {
      return {
        label: item.key,
        value: item.value,
      };
    }) as Option[];

    const assesmentDate = assessmentState?.date ? new Date(assessmentState.date) : new Date();

    setSelectedDate(assesmentDate);
    setSelectedOfficer(selectedOfficer);
    setSelectedActionRequired(selectedActionRequired);
    setSelectedJustification(selectedJustification);
    setSelectedAssessmentTypes(selectedAssessmentTypes);
    resetValidationErrors();
    setEditable(!assessmentState.date);

    if (!selectedOfficer && assigned && officersInAgencyList) {
      const officerAssigned: Option[] = officersInAgencyList
        .filter((officer) => officer.person_guid.person_guid === assigned)
        .map((item) => {
          return {
            label: `${item.person_guid?.first_name} ${item.person_guid?.last_name}`,
            value: assigned,
          } as Option;
        });
      if (
        officerAssigned &&
        Array.isArray(officerAssigned) &&
        officerAssigned.length > 0 &&
        typeof officerAssigned[0].label !== "undefined"
      ) {
        setSelectedOfficer(officerAssigned[0]);
      }
    }
  };

  const justificationLabelClass = selectedActionRequired?.value === "No" ? "" : "comp-outcome-hide";
  const justificationEditClass =
    selectedActionRequired?.value === "No" ? "comp-details-input" : "comp-details-input comp-outcome-hide";

  const cancelConfirmed = () => {
    populateAssessmentUI();
  };

  const cancelButtonClick = () => {
    dispatch(
      openModal({
        modalSize: "md",
        modalType: CANCEL_CONFIRM,
        data: {
          title: "Cancel Changes?",
          description: "Your changes will be lost.",
          cancelConfirmed,
        },
      }),
    );
  };

  // save to redux if no errors.  Otherwise, display error message(s).
  const saveButtonClick = async () => {
    if (!hasErrors()) {
      const updatedAssessmentData: Assessment = {
        date: selectedDate,
        officer: {
          key: selectedOfficer?.label,
          value: selectedOfficer?.value,
        },
        action_required: selectedActionRequired?.label,
        justification: {
          key: selectedJustification?.label,
          value: selectedJustification?.value,
        },
        assessment_type:
          selectedActionRequired?.label === OptionLabels.OPTION_NO
            ? []
            : selectedAssessmentTypes?.map((item) => {
                return {
                  key: item.label,
                  value: item.value,
                };
              }),
      };

      dispatch(upsertAssessment(id, updatedAssessmentData));
      setEditable(false);
    } else {
      handleFormErrors();
    }
  };

  const handleFormErrors = () => {
    ToggleError("Errors in form");
  };

  // Clear out existing validation errors
  const resetValidationErrors = () => {
    setOfficerErrorMessage("");
    setActionRequiredErrorMessage("");
    setAssessmentDateErrorMessage("");
    setJustificationRequiredErrorMessage("");
    setAssessmentRequiredErrorMessage("");
  };

  // Validates the assessment
  const hasErrors = (): boolean => {
    let hasErrors: boolean = false;
    resetValidationErrors();

    if (!selectedOfficer) {
      setOfficerErrorMessage("Required");
      hasErrors = true;
    }

    if (!selectedDate) {
      hasErrors = true;
      setAssessmentDateErrorMessage("Required");
    }

    if (!selectedActionRequired) {
      setActionRequiredErrorMessage("Required");
      hasErrors = true;
    }

    if (
      selectedActionRequired?.value === OptionLabels.OPTION_YES &&
      (!selectedAssessmentTypes || selectedAssessmentTypes?.length <= 0)
    ) {
      setAssessmentRequiredErrorMessage("One or more assessment is required");
      hasErrors = true;
    }

    if (selectedActionRequired?.value === "No" && !selectedJustification) {
      setJustificationRequiredErrorMessage("Required when Action Required is No");
      hasErrors = true;
    }

    return hasErrors;
  };

  const assessmentDivClass = `comp-details-form-row ${selectedActionRequired?.value === "Yes" ? "" : "hidden"}`;

  return (
    <section className="comp-details-section">
      <div className="comp-details-section-header">
        <h3>Complaint assessment</h3>
        {!editable && (
          <div className="comp-details-section-header-actions">
            <Button
              id="assessment-edit-button"
              variant="outline-primary"
              size="sm"
              onClick={toggleEdit}
            >
              <i className="bi bi-pencil"></i>
              Edit
            </Button>
          </div>
        )}
      </div>
      {editable ? (
        <div className="comp-details-form">
          <div className="comp-details-form-group">
            <div
              id="action-required-div"
              className="comp-details-form-row"
            >
              <label htmlFor="action-required">Action required?</label>
              <div className="comp-details-input full-width">
                <CompSelect
                  id="action-required"
                  className="comp-details-input"
                  classNamePrefix="comp-select"
                  options={actionRequiredList}
                  enableValidation={true}
                  errorMessage={actionRequiredErrorMessage}
                  value={selectedActionRequired}
                  placeholder="Select"
                  onChange={(e) => handleActionRequiredChange(e)}
                />
              </div>
            </div>
            {/* This is block that we will hide/show */}
            <div
              id="assessment-checkbox-div"
              className={assessmentDivClass}
            >
              <label htmlFor="checkbox-div">Assessment</label>
              <div className="comp-details-input full-width">
                <ValidationCheckboxGroup
                  errMsg={assessmentRequiredErrorMessage}
                  options={assessmentTypeList}
                  onCheckboxChange={handleAssessmentTypesChange}
                  checkedValues={selectedAssessmentTypes}
                ></ValidationCheckboxGroup>
              </div>
            </div>
          </div>
          <div
            id="justification-div"
            className="comp-details-form-row"
          >
            <label
              className={justificationLabelClass}
              htmlFor="justification"
            >
              Justification
            </label>
            <div className="comp-details-input full-width">
              <CompSelect
                id="justification"
                className={justificationEditClass}
                classNamePrefix="comp-select"
                options={justificationList}
                enableValidation={true}
                errorMessage={justificationRequiredErrorMessage}
                value={selectedJustification}
                placeholder="Select"
                onChange={(e) => handleJustificationChange(e)}
              />
            </div>
          </div>
          <div
            id="outcome-officer-div"
            className="comp-details-form-row"
          >
            <label htmlFor="outcome-officer">Officer</label>
            <div className="comp-details-input full-width">
              <CompSelect
                id="outcome-officer"
                classNamePrefix="comp-select"
                options={assignableOfficers}
                enableValidation={true}
                errorMessage={officerErrorMessage}
                value={selectedOfficer}
                placeholder="Select "
                onChange={(officer: any) => setSelectedOfficer(officer)}
              />
            </div>
          </div>
          <div
            id="complaint-outcome-date-div"
            className="comp-details-form-row"
          >
            <label htmlFor="complaint-outcome-date">Date</label>
            <div className="comp-details-input full-width">
              <ValidationDatePicker
                id="complaint-outcome-date"
                selectedDate={selectedDate}
                onChange={handleDateChange}
                placeholder="Select date"
                className="comp-details-edit-calendar-input" // Adjust class as needed
                classNamePrefix="comp-select" // Adjust class as needed
                errMsg={assessmentDateErrorMessage} // Pass error message if any
                maxDate={new Date()}
              />
            </div>
          </div>
          <div className="comp-details-form-buttons">
            <Button
              variant="outline-primary"
              id="outcome-cancel-button"
              title="Cancel Outcome"
              onClick={cancelButtonClick}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              id="outcome-save-button"
              title="Save Outcome"
              onClick={saveButtonClick}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <dl>
          <div>
            <dt>Action Required</dt>
            <dd>{selectedActionRequired?.value}</dd>
          </div>
          {selectedAssessmentTypes && (
            <div>
              <dt>Actions</dt>
              <dd>
                <ul>
                  {selectedAssessmentTypes?.map((assesmentValue) => (
                    <li key={assesmentValue.label}>{assesmentValue.label}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}

          <div>
            <dt>Justification</dt>
            <dd>
              <span className={justificationEditClass}>{selectedJustification?.label || ""}</span>
            </dd>
          </div>

          <div>
            <dt>Officer</dt>
            <dd>
              <div
                data-initials-sm={getAvatarInitials(selectedOfficer?.label ?? "")}
                className="comp-avatar comp-avatar-sm comp-avatar-orange"
              >
                <span id="comp-review-required-officer">{selectedOfficer?.label ?? ""}</span>
              </div>
            </dd>
          </div>

          <div>
            <dt>Date</dt>
            <dd>
              <dd className="comp-date-time-value">
                <div>
                  <i className="bi bi-calendar"></i>
                  {formatDate(`${selectedDate}`)}
                </div>
              </dd>
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
};
