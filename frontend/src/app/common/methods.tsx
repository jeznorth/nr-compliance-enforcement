import format from "date-fns/format";
import { Coordinates } from "../types/app/coordinate-type";
import COMPLAINT_TYPES from "../types/app/complaint-types";
import { ComplaintStatus } from "../types/app/code-tables/complaint-status";
import { from } from "linq-to-typescript";
import { Violation } from "../types/app/code-tables/violation";
import { Species } from "../types/app/code-tables/species";
import { NatureOfComplaint } from "../types/app/code-tables/nature-of-complaint";

type Coordinate = number[] | string[] | undefined;

export const getAvatarInitials = (input: string): string => {
  const tokens = input.split(" ");

  if (tokens && tokens.length >= 1) {
    let result = tokens.map((item) => {
      return item.charAt(0);
    });

    return result.join("");
  } else {
    return input.charAt(0);
  }
};

export const getFirstInitialAndLastName = (fullName: string): string => {
  const NOT_ASSIGNED = "Not Assigned";

  if (NOT_ASSIGNED === fullName) {
    return NOT_ASSIGNED;
  }

  // Split the full name into an array of words
  const words = fullName.trim().split(" ");

  if (words.length === 0) {
    // If there are no words, return an empty string
    return "";
  } else if (words.length === 1) {
    // If there is only one word, return the entire word as the last name
    return words[0];
  } else {
    // Extract the first initial and last name
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastName = words[words.length - 1];

    // Concatenate the first initial and last name with a space
    return `${firstInitial}. ${lastName}`;
  }
};

export const formatDate = (input: string | undefined): string => {
  if (!input) {
    return "";
  }

  return format(Date.parse(input), "yyyy-MM-dd");
};

export const formatTime = (input: string | undefined): string => {
  if (!input) {
    return "";
  }

  return format(Date.parse(input), "HH:mm");
};

export const formatDateTime = (input: string | undefined): string => {
  if (!input) {
    return "";
  }

  return format(Date.parse(input), "yyyy-MM-dd HH:mm:ss");
};

// given a filename and complaint identifier, inject the complaint identifier inbetween the file name and extension
export const injectComplaintIdentifierToFilename = (filename: string, complaintIdentifier: string): string => {
  // Find the last dot in the filename to separate the extension
  const lastDotIndex = filename.lastIndexOf('.');

  // If there's no dot, just append the complaintId at the end
  if (lastDotIndex === -1) {
      return (`${filename} ${complaintIdentifier}`);
  }

  const fileNameWithoutExtension = filename.substring(0, lastDotIndex);
  const fileExtension = filename.substring(lastDotIndex);

  // Otherwise, insert the complaintId before the extension
  return (`${fileNameWithoutExtension} ${complaintIdentifier}${fileExtension}`);
}

// Used to retrieve the coordinates in the decimal format
export const parseDecimalDegreesCoordinates = (
  coordinates: Coordinate,
): { lat: number; lng: number } => {
  if (!coordinates) {
    return { lat: 0, lng: 0 };
  }

  return { lat: +coordinates[0], lng: +coordinates[1] };
};

export const bcBoundaries = {
  minLatitude: 48.2513,
  maxLatitude: 60.0,
  minLongitude: -139.0596,
  maxLongitude: -114.0337,
};

// given coordinates, return true if within BC or false if not within BC
export const isWithinBC = (coordinates: Coordinate): boolean => {
  if (!coordinates) {
    return false;
  }

  const latitude = +coordinates[Coordinates.Latitude];
  const longitude = +coordinates[Coordinates.Longitude];

  return (
    latitude >= bcBoundaries.minLatitude &&
    latitude <= bcBoundaries.maxLatitude &&
    longitude >= bcBoundaries.minLongitude &&
    longitude <= bcBoundaries.maxLongitude
  );
};

export const parseCoordinates = (
  coordinates: Coordinate,
  coordinateType: Coordinates,
): number | string => {
  if (!coordinates) {
    return 0;
  }

  return coordinateType === Coordinates.Latitude
    ? coordinates[Coordinates.Latitude]
    : coordinates[Coordinates.Longitude];
};

export const getComplaintTypeFromUrl = (): number => {
  let p = new URLPattern({ pathname: "/complaints/:type" });
  let r = p.exec(window.location.href);

  if (r) {
    return r.pathname.groups.type === COMPLAINT_TYPES.HWCR ? 0 : 1;
  }

  return -1;
};

export const renderCoordinates = (
  coordinates: Coordinate,
  coordinateType: Coordinates,
): JSX.Element => {
  const result = parseCoordinates(coordinates, coordinateType);

  return result === 0 ? <>{"Not Provided"}</> : <>{result}</>;
};

export const applyStatusClass = (state: string): string => {
  switch (state.toLowerCase()) {
    case "open":
      return "comp-status-badge-open";
    case "closed":
      return "comp-status-badge-closed";
    default:
      return "";
  }
};

export const truncateString = (str: string, maxLength: number): string=> {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + '...'; // Adds an ellipsis to indicate truncation
  } else {
    return str;
  }
}

export const removeFile = (fileList: FileList, fileToRemove: File): File[] => {
  // Convert the FileList to an array
  const filesArray = Array.from(fileList);

  // Filter out the file you want to remove
  const updatedFilesArray = filesArray.filter(file => file !== fileToRemove);

  return updatedFilesArray;
}

export const getStatusByStatusCode = (code: string, codes: Array<ComplaintStatus>): string => { 
  if(from(codes).any(({complaintStatus}) => complaintStatus === code)){ 
    const selected = from(codes).first(({complaintStatus}) => complaintStatus === code)

    return selected.longDescription
  }

  return "";
}

export const getViolationByViolationCode = (code: string, codes: Array<Violation>): string => { 
  if(codes && from(codes).any(({violation}) => violation === code)){ 
    const selected = from(codes).first(({violation}) => violation === code);

    return selected.longDescription;
  }

  return ""
}

export const getSpeciesBySpeciesCode = (code: string, codes: Array<Species>): string => { 
  if(codes && from(codes).any(({species}) => species === code)){ 
    const selected = from(codes).first(({species}) => species === code);

    return selected.longDescription;
  }

  return ""
}

export const getNatureOfComplaintByNatureOfComplaintCode = (code: string, codes: Array<NatureOfComplaint>): string => { 
  if(codes && from(codes).any(({natureOfComplaint}) => natureOfComplaint === code)){ 
    const selected = from(codes).first(({natureOfComplaint}) => natureOfComplaint === code);

    return selected.longDescription;
  }

  return ""
}
