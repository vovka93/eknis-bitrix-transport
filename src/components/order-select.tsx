import { useContext } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { DataContext } from "../dataContext";
import Field from "./field";

export default function OrderSelect(props: {
  name: string;
  label?: string;
  disabled?: boolean;
  value: any;
  items?: any[];
  viewMode?: boolean;
  onChange:
    | ((event: SelectChangeEvent<any>, child: React.ReactNode) => void)
    | undefined;
}) {
  const { fields, viewMode } = useContext(DataContext);
  const labelID = props.name + "-label";
  const field = fields[props.name];
  const source = props.items ? props.items : field.items;
  const labelText = props.label ? props.label : field.formLabel;
  const filteredFields = source.filter(
    (field: { ID: number; VALUE: string }) => field.ID == props.value
  );
  const fieldText = filteredFields[0]?.VALUE || "—";
  const printMode = props.viewMode || viewMode;
  return printMode ? (
    <Field label={labelText} value={fieldText} />
  ) : (
    <FormControl fullWidth variant="standard">
      <InputLabel id={labelID} size="small">
        {labelText}
      </InputLabel>
      <Select
        labelId={labelID}
        value={props.value}
        disabled={props?.disabled}
        label={labelText}
        onChange={props.onChange}
        size="small"
      >
        {source.map((field: { ID: number; VALUE: string }, _index: any) => (
          <MenuItem value={field.ID} key={field.ID}>
            {field.VALUE}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
