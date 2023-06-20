import { FC } from "react";
import { Modal, Row, Col, Button } from "react-bootstrap";
import { useAppSelector } from "../../../hooks/hooks";
import { selectModalData } from "../../../store/reducers/app";
import ComplaintStatusSelect from "../../codes/complaint-status-select";

type AssignOfficerModalProps = {
  close: () => void;
  submit: () => void;
};

export const AssignOfficerModal: FC<AssignOfficerModalProps> = ({ close, submit }) => {
  const modalData = useAppSelector(selectModalData);
  const { title, description } = modalData;

  const handleSelectChange = (selectedValue: string) => {
    // to be filled in on assign-officer story
  };

  return (
    <>
      {title && (
        <Modal.Header closeButton={true}>
          <Modal.Title style={{ fontSize: '20px' }}>{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>
        <Row>
          <Col>
            <label>{description}</label>
          </Col>
        </Row>
        <Row>
          <Col>
            <ComplaintStatusSelect onSelectChange={handleSelectChange}/>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={close}>Cancel</Button>
        <Button onClick={submit}>Update</Button>
      </Modal.Footer>
    </>
  );
};
