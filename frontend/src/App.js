import './App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Card, Chip, Grid } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { Alert, AlertTitle, Snackbar } from '@mui/material';


// const instance = axios.create({
//   baseURL: "https://tl87crawler.herokuapp.com/"
// })
const instance = axios.create({
  baseURL: "http://localhost:4000"
})

const App = () => {
  const [loading, setLoading] = useState(true);
  const [TL87Data, setTL87Data] = useState([]);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const handleDataFetch = async() => {
      console.log("Start");
      if(localStorage.getItem("TL87Text") !== null) {
        console.log("From local storage");
        setTL87Data(JSON.parse(localStorage.getItem("TL87Text")));
      }
      else {
        console.log("From backend");
        await instance.get("/api/getText").then((res) => {
          setTL87Data(res.data);
          localStorage.setItem("TL87Text", JSON.stringify(res.data));
        }).catch((e) => console.log(e))
      }
      setLoading(false);
      console.log("End");
    }
    handleDataFetch();
  }, [])

  useEffect(() => {
    console.log(TL87Data);
    setRows(TL87Data.map((e, i) => createData(e.date, e.content, e.replies)));
  }, [TL87Data])

  const outerColumns = [
    { id: 'blank', label: "", width: "5%"},
    { id: 'date', label: <Card style={{ fontWeight: 700, fontSize: '18px', width: "40px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center"}}>??????</Card>, width: "15%"},
    {
      id: 'content',
      label: <Card style={{ fontWeight: 700, fontSize: '18px', width: "40px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>??????</Card>,
      width: "80%",
      format: (value) => value.toLocaleString('en-US'),
    },
  ];

  const innerColumns = [
    { id: 'user', label: <Card style={{ fontWeight: 700, fontSize: '16px', width: "52px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>?????????</Card>, width: "20%"},
    {
      id: 'content',
      label: <Card style={{ fontWeight: 700, fontSize: '16px', width: "40px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>??????</Card>,
      width: "80%",
      format: (value) => value.toLocaleString('en-US'),
    },
  ];
  
  const createData = (date, content, replies) => {
    return { date, content, replies };
  }
  
  const [sortby, setSortby] = useState('');

  useEffect(() => {
    let today = new Date();
    let date = ''.concat(
      today.getFullYear(), 
      (today.getMonth()+1) < 10 ? '0' + (today.getMonth()+1) : (today.getMonth()+1), 
      today.getDate() < 10 ? '0' + today.getDate() : today.getDate()
    );
    console.log(date);
    if(sortby === "??????????????????") {
      setRows(TL87Data.sort((a, b) => {
        return a.date.replace("?????? ", (date)*100).replace("?????? ", (date-1)*100).replace("?????? ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" ??????", "").replace(" ", "") - 
        b.date.replace("?????? ", (date)*100).replace("?????? ", (date-1)*100).replace("?????? ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" ??????", "").replace(" ", "");
      }).map((e, i) => createData(e.date, e.content, e.replies)));
    }
    else if(sortby === "??????????????????") {
      // console.log(sortby);
      setRows(TL87Data.sort((a, b) =>{ 
        return b.date.replace("?????? ", (date)*100).replace("?????? ", (date-1)*100).replace("?????? ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" ??????", "").replace(" ", "") - 
        a.date.replace("?????? ", (date)*100).replace("?????? ", (date-1)*100).replace("?????? ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" ??????", "").replace(" ", "");
      }).map((e, i) => createData(e.date, e.content, e.replies)));
    }
  }, [sortby])

  const SortSelection = () => {
    
    const handleChange = (event) => {
      setSortby(event.target.value);
    };

    
    return (
      <div>
        <FormControl variant="standard" sx={{ minWidth: 120, margin: "24px"}}>
          <InputLabel id="demo-simple-select-standard-label">??????</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={sortby}
            onChange={handleChange}
            label="Age"
          >
            <MenuItem value={"??????????????????"}>??????????????????</MenuItem>
            <MenuItem value={"??????????????????"}>??????????????????</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }

  const TL87Table = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };
    const CollapseRow = (props) => {
      const { row } = props;
      const [open, setOpen] = useState(false);
    
      return (
        <>
          <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
              {
                row.replies.length === 0 ? <></> : 
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              }
            </TableCell>
            <TableCell component="th" scope="row">
              {row.date}
            </TableCell>
            <TableCell>{row.content.split("<br>").map((eachContent, ec) => <div key={ec}>{eachContent}</div>)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0, background: "#CDCFD025" }} colSpan={6}>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 1}}>
                  <Table size="small" aria-label="purchases">
                    <TableHead>
                      <TableRow>
                        {innerColumns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ width: column.width }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row.replies.map((reply, ri) => 
                        <TableRow key={ri}>
                          <TableCell><Chip label={reply.user}></Chip></TableCell>
                          <TableCell>{reply.content}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      );
    }
  
    return (
      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        <Grid sx={{display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
          <SortSelection/>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={<div>???????????????</div>}
          />
        </Grid>
        <TableContainer sx={{ height: "700px", maxHeight: "700px" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {outerColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, i) => <CollapseRow key={i} row={row}/>)}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  const [successAlertIn, setSuccessAlertIn] = useState(false);
  const SuccessAlert = ({title, content}) => {
    return (
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center"}} open={successAlertIn} autoHideDuration={5000} onClose={() => setSuccessAlertIn(false)}>
        <Alert severity="success">
          <AlertTitle>{title}</AlertTitle>
          {content}
        </Alert>
      </Snackbar>
    )
  }
  const [buttonProgressing, setButtonProgressing] = useState(false);

  return (
    <>
      <SuccessAlert title={"????????????"} content={"??????????????????"}/>
      <Card sx={{width: "20%", margin: "auto", padding: "12px", fontWeight: 700, fontSize: "32px", marginTop: "24px", textAlign: "center", boxShadow: "2px 2px 20px #CDCFD0" }}>???????????????</Card>
      {/* <Card sx={{width: "10%", margin: "24px auto"}}>
        <Button disabled={TL87Data.length === 0} sx={{width: "100%", margin: "auto"}} onClick={async() => {
          localStorage.removeItem("TL87Text");
          setButtonProgressing(true);
          await instance.get("/api/deleteDB").then(() => {
            setSuccessAlertIn(true)
            setTL87Data([]);
            setButtonProgressing(false);
          }).catch();
        }}>
          <Box sx={{width: "50%", display: "flex", alignItems: "center", justifyContent: "space-around"}}>
            <div>????????????</div>
            { buttonProgressing ? <CircularProgress size={20}/> : <></> }
          </Box>
        </Button>
      </Card> */}
      <Card id="Table" sx={{width: "80%", minHeight: "250px", margin: "24px auto", display: "flex", alignItems: "center", justifyContent: "center"}}>
        { loading ? <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}><CircularProgress size={150}/></Box> : <TL87Table/>}
      </Card>
    </>
  );
}

export default App;
