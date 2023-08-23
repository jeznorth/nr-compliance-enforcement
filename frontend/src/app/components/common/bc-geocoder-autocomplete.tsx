import { FC, useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  getComplaintLocation,
  selectComplaintLocation,
} from "../../store/reducers/complaints";

interface Props {
  value?: string;
  id?: string;
  maxResults: number;
}

interface AddressOption {
  value: string;
  label: string;
}

/**
 *  Component that uses the BC Geocoder to autocomplete address input.
 */
export const BCGeocoderAutocomplete: FC<Props> = ({
  value,
  id,
  maxResults,
}) => {
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
  const [inputValue, setInputValue] = useState<string>(`${value ?? ""}`);

  const handleInputChange = (inputValue: string) => {
    setInputValue(inputValue);
  };

  const dispatch = useAppDispatch();
  const complaintLocation = useAppSelector(selectComplaintLocation);

  useEffect(() => {
    const fetchAddresses = async (inputValue: string) => {
      dispatch(getComplaintLocation(`${inputValue}`));

      try {
        if (complaintLocation) {
          if (complaintLocation.features.length > 0) {
            const options = complaintLocation.features.map((feature: any) => ({
              value: feature.properties.fullAddress,
              label: feature.properties.fullAddress,
            }));
            if (options) {
              setAddressOptions(options);
            }
          } else {
            console.log("Feature length 0");
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses(inputValue);
  }, [inputValue, maxResults]);

  return (
    <CreatableSelect
      options={addressOptions}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      isClearable
      classNamePrefix="comp-select"
      placeholder="Search for an address"
      id={id}
      formatCreateLabel={() => undefined}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
    />
  );
};
