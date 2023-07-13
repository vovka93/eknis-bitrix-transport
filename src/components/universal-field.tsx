import {
  useContext,
  useCallback,
  useState,
  useEffect,
  SyntheticEvent,
} from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Order, OrderKeys } from "../types";
import { DataContext } from "../dataContext";
import { GridEditBooleanCellProps } from "@mui/x-data-grid";
import { FieldNames } from "../consts";

export default function UniversalField(props: {
  name: OrderKeys;
  value?: string | boolean;
  isNext?: boolean;
  label?: string;
  items?: any[];
  type?: "company" | "user" | "contact" | "car" | "phone" | "double";
  options?: any[];
  optionsNext?: any[];
  disabled?: boolean;
  multiline?: boolean;
  text?: boolean;
  viewMode?: boolean;
  noLabel?: boolean;
  onChange?: (value: Order) => void;
  onCreate?: (name: string) => Promise<number>;
}) {
  const [value, setValue] = useState<string | boolean>(props.value ?? "");
  const [options, setOptions] = useState<any[]>(props.options ?? []);
  const { fields, viewMode } = useContext(DataContext);
  const [open, setOpen] = useState(false);
  const field = fields[FieldNames[props.name as OrderKeys] as string];
  const type = field.type;
  const items = props.items ? props.items : field.items ?? [];
  const label = props.label || field.formLabel;
  const labelID = props.name + "-label";
  const printMode = props.viewMode || viewMode;

  const filter = createFilterOptions<{
    label: string;
    id?: string;
    inputValue?: string;
  }>();

  const handleChange = (e: any) => {
    if (props.onChange) {
      let val: string = e.target.value;
      let target = e.target as EventTarget & HTMLInputElement;
      let newValue: string | boolean = val;
      if (type == "boolean") {
        newValue = target.checked;
      }
      if (type == "double" || props.type == "double") {
        newValue = val
          .replace(
            /^([^.]*\.)(.*)$/,
            function (_a: unknown, b: string, c: string) {
              return b + c.replace(/\./g, "");
            }
          )
          .replace(/[^\d.]/g, "");
      }
      if (props.type === "phone") {
        newValue = val.replace(/[^\d+]/g, "");
        if (newValue.length < 4) {
          newValue = newValue || "+380";
        }
      }
      props.onChange({ [props.name]: newValue });
      setValue(newValue);
    }
  };

  const handleAutocomplete = (
    event: SyntheticEvent<Element, Event>,
    value: any | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    if (value && value.inputValue) {
      let val = value.inputValue;
      props.onCreate
        ? props.onCreate(val).then((iid) => {
            let id = String(iid);
            const newOptions = [
              ...options,
              {
                id,
                label: val,
              },
            ];
            setOptions(newOptions);
            if (props.onChange) {
              setValue(id);
              props.onChange({ [props.name]: id });
            }
          })
        : void 0;
    } else {
      if (props.onChange) {
        let id = details?.option.id;
        setValue(id);
        props.onChange({ [props.name]: id });
      }
    }
  };

  useEffect(() => {
    let val = field?.settings?.DEFAULT_VALUE;
    if (val) {
      setValue(val);
    }
  }, [field?.settings?.DEFAULT_VALUE]);

  useEffect(() => {
    if (typeof props.value !== "undefined") {
      if (
        props.options &&
        !props.options.find((element) => element.id == props.value) &&
        Array.isArray(props.optionsNext) &&
        props.optionsNext.length
      ) {
        setOptions(props.optionsNext || []);
      }
      setValue(props.value);
    }
  }, [props?.value]);

  useEffect(() => {
    if (props?.isNext === true) {
      setOptions(props.optionsNext || []);
      setOpen(true);
    }
  }, [props?.isNext]);

  function getPrintValue(value: string | boolean) {
    if (type == "enumeration") {
      let filteredFields = items.filter(
        (field: { ID: number; VALUE: string }) => String(field.ID) == value
      );
      return filteredFields[0]?.VALUE || "—";
    }
    if (type == "employee" || type == "crm") {
      return options.find((option) => option.id === value)?.label || "—";
    }
    return value ? value : "—";
  }

  const renderInput = (isLabel = true) => {
    switch (type) {
      case "employee":
      case "crm":
        return (
          <>
            <Autocomplete
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              value={options.find((option) => option.id === value) || null}
              options={options.sort((a, b) => {
                return a.id - b.id || a.label.localeCompare(b.label);
              })}
              onChange={handleAutocomplete}
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
                if (
                  inputValue !== "" &&
                  !isExisting &&
                  type == "crm" &&
                  props.onCreate
                ) {
                  let entity =
                    props.type == "contact"
                      ? "контакт"
                      : props.type == "company"
                      ? "компанію"
                      : "";
                  filtered.push({
                    inputValue,
                    label: `Створити ${entity} "${inputValue}"`,
                    id: String(-1),
                  });
                }
                return filtered;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  size="small"
                  variant="standard"
                />
              )}
            />
          </>
        );
      case "enumeration":
        return (
          <FormControl fullWidth variant="standard">
            <InputLabel id={labelID} size="small">
              {label}
            </InputLabel>
            <Select
              {...{ label }}
              labelId={labelID}
              value={value}
              disabled={props?.disabled}
              onChange={handleChange}
              size="small"
            >
              {items.map((item: { ID: number; VALUE: string }, _index: any) => (
                <MenuItem value={item.ID} key={item.ID}>
                  {item.VALUE}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "boolean":
        if (isLabel) {
          return (
            <FormControlLabel
              sx={{
                marginLeft: 0,
              }}
              control={
                <Switch
                  color="primary"
                  size="small"
                  disabled={props?.disabled}
                  checked={Boolean(value)}
                  onChange={handleChange}
                />
              }
              label={label + " "}
              labelPlacement="start"
            />
          );
        } else {
          return (
            <Switch
              color="primary"
              size="small"
              disabled={props?.disabled}
              checked={Boolean(value)}
              onChange={handleChange}
            />
          );
        }
      default:
        return (
          <TextField
            {...{ label }}
            {...{ value }}
            fullWidth
            size="small"
            variant="standard"
            multiline={props?.multiline}
            disabled={props?.disabled}
            InputProps={{
              autoComplete: "none",
              readOnly: Boolean(printMode),
            }}
            onChange={handleChange}
          />
        );
    }
  };

  const isUrgent = ["isUrgent"].includes(props.name);

  return (
    <>
      {!printMode && !isUrgent && !props.text ? (
        <>{renderInput()}</>
      ) : (
        <>
          {type != "boolean" ? (
            <>
              {!props.text ? (
                <TextField
                  label={props.label == "-" ? "" : label}
                  value={getPrintValue(value)}
                  fullWidth={true}
                  size="small"
                  variant="standard"
                  multiline={props?.multiline}
                  InputProps={{ disableUnderline: true }}
                />
              ) : (
                <Typography>{getPrintValue(value)}</Typography>
              )}
            </>
          ) : (
            <>
              {["isBack", "alwaysDriver"].includes(props.name) ? (
                <>
                  {value && (
                    <Typography variant="h6" component="b">
                      <u>{label}</u>
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  {isUrgent ? (
                    <>
                      <Typography variant="h5" component="b" color={"error"}>
                        <u>{label}</u>
                        {!printMode && renderInput(false)}
                      </Typography>
                    </>
                  ) : (
                    <Typography>{label}</Typography>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
