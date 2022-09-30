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
import { Card, Chip, Grid } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const instance = axios.create({
  baseURL: "http://localhost:4000"
})

const App = () => {
  const [loading, setLoading] = useState(true);
  const [TL87Data, setTL87Data] = useState([]);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const handleDataFetch = async() => {
      if(localStorage.getItem("TL87Text") !== null) {
        setTL87Data(JSON.parse(localStorage.getItem("TL87Text")));
        setLoading(false);
      }
      else {
        try{
          await instance.get("/api/getText").then((res) => {
            setTL87Data(res.data);
            setLoading(false);
            localStorage.setItem("TL87Text", JSON.stringify(res.data));
          })
        } 
        catch(e){}
      }
    }
    handleDataFetch();
  }, [])

  useEffect(() => {
    // console.log(TL87Data);
    setRows(TL87Data.map((e, i) => createData(e.date, e.content, e.replies)));
  }, [TL87Data])

  const outerColumns = [
    { id: 'blank', label: "", width: "5%"},
    { id: 'date', label: <Card style={{ fontWeight: 700, fontSize: '18px', width: "40px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center"}}>日期</Card>, width: "15%"},
    {
      id: 'content',
      label: <Card style={{ fontWeight: 700, fontSize: '18px', width: "40px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>內容</Card>,
      width: "80%",
      format: (value) => value.toLocaleString('en-US'),
    },
  ];

  const innerColumns = [
    { id: 'user', label: <Card style={{ fontWeight: 700, fontSize: '16px', width: "52px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>留言者</Card>, width: "20%"},
    {
      id: 'content',
      label: <Card style={{ fontWeight: 700, fontSize: '16px', width: "40px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>內容</Card>,
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
    if(sortby === "日期（正序）") {
      setRows(TL87Data.sort((a, b) => {
        return a.date.replace("今天 ", (date)*100).replace("昨天 ", (date-1)*100).replace("前天 ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" 編輯", "").replace(" ", "") - 
        b.date.replace("今天 ", (date)*100).replace("昨天 ", (date-1)*100).replace("前天 ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" 編輯", "").replace(" ", "");
      }).map((e, i) => createData(e.date, e.content, e.replies)));
    }
    else if(sortby === "日期（倒序）") {
      // console.log(sortby);
      setRows(TL87Data.sort((a, b) =>{ 
        return b.date.replace("今天 ", (date)*100).replace("昨天 ", (date-1)*100).replace("前天 ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" 編輯", "").replace(" ", "") - 
        a.date.replace("今天 ", (date)*100).replace("昨天 ", (date-1)*100).replace("前天 ", (date-2)*100).replace(/[\p{P}\p{S}]/gu, '').replace(" 編輯", "").replace(" ", "");
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
          <InputLabel id="demo-simple-select-standard-label">排序</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={sortby}
            onChange={handleChange}
            label="Age"
          >
            <MenuItem value={"日期（正序）"}>日期（正序）</MenuItem>
            <MenuItem value={"日期（倒序）"}>日期（倒序）</MenuItem>
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
            labelRowsPerPage={<div>當前顯示：</div>}
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

  return (
    <>
      <Card sx={{width: "20%", margin: "auto", padding: "12px", fontWeight: 700, fontSize: "32px", marginTop: "24px", textAlign: "center", boxShadow: "2px 2px 20px #CDCFD0" }}>邊緣人語錄</Card>
      <Card id="Table" sx={{width: "80%", minHeight: "250px", margin: "24px auto", display: "flex", alignItems: "center", justifyContent: "center"}}>
        { loading ? <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}><CircularProgress size={150}/></Box> : <TL87Table/>}
      </Card>
    </>
  );
}

export default App;
