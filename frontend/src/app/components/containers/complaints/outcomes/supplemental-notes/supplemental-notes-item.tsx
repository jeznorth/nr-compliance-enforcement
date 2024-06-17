import { FC } from "react";
import { CompTextIconButton } from "../../../../common/comp-text-icon-button";
import { BsPencil, BsTrash3 } from "react-icons/bs";
import { useAppSelector } from "../../../../../hooks/hooks";
import { formatDate } from "../../../../../common/methods";

import { CaseAction } from "../../../../../types/outcomes/case-action";
import { selectNotesOfficer } from "../../../../../store/reducers/case-selectors";
import { Button, Card } from "react-bootstrap";

type props = {
  notes: string;
  action: CaseAction;
  enableEditMode: Function;
  deleteNote: Function;
};

export const SupplementalNotesItem: FC<props> = ({ notes, action, enableEditMode, deleteNote }) => {
  const { initials, displayName } = useAppSelector(selectNotesOfficer);

  return (
    <section className="comp-details-section comp-outcome-additional-notes">
      <div className="comp-details-section-header">
        <h3>Additional notes</h3>
        <div className="comp-details-section-header-actions">
          <Button
            variant="outline-primary"
            size="sm"
            id="notes-delete-button"
            onClick={(e) => enableEditMode(true)}
          >
            <i className="bi bi-pencil"></i>
            <span>Edit</span>
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            id="notes-edit-button"
            onClick={() => deleteNote()}
          >
            <i className="bi bi-trash3"></i>
            <span>Delete</span>
          </Button>
        </div>
      </div>
      <Card>
        <Card.Body>
          <dl>
            <div>
              <dt>Notes</dt>
              <dd>
                <pre>{notes}</pre>
              </dd>
            </div>
            <div>
              <dt>Officer</dt>
              <dd>
                <div
                  className="comp-avatar comp-avatar-sm comp-avatar-orange"
                  data-initials-sm={initials}
                >
                  <span id="comp-notes-officer">{displayName}</span>
                </div>
              </dd>
            </div>
            <div id="complaint-supporting-date-div">
              <dt>Date</dt>
              <dd id="file-review-supporting-date">{formatDate(new Date(action?.date).toString())}</dd>
            </div>
          </dl>
        </Card.Body>
      </Card>
      <div
        className="comp-outcome-supporting-notes"
        hidden
      >
        <div className="comp-details-edit-container">
          <div className="comp-details-edit-column">
            <p className="comp-paragraph-break-word">{notes}</p>
            <div className="comp-details-edit-container">
              <div className="comp-details-edit-column">
                <div className="comp-details-label-div-pair">
                  <label
                    className="comp-details-inner-content-label"
                    htmlFor="comp-notes-officer"
                  >
                    Officer
                  </label>
                  <div
                    data-initials-sm={initials}
                    className="comp-orange-avatar-sm comp-details-inner-content"
                  >
                    <span
                      id="comp-notes-officer"
                      className="comp-padding-left-xs"
                    >
                      {displayName}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="comp-details-edit-column"
                id="complaint-supporting-date-div"
              >
                <div className="comp-details-label-div-pair">
                  <label
                    className="comp-details-inner-content-label"
                    htmlFor="file-review-supporting-date"
                  >
                    Date
                  </label>
                  <div
                    className="bi comp-margin-right-xxs comp-details-inner-content"
                    id="file-review-supporting-date"
                  >
                    {formatDate(new Date(action?.date).toString())}
                  </div>
                </div>
              </div>
              <div className="supporting-width"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
