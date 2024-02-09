import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Button } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppSelector } from "../../../../../hooks/hooks";
import { selectOfficersByAgency } from "../../../../../store/reducers/officer";
import { getComplaintById, selectComplaint, selectComplaintCallerInformation, selectComplaintHeader } from "../../../../../store/reducers/complaints";
import { CompSelect } from "../../../../common/comp-select";
import { CompInput } from "../../../../common/comp-input";
import { ToggleError } from "../../../../../common/toast";
import { getSelectedOfficer, bcBoundaries } from "../../../../../common/methods";

import { Equipment } from "./index";
import Option from "../../../../../types/app/option";
import { Officer } from "../../../../../types/person/person";

import "react-toastify/dist/ReactToastify.css";
import { Coordinates } from "../../../../../types/app/coordinate-type";

const equipmentTypeList = [
  {
    label: 'Bear snare',
    value: 'Bear snare'
  },
  {
    label: 'Bear live trap',
    value: 'Bear live trap'
  },
  {
    label: 'Cougar foothold trap',
    value: 'Cougar foothold trap'
  },
  {
    label: 'Cougar live trap',
    value: 'Cougar live trap'
  },
  {
    label: 'Neck snare',
    value: 'Neck snare'
  },
  {
    label: 'Signage',
    value: 'Signage'
  },
  {
    label: 'Trail camera',
    value: 'Trail camera'
  },
]

export interface EquipmentForm {
  isInEditMode: boolean
  setIsInEditMode: (param: any) => void | null
  equipmentItemData?: Equipment | null
  setEquipmentItemData?: (param: any) => void | null
  equipmentData?: Array<Equipment>
  setEquipmentData?: (param: any) => void | null
  indexItem?: number
  setShowEquipmentForm?: (param: boolean) => void | null
}

export const EquipmentForm: FC<EquipmentForm> = ({
  isInEditMode,
  equipmentData,
  indexItem,
  setIsInEditMode,
  equipmentItemData,
  setEquipmentItemData,
  setShowEquipmentForm,
  setEquipmentData
}) => {
  const [type, setType] = useState<Option|undefined>()
  const [dateSet, setDateSet] = useState<Date>();
  const [dateRemoved, setDateRemoved] = useState<Date>();
  const [officerSet, setOfficerSet] = useState<Option>();
  const [officerRemoved, setOfficerRemoved] = useState<Option>();
  const [address, setAddress] = useState<string|undefined>("");
  const [xCoordinate, setXCoordinate] = useState<string>('');
  const [yCoordinate, setYCoordinate] = useState<string>('');
  const [xCoordinateErrorMsg, setXCoordinateErrorMsg] = useState<string>('');
  const [yCoordinateErrorMsg, setYCoordinateErrorMsg] = useState<string>('');
  
  const dispatch = useAppDispatch();
  const { id = "", complaintType = "" } = useParams<{id: string, complaintType: string}>();
  const complaintData = useAppSelector(selectComplaint);
  const {
    ownedByAgencyCode,
  } = useAppSelector(selectComplaintCallerInformation);
  const {
    personGuid,
  } = useAppSelector(selectComplaintHeader(complaintType));
  const officersInAgencyList = useAppSelector(selectOfficersByAgency(ownedByAgencyCode?.agency));

  const assignableOfficers: Option[] = officersInAgencyList !== null
      ? officersInAgencyList.map((officer: Officer) => ({
          value: officer.person_guid.person_guid,
          label: `${officer.person_guid.first_name} ${officer.person_guid.last_name}`,
        }))
        : [];
  
  useEffect(() => {
    if (id && (!complaintData || complaintData.id !== id)) {
      dispatch(getComplaintById(id, complaintType));
    }
  }, [id, complaintType, complaintData, dispatch]);

  useEffect(() => {
    if(complaintData) {
      const officer = getSelectedOfficer(assignableOfficers, personGuid, complaintData);
      setOfficerSet(officer);
    }
  }, [complaintData]);

  useEffect(() => {
    if(equipmentItemData){
      const {type, address, dateSet, dateRemoved, officerSet, officerRemoved, xCoordinate, yCoordinate} = equipmentItemData
      setType(type);
      setAddress(address);
      setXCoordinate(xCoordinate);
      setYCoordinate(yCoordinate);
      setDateRemoved(dateRemoved);
      setDateSet(dateSet);
      setOfficerSet(officerSet);
      setOfficerRemoved(officerRemoved);
    }
  }, [equipmentItemData])

  const handleCoordinateChange = (input: string, type: Coordinates) => {
    if (type === Coordinates.Latitude) {
      setYCoordinate(input);
      handleGeoPointChange(input, xCoordinate);
    } else {
      setXCoordinate(input);
      handleGeoPointChange(yCoordinate, input);
    }
  };

  const handleGeoPointChange = async (latitude: string, longitude: string) => {
    setYCoordinateErrorMsg("");
    setXCoordinateErrorMsg("");
    const regex=/^[a-zA-Z]+$/;

    if (regex.exec(latitude)) {
      setYCoordinateErrorMsg("Value must be a number")
    }
    if(regex.exec(longitude)) {
      setXCoordinateErrorMsg("Value must be a number")
    }
    if (latitude && !Number.isNaN(latitude)) {
      const item = parseFloat(latitude);
      if (item > bcBoundaries.maxLatitude || item < bcBoundaries.minLatitude) {
        setYCoordinateErrorMsg(`Value must be between ${bcBoundaries.maxLatitude} and ${bcBoundaries.minLatitude} degrees`);
      }
    }

    if (longitude && !Number.isNaN(longitude)) {
      const item = parseFloat(longitude);
      if (item > bcBoundaries.maxLongitude || item < bcBoundaries.minLongitude) {
        setXCoordinateErrorMsg(`Value must be between ${bcBoundaries.minLongitude} and ${bcBoundaries.maxLongitude} degrees`);
      }
    }
  };

  const handleSaveEquipment = () => {
    if(xCoordinateErrorMsg || yCoordinateErrorMsg) {
      handleFormErrors();
      return;
    }

    //No errors then create/save new equipment info
    const newEquipment = {
      id: isInEditMode? equipmentItemData?.id : uuidv4(),
      type,
      address,
      xCoordinate,
      yCoordinate,
      officerSet,
      dateSet,
      officerRemoved,
      dateRemoved,
    }
    if(isInEditMode) {
      const newEquipmentArr = equipmentData?.map((equipment,i) => {
        if(i === indexItem) return newEquipment
        else return equipment
      })
      if(setEquipmentData) setEquipmentData(newEquipmentArr)
      setIsInEditMode(false);
    }
    if(!isInEditMode && setEquipmentData && setShowEquipmentForm) {
      setEquipmentData((prevState: Array<Equipment>) => [...prevState, newEquipment]);
      setShowEquipmentForm(false);
    }
    else return
  }

  const handleFormErrors = () => {
    const errorMsg = isInEditMode? 'Errors editing equipment' : 'Errors creating equipment'
    ToggleError(errorMsg);
  };

  const handleCancelEquipment = () => {
    resetData();
    if(isInEditMode) {
      if(equipmentItemData){
        equipmentItemData.isEdit = false;
      }
      setIsInEditMode(false);
      if(setEquipmentItemData) setEquipmentItemData(null)
    }
    if(setShowEquipmentForm) setShowEquipmentForm(false);
  }

  const resetData = () => {
    setAddress('')
    setXCoordinate('')
    setYCoordinate('')
    setXCoordinateErrorMsg('')
    setYCoordinateErrorMsg('')
  }

  const hasCoordinates = (complaintData?.location?.coordinates[0] !== 0 || 
    complaintData?.location?.coordinates[1] !== 0)

  return (
    <div className="comp-outcome-report-complaint-assessment">
      <ToastContainer />
      <div className="comp-details-edit-container">
        <div className="comp-details-edit-column">
          <div className="comp-details-label-input-pair">
            <label htmlFor="equipment-type-select">Equipment type</label>
            <CompSelect
              id="equipment-type-select"
              classNamePrefix="comp-select"
              className="comp-details-input"
              placeholder="Select"
              options={equipmentTypeList}
              enableValidation={false}
              onChange={(type: any) => setType(type)}
              defaultOption={equipmentItemData?.type}
            />
          </div>
        </div>
        <div className="comp-details-edit-column comp-details-right-column"></div>
      </div>
      <div className="comp-details-edit-container">
        <div className="comp-details-edit-column">
          <div className="comp-details-label-input-pair">
            <label htmlFor="equipment-address" style={{ marginTop: complaintData?.locationSummary? '-21px' : '0px' }}>Address</label>
            <div className="edit-input">
              <input
                type="text"
                id="equipment-address"
                className="comp-form-control"
                onChange={(e) => setAddress(e.target.value)}
                maxLength={120}
                value={address}
              />
            </div>
          </div>
          {complaintData?.locationSummary && 
            <button
              className="button-text copy-text" 
              onClick={() => complaintData? setAddress(complaintData.locationSummary) : ''}
            >Copy location from complaint details</button>
          }
        </div>
        <div className="comp-details-edit-column comp-details-right-column"></div>
      </div>
      <div className="comp-details-edit-container">
        <div className="comp-details-edit-column">
          <CompInput
            id="comp-details-edit-x-coordinate-input"
            divId="comp-details-edit-x-coordinate-input-div"
            type="input"
            label="X Coordinate"
            containerClass="comp-details-edit-input"
            formClass="comp-details-label-input-pair"
            inputClass="comp-form-control"
            value={xCoordinate ?? ''}
            error={xCoordinateErrorMsg}
            step="any"
            onChange={(evt: any) => handleCoordinateChange(evt.target.value, Coordinates.Longitude)}
          />
          {hasCoordinates &&
            <button
              className="button-text copy-text"
              onClick={() => {
                const xCoordinate = complaintData?.location?.coordinates[0].toString() ?? ''
                const yCoordinate = complaintData?.location?.coordinates[1].toString() ?? ''
                setXCoordinate(xCoordinate);
                setYCoordinate(yCoordinate);
                handleGeoPointChange(yCoordinate, xCoordinate);
              }}
            >
              Copy location from complaint details
            </button>
          }
        </div>
        <div className="comp-details-edit-column comp-details-right-column">
          <CompInput
            id="comp-details-edit-y-coordinate-input"
            divId="comp-details-edit-y-coordinate-input-div"
            type="input"
            label="Y Coordinate"
            containerClass="comp-details-edit-input"
            formClass="comp-details-label-input-pair"
            inputClass="comp-form-control"
            value={yCoordinate ?? ''}
            error={yCoordinateErrorMsg}
            step="any"
            onChange={(evt: any) => handleCoordinateChange(evt.target.value, Coordinates.Latitude)}
          />
        </div>
      </div>
      <div className="comp-details-edit-container">
        <div className="comp-details-edit-column">
          <div className="comp-details-label-input-pair" id="reported-pair-id">
            <label htmlFor="equipment-officer-set-select">Set by</label>
            <CompSelect
              id="equipment-officer-set-select"
              classNamePrefix="comp-select"
              className="comp-details-input"
              placeholder="Select"
              options={assignableOfficers}
              value={officerSet}
              enableValidation={false}
              onChange={(officer: any) => setOfficerSet(officer)}
            />
          </div>
        </div>
        <div className="comp-details-edit-column comp-details-right-column">
          <div className="comp-details-label-input-pair" id="reported-pair-id">
            <label htmlFor="equipment-day-set">Set date</label>
            <DatePicker
              id="equipment-day-set"
              showIcon
              maxDate={dateRemoved ?? new Date()}
              onChange={(date: Date) => setDateSet(date)}
              selected={dateSet}
              dateFormat="yyyy-MM-dd"
              wrapperClassName="comp-details-edit-calendar-input"
            />
          </div>
        </div>
      </div>
      {officerSet && dateSet && 
        <div className="comp-details-edit-container">
          <div className="comp-details-edit-column">
            <div className="comp-details-label-input-pair" id="reported-pair-id">
              <label htmlFor="equipment-officer-removed-select">Removed by</label>
                <CompSelect
                  id="equipment-officer-removed-select"
                  classNamePrefix="comp-select"
                  className="comp-details-input"
                  placeholder="Select"
                  options={assignableOfficers}
                  value={officerRemoved}
                  enableValidation={false}
                  onChange={(officer: any) => setOfficerRemoved(officer)}
                />
            </div>
          </div>
          <div className="comp-details-edit-column comp-details-right-column">
            <div className="comp-details-label-input-pair" id="reported-pair-id">
              <label htmlFor="equipment-date-removed">Removed date</label>
                <DatePicker
                  id="equipment-date-removed"
                  showIcon
                  maxDate={new Date()}
                  minDate={dateSet ?? null}
                  onChange={(date: Date) => setDateRemoved(date)}
                  selected={dateRemoved}
                  dateFormat="yyyy-MM-dd"
                  wrapperClassName="comp-details-edit-calendar-input"
              />
            </div>
          </div>
        </div>
      }
      <div className="comp-outcome-report-actions">
        <Button
          id="equipment-cancel-button"
          title="Cancel Outcome"
          className="comp-outcome-cancel"
          onClick={handleCancelEquipment}
        >
          Cancel
        </Button>
        <Button
          id="equipment-save-button"
          title="Save Outcome"
          className="comp-outcome-save"
          onClick={handleSaveEquipment}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
  