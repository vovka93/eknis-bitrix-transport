import { CircularProgress, Container, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useState } from 'react';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import uaLocale from "date-fns/locale/uk";
import Centered from "./centered";
import PrintForm from './printform';

export default function Report() {
  const [value, setValue] = useState<Date | null>(new Date());
  const [m, setM] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [json, setJson] = useState<any>(null);

  useEffect(() => {
    if (value) {
      setM(value.getMonth() + 1);
      setY(value.getUTCFullYear());
    }
  }, [value])

  useEffect(() => {
    if (m) {
      fetch(`https://bitrixapp.eknis.net/report/?m=${m}&y=${y}`).then(response => response.json())
        .then(json => {
          console.log(json)
          setJson(json)
        })
    }
  }, [m])

  function PrintTable() {
    let rows = [];
    let i = 1;
    const sortedByValue = Object.fromEntries(
      Object.entries(json).sort((a: any, b: any) => {
        return b[1][0] - a[1][0];
      })
    );
    for (const [key, value] of Object.entries(sortedByValue)) {
      let a: any = value;
      if (a[0] + a[1] < 10) continue;
      rows.push(<TableRow key={key}><TableCell>{i}</TableCell><TableCell>{key}</TableCell><TableCell align="center">{a[0]}</TableCell><TableCell align="center">{a[1]}</TableCell></TableRow>);
      i++;
    }
    return <>{rows}</>;
  }

  function sum(i = 0, anothers = false) {
    let s = 0;
    for (const [key, value] of Object.entries(json)) {
      let a: any = value;
      if (anothers) {
        if (a[0] + a[1] < 10) {
          s += a[i];
        }
      } else {
        s += a[i];
      }
    }
    return s;
  }

  return <>
    <Container maxWidth="xl">
      <Box mt={4}>
        <Box mt={2}>
          <Typography variant="h5" component="h5">
            Звіт по використанню транспорту
          </Typography>
        </Box>
        <Box mt={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uaLocale}>
            <DatePicker
              views={['year', 'month']}
              label="Місяць"
              value={value}
              onChange={(newValue) => {
                setJson(null);
                setValue(newValue);
              }}
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
          </LocalizationProvider>
          <Box mt={5}>
            {json ? <>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Відділ</TableCell>
                    <TableCell align="center">Кількість заявок (транспорт)</TableCell>
                    <TableCell align="center">Кількість заявок (Кур’єр)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <PrintTable />
                  <TableRow>
                    <TableCell colSpan={2} align="right">Інші відділи:</TableCell>
                    <TableCell align="center"><b>{sum(0, true)}</b></TableCell>
                    <TableCell align="center"><b>{sum(1, true)}</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} align="right">Всього:</TableCell>
                    <TableCell align="center"><b>{sum(0)}</b></TableCell>
                    <TableCell align="center"><b>{sum(1)}</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} align="right"></TableCell>
                    <TableCell colSpan={2} align="center"><b>{sum(0) + sum(1)}</b></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </> : <><CircularProgress /></>}
          </Box>
        </Box>
      </Box>
    </Container>
  </>
}
