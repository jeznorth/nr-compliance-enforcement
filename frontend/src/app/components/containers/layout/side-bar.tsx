import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import {
  isSidebarOpen,
  toggleSidebar,
} from "../../../store/reducers/app";
import logo from "../../../../assets/images/icons/ce-cos-icon.svg";
import MenuItem from "../../../types/app/menu-item";
import { Link } from "react-router-dom";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

export const SideBar: FC = () => {
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(isSidebarOpen);

  const menueItems: Array<MenuItem> = [
    {
      id: "complaints-link",
      name: "Complaints",
      icon: "bi bi-file-earmark-medical",
      route: "/complaints",
    },
    {
      id: "zone-at-a-glance-link",
      name: "Zone at a Glance",
      icon: "bi bi-buildings",
      route: "/zone/at-a-glance",
    },
  ];

  const renderSideBarMenuItem = (idx: number, item: MenuItem): JSX.Element => {
    const { id, icon, name, route } = item;

    return isOpen ? (
      <li key={`sb-open-${idx}`}>
          {!route ? <i className={`comp-nav-item-icon ${icon}`}></i> : <Link to={route} id={`icon-${id}`}><i className={`comp-nav-item-icon ${icon}`}></i></Link>}
          <span className="comp-nav-item-name">
            {!route ? <>{name}</> : <Link to={route} id={id}>{name}</Link>}
          </span>
        </li>
    ) : (
      <OverlayTrigger key={`overlay-${idx}`} placement="right" overlay={<Tooltip id={`tt-${id}`} className="comp-tooltip comp-tooltip-right">{name}</Tooltip>}>
        <li key={`sb-closed-${idx}`}>
        {!route ? <i className={`comp-nav-item-icon ${icon}`}></i> : <Link to={route} id={`icon-${id}`}><i className={`comp-nav-item-icon ${icon}`}></i></Link>}
          <span className="comp-nav-item-name">
            {!route ? <>{name}</> : <Link to={route} id={id}>{name}</Link>}
          </span>
        </li>
      </OverlayTrigger>      
    );
  };

  return (
    <div
      className={`d-flex flex-column flex-shrink-0 comp-side-bar  ${(!isOpen
        ? "collapsed"
        : ""
      ).trim()}`}
    >
      {/* <!-- organization name --> */}
      <span className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none comp-organization-nav-item">
        <img className="comp-organization-nav-logo" src={logo} alt="logo" />
        <span className="comp-organization-nav-name">
          Conservation Officer Service
        </span>
      </span>

      {/* <!-- menu items for the organization --> */}
        <ul className="nav nav-pills flex-column mb-auto comp-nav-item-list">
          {menueItems.map((item, idx) => {
            return renderSideBarMenuItem(idx, item);
          })}
        </ul>
      <div
        className="comp-sidebar-toggle"
        onClick={() => {
          dispatch(toggleSidebar());
        }}
      >
        <i
          className={`bi ${
            isOpen ? "bi-chevron-double-left" : "bi-chevron-double-right"
          }`}
        ></i>
      </div>
    </div>
  );
};
