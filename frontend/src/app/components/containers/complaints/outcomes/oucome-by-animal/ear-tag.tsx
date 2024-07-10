import { forwardRef, useImperativeHandle, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { BsXCircle, BsFillXCircleFill } from "react-icons/bs";
import { CompIconButton } from "../../../../common/comp-icon-button";
import { CompInput } from "../../../../common/comp-input";
import { CompSelect } from "../../../../common/comp-select";
import { useAppSelector } from "../../../../../hooks/hooks";
import { selectEarDropdown } from "../../../../../store/reducers/code-table";
import { REQUIRED } from "../../../../../constants/general";

type props = {
  id: string;
  ear: string;
  identifier: string;
  order: number;
  update: Function;
  remove: Function;
};

export const EarTag = forwardRef<{ isValid: Function }, props>((props, ref) => {
  const ears = useAppSelector(selectEarDropdown);

  const { id, ear, identifier, order, update, remove } = props;

  const [error, setError] = useState("");

  const leftEar = ears.find((ear) => ear.value === "L");
  const rightEar = ears.find((ear) => ear.value === "R");

  let selectedEar = ear === "L" ? leftEar : rightEar;

  const updateModel = (property: string, value: string | undefined) => {
    const source = { id, ear, identifier, order };
    const updatedTag = { ...source, [property]: value };
    update(updatedTag, property);
  };

  const isValid = (): boolean => {
    let error = !identifier ? REQUIRED : "";
    setError(error);

    return identifier !== "";
  };
  useImperativeHandle(ref, () => {
    return {
      id,
      isValid,
    };
  });

  return (
    <Row className="comp-ear-tag">
      <Col
        xs={6}
        md={4}
        xl={2}
      >
        <label
          className="mb-2"
          htmlFor={`comp-ear-tag-value-${id}`}
        >
          Identifier
        </label>
        <CompInput
          id={`comp-ear-tag-value-${id}`}
          divid="comp-ear-tag-value"
          type="input"
          inputClass="comp-form-control"
          value={identifier}
          error={error}
          maxLength={7}
          onChange={(evt: any) => {
            const {
              target: { value },
            } = evt;

            if (value.length <= 6) {
              updateModel("identifier", value);
            }
          }}
        />
      </Col>
      <Col
        xs={6}
        md={4}
        xl={2}
      >
        <label
          className="mb-2"
          htmlFor={`comp-ear-tag-${id}`}
        >
          Side
        </label>
        <CompSelect
          id={`comp-ear-tag-${id}`}
          classNamePrefix="comp-select"
          className="comp-details-input"
          options={ears}
          enableValidation={false}
          placeholder={"Ear side"}
          onChange={(evt) => {
            updateModel("ear", evt?.value);
          }}
          value={selectedEar}
        />
      </Col>
      <Col className="comp-ear-tag-actions">
        <Button
          variant="outline-primary"
          size="sm"
          aria-label="Delete ear tag"
          onClick={() => remove(id)}
        >
          <i className="bi bi-trash3"></i>
          <span>Delete</span>
        </Button>
      </Col>
    </Row>
  );
});
EarTag.displayName = "EarTag";
