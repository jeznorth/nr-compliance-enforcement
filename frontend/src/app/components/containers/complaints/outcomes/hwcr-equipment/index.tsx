import { FC, useState, memo } from "react";
import { Button, Card } from "react-bootstrap";
import { EquipmentForm } from "./equipment-form";
import { EquipmentItem } from "./equipment-item";
import { useAppSelector } from "../../../../../hooks/hooks";
import { selectEquipment } from "../../../../../store/reducers/case-selectors";
import { selectComplaintAssignedBy } from "../../../../../store/reducers/complaints";
import "../../../../../../assets/sass/hwcr-equipment.scss";

export const HWCREquipment: FC = memo(() => {
  const [showEquipmentForm, setShowEquipmentForm] = useState<boolean>(false);
  const assigned = useAppSelector(selectComplaintAssignedBy);
  // used to indicate which equipment's guid is in edit mode (only one can be edited at a time
  const equipmentList = useAppSelector(selectEquipment);

  const [editingGuid, setEditingGuid] = useState<string>("");

  const handleEdit = (guid: string) => {
    setEditingGuid(guid);
  };

  const handleSave = () => {
    setShowEquipmentForm(false);
    setEditingGuid("");
  };

  const handleCancel = () => {
    setShowEquipmentForm(false);
    setEditingGuid("");
  };

  return (
    <section className="comp-details-section">
      <div className="comp-details-section-header">
        <h3>Equipment</h3>
      </div>
      {equipmentList && equipmentList.length > 0
        ? equipmentList.map((equipment) =>
            editingGuid === equipment.id ? (
              <Card className="comp-card hwcr-equipment-card">
                <Card.Header>
                  <div className="comp-card-title-container">
                    <h4 id="equipment-type-title">Edit Equipment</h4>
                  </div>
                </Card.Header>
                <Card.Body>
                  <EquipmentForm
                    key={equipment.id}
                    equipment={equipment}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </Card.Body>
              </Card>
            ) : (
              <EquipmentItem
                key={equipment.id}
                equipment={equipment}
                onEdit={handleEdit}
                isEditDisabled={!!editingGuid && editingGuid !== equipment.id}
              />
            ),
          )
        : null}

      {/* Add Equipment Form */}
      {showEquipmentForm ? (
        <Card className="comp-card hwcr-equipment-card">
          <Card.Header>
            <div className="comp-card-title-container">
              <h4 id="equipment-type-title">Add Equipment</h4>
            </div>
          </Card.Header>
          <Card.Body>
            <EquipmentForm
              onSave={handleSave}
              onCancel={handleCancel}
              assignedOfficer={assigned}
            />
          </Card.Body>
        </Card>
      ) : (
        <Button
          id="outcome-report-add-equipment"
          title="Add equipment"
          variant="primary"
          size="sm"
          onClick={() => setShowEquipmentForm(true)}
        >
          <i className="bi bi-plus-circle"></i>
          <span>Add equipment</span>
        </Button>
      )}
    </section>
  );
});
