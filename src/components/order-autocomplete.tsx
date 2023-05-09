import {
  SyntheticEvent,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import { DataContext } from "../dataContext";
import Field from "./field";

export default function OrderAutocomplete(props: {
  name: string;
  value?: string;
  disabled?: boolean;
  type: "user" | "company" | "contact" | "car";
  label?: string;
  onChange: (id: string) => void;
  onCreateContact?: (contactName: string) => Promise<number>;
  onCreateCompany?: (companyName: string) => Promise<number>;
}) {
  const { fields, companies, users, contacts, cars, viewMode } =
    useContext(DataContext);
  const freeSolo = props.type == "contact";
  // const [options, setOptions] = useState<readonly any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const field = props.name ? fields[props.name] : undefined;
  const labelText = field ? field.formLabel : props.label;

  const filter = createFilterOptions<{
    label: string;
    id?: string;
    inputValue?: string;
  }>();

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    value: any | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    if (value && value.inputValue) {
      let val = value.inputValue;
      props.onCreateContact
        ? props.onCreateContact(val).then((id) => {
            setOptions([
              ...options,
              {
                id: String(id),
                label: val,
              },
            ]);
            props.onChange(String(id));
          })
        : void 0;
      props.onCreateCompany
        ? props.onCreateCompany(val).then((id) => {
            setOptions([
              ...options,
              {
                id: String(id),
                label: val,
              },
            ]);
            props.onChange(String(id));
          })
        : void 0;
    } else {
      props.onChange(details?.option.id);
    }
  };

  useEffect(() => {
    if (props.type == "company") {
      setOptions(companies);
    }
    if (props.type == "user") {
      setOptions(users);
    }
    if (props.type == "contact") {
      setOptions(contacts);
    }
    if (props.type == "car") {
      setOptions(cars);
    }
  }, []);

  return viewMode ? (
    <Field
      label={labelText}
      value={options.find((option) => option.id === props.value)?.label || null}
    />
  ) : (
    <Autocomplete
      value={options.find((option) => option.id === props.value) || null}
      options={options}
      onChange={handleChange}
      disabled={props?.disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        );
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;
        const isExisting = options.some(
          (option) => inputValue === option.label
        );
        if (inputValue !== "" && !isExisting && props.type == "contact") {
          filtered.push({
            inputValue,
            label: `Створити контакт "${inputValue}"`,
            id: String(-1),
          });
        }
        if (inputValue !== "" && !isExisting && props.type == "company") {
          filtered.push({
            inputValue,
            label: `Створити компанію "${inputValue}"`,
            id: String(-1),
          });
        }
        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={labelText}
          size="small"
          variant="standard"
        />
      )}
    />
  );
}
