import { FC, useEffect, useState } from "react";
import { AnimalTag } from "../../../../../types/app/complaints/outcomes/wildlife/animal-tag";
import { DrugUsed } from "../../../../../types/app/complaints/outcomes/wildlife/drug-used";
import { DrugAuthorization } from "../../../../../types/app/complaints/outcomes/wildlife/drug-authorization";
import { useAppSelector } from "../../../../../hooks/hooks";
import {
  selectSpeciesCodeDropdown,
  selectAgeDropdown,
  selectSexDropdown,
  selectThreatLevelDropdown,
  selectConflictHistoryDropdown,
  selectWildlifeComplaintOutcome,
  selectEarDropdown,
} from "../../../../../store/reducers/code-table";
import { selectOfficersByAgencyDropdown } from "../../../../../store/reducers/officer";
import { formatDate, getAvatarInitials } from "../../../../../common/methods";
import { from } from "linq-to-typescript";
import { DrugItem } from "./drug-item";
import { BsPencil } from "react-icons/bs";
import { CompTextIconButton } from "../../../../common/comp-text-icon-button";

type props = {
  id: number;
  agency: string;
  species: string;
  sex: string;
  age: string;
  threatLevel: string;
  conflictHistory: string;
  tags: Array<AnimalTag>;
  drugs: Array<DrugUsed>;
  drugAuthorization?: DrugAuthorization;
  outcome: string;
  officer: string;
  date?: Date;
  isEditable: boolean;
  edit: Function;
};
export const AnimalOutcomeItem: FC<props> = ({
  id,
  agency,
  species,
  sex,
  age,
  threatLevel,
  conflictHistory,
  tags,
  drugs,
  drugAuthorization,
  outcome,
  officer,
  edit,
}) => {
  const speciesList = useAppSelector(selectSpeciesCodeDropdown);
  const ages = useAppSelector(selectAgeDropdown);
  const sexes = useAppSelector(selectSexDropdown);
  const threatLevels = useAppSelector(selectThreatLevelDropdown);
  const conflictHistories = useAppSelector(selectConflictHistoryDropdown);

  const ears = useAppSelector(selectEarDropdown);
  const leftEar = ears.find((ear) => ear.value === "L");
  const rightEar = ears.find((ear) => ear.value === "R");

  const outcomes = useAppSelector(selectWildlifeComplaintOutcome);
  const officers = useAppSelector(selectOfficersByAgencyDropdown(agency));

  const [animal, setAnimal] = useState("");
  const [animalSex, setAnimalSex] = useState("");
  const [animalAge, setAnimalAge] = useState("");
  const [animalThreatLevel, setAnimalThreatLevel] = useState("");
  const [animalHistory, setAnimalHistory] = useState("");
  const [animalOutcome, setAnimalOutcome] = useState("");

  useEffect(() => {
    if (species) {
      const selected = from(speciesList).firstOrDefault((item) => item.value === species);
      if (selected?.label) {
        setAnimal(selected.label);
      }
    }
  }, [species, speciesList]);

  useEffect(() => {
    if (sex) {
      const selected = from(sexes).firstOrDefault((item) => item.value === sex);
      if (selected?.label) {
        setAnimalSex(selected.label);
      }
    }
  }, [sex, sexes]);

  useEffect(() => {
    if (age) {
      const selected = from(ages).firstOrDefault((item) => item.value === age);
      if (selected?.label) {
        setAnimalAge(selected.label);
      }
    }
  }, [age, ages]);

  useEffect(() => {
    if (threatLevel) {
      const selected = from(threatLevels).firstOrDefault((item) => item.value === threatLevel);
      if (selected?.label) {
        setAnimalThreatLevel(selected.label);
      }
    }
  }, [threatLevel, threatLevels]);

  useEffect(() => {
    if (conflictHistory) {
      const selected = from(conflictHistories).firstOrDefault((item) => item.value === conflictHistory);
      if (selected?.label) {
        setAnimalHistory(selected.label);
      }
    }
  }, [conflictHistory, conflictHistories]);

  useEffect(() => {
    if (outcome) {
      const selected = from(outcomes).firstOrDefault((item) => item.value === outcome);
      if (selected?.label) {
        setAnimalOutcome(selected.label);
      }
    }
  }, [outcome, outcomes]);

  const assignedOfficer = () => {
    if (officer) {
      const selected = officers.find((item) => item.value === officer);
      return selected?.label ?? "";
    }

    return "";
  };

  return (
    <div className="comp-animal-outcome">
      <div className="comp-details-edit-container">
        <div className="comp-details-edit-column">
          <div className="comp-details-edit-container comp-details-nmargin-right-xxl">
            <div className="comp-details-edit-column">
              <div className="comp-details-label-div-pair ">
                <label className="comp-details-inner-content-label" htmlFor="comp-review-required-officer">
                  Animal
                </label>
                <div className="flex-container">
                  <div className="comp-margin-right-xs">
                    <b>{animal}</b>,
                  </div>
                  {animalSex && <div className="comp-margin-right-xs">{animalSex},</div>}
                  {animalAge && <div className="comp-margin-right-xs">{animalAge}</div>}
                  {animalThreatLevel && (
                    <div className="badge comp-status-badge-threat-level comp-margin-right-xs">
                      Category level: {animalThreatLevel}
                    </div>
                  )}
                  {animalHistory && (
                    <div className="badge comp-status-badge-conflict-history comp-margin-right-xs">
                      Conflict history: {animalHistory}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {from(tags).any() && (
            <div className="comp-details-edit-column">
              <div className="comp-details-label-input-pair">
                <label className="comp-details-inner-content-label top">Ear Tag{tags.length > 1 && "s"}</label>

                <div className="comp-animal-outcome-fill-space">
                <ul className="comp-ear-tag-list">
                  {tags.map(({ id, number, ear }) => (
                    <li key={id}>
                      {number} {ear === "L" ? leftEar?.label : rightEar?.label} side
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            
            </div>
          )}

          {from(drugs).any() && (
            <div className="comp-details-edit-column">
              <div className="comp-details-label-input-pair">
                <label className="comp-details-inner-content-label top">Drug{drugs.length > 1 && "s"}</label>
                <div className="comp-animal-outcome-fill-space">
                  {drugs.map((item) => {
                    const { officer, date } = drugAuthorization || {};
                    return <DrugItem {...item} officer={officer} date={date} agency={agency} key={item.id} />;
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="comp-details-edit-column">
            <div className="comp-details-label-input-pair">
              <label className="comp-details-inner-content-label center">Outcome</label>
              <div>{animalOutcome}</div>
            </div>
          </div>

          <div className="comp-details-edit-container">
            <div className="comp-details-edit-column">
              <div className="comp-details-label-div-pair">
                <label className="comp-details-inner-content-label center" htmlFor="comp-review-required-officer">
                  Officer
                </label>
                <div
                  data-initials-sm={getAvatarInitials(assignedOfficer())}
                  className="comp-orange-avatar-sm comp-details-inner-content"
                >
                  <span id="comp-review-required-officer" className="comp-padding-left-xs">
                    {assignedOfficer()}
                  </span>
                </div>
              </div>
            </div>
            <div className="comp-details-edit-column" id="complaint-supporting-date-div">
              <div className="comp-details-label-div-pair">
                <label className="comp-details-inner-content-label" htmlFor="file-review-supporting-date">
                  Date
                </label>
                <div className="bi comp-margin-right-xxs comp-details-inner-content" id="file-review-supporting-date">
                  {formatDate(new Date().toString())}
                </div>
              </div>
            </div>
            <div className="supporting-width"></div>
          </div>
        </div>
        <div className="comp-details-right-column">
          <CompTextIconButton
            buttonClasses="button-text animal-item-edit"
            text="Edit"
            icon={BsPencil}
            click={(evt) => edit(id)}
          />
        </div>
      </div>
    </div>
  );
};