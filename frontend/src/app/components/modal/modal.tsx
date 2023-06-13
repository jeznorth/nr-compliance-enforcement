import { FC } from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import {
  closeModal,
  selectCallback,
  selectClosingCallback,
  selectModalData,
  selectModalOpenState,
  selectModalSize,
  selectModalStaticState,
  selectModalType,
} from "../../store/reducers/app";
import { MODAL_COMPONENTS } from "./model-components";

export const ModalComponent: FC = () => {
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(selectModalOpenState);
  const modalSize = useAppSelector(selectModalSize);
  const isStatic = useAppSelector(selectModalStaticState);
  const modalType = useAppSelector(selectModalType);
  const modalData = useAppSelector(selectModalData);
  const callback = useAppSelector(selectCallback);
  const closingCallback = useAppSelector(selectClosingCallback)

  const Content = MODAL_COMPONENTS[modalType];

  const submitModal = (data: any) => {
    debugger
    if(callback){
      callback()
    }
    dispatch(closeModal());
  };

  const handleCloseModal = () => {
    if(closingCallback){
      closingCallback()
    }
    dispatch(closeModal());
  };

  return (
    <Modal
      size={modalSize}
      show={isOpen}
      onHide={handleCloseModal}
      backdrop={isStatic}
    >
      {modalType && (
        <Content
          {...modalData}
          close={handleCloseModal}
          submit={(data: any) => submitModal(data)}
        />
      )}
    </Modal>
  );
};
