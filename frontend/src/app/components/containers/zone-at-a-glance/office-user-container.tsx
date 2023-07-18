import { FC  } from "react";
import { OfficerStats } from "../../../types/complaints/zone-at-a-glance-stats";

type Props = {
  hwcrOfficers: OfficerStats[],
  allegationOfficers: OfficerStats[],
}

export const OfficeUserContainer: FC<Props> = ({hwcrOfficers}) => {
  if(hwcrOfficers !== undefined && hwcrOfficers.length !== 0)
  {
    return (
        <>
            { 
                    hwcrOfficers.map((item) => {
                        return <div key={item.name} className="comp-zag-officer-container">{item.name + " " + item.name}</div>;
                    }) 
            }
        </>
    );
  }
  else
  {
    return <></>;
  }
};
