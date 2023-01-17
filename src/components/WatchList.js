import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Styled TableCell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: 'rgb(20, 20, 20)',
        color: 'rgb(220, 220, 220)',
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        backgroundColor: 'rgb(40, 40, 40)',
        color: 'rgb(200, 200, 200)',
    },
}));

// Styled TableRow
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'rgb(27, 27, 27)',
    },
    // Hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    // Add hover effect
    '&:hover': {
        backgroundColor: 'rgba(27, 27, 27, 0.4)',
        cursor: 'pointer',
    },

    height: "54px"
}));

// Custom TableCell for Name with Conditional Styling
const NameTableCell = styled(StyledTableCell)(({ value }) => ({
    color: value > 0 ? 'rgb(0, 200, 0)' : value < 0 ? 'rgb(200, 0, 0)' : 'inherit',
}));

const TradingViewWidget = (props) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedAsset, setSelectedAsset] = React.useState('');
    // Filter rows based on the search query and selected asset
    const filteredSymbols = props.symbols.filter(
        (row) =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedAsset === '' || row.assetName === selectedAsset)
    );

    // Get unique asset names for the dropdown menu
    const uniqueAssetNames = [...new Set(props.symbols.map(row => row.assetName))];

    return (
        <div className='WatchListBox'>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Search by Name"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        backgroundColor: 'antiquewhite',
                        borderRadius: '5px',
                        marginRight: 2,
                        flex: 1,
                        height: '56px', // Set consistent height
                    }}
                />
                <Select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    displayEmpty
                    sx={{
                        backgroundColor: 'antiquewhite',
                        borderRadius: '5px',
                        flex: 1,
                        height: '56px', // Set consistent height
                        '& .MuiSelect-select': { // Ensure the inner select box has full height
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }}
                >
                    <MenuItem value="">
                        <span>All Assets</span>
                    </MenuItem>
                    {uniqueAssetNames.map((assetName) => (
                        <MenuItem key={assetName} value={assetName}>
                            {assetName}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <TableContainer component={Paper} className="TableContainer">
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>AssetName</StyledTableCell>
                            <StyledTableCell>Value</StyledTableCell>
                            <StyledTableCell>Bid</StyledTableCell>
                            <StyledTableCell>Ask</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSymbols.map((row) => {
                            const index = props.symbols.indexOf(row);
                            return (
                                <StyledTableRow key={row.name}>
                                    <NameTableCell component="th" scope="row" value={row.value}  onClick={() => { console.log(row.code); props.setSelectedSymbol(row.code)}}>
                                        {row.name}
                                    </NameTableCell>
                                    <StyledTableCell>
                                        {row.assetName}
                                    </StyledTableCell>

                                    <StyledTableCell>{props.bid[index] ? ((props.bid[index] + props.ask[index]) / 2).toFixed(6) : "Closed"}</StyledTableCell>
                                    <StyledTableCell>{props.bid[index] ? props.bid[index].toFixed(6) : "Closed"}</StyledTableCell>
                                    <StyledTableCell>{props.ask[index] ? props.ask[index].toFixed(6) : "Closed"}</StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default TradingViewWidget;
