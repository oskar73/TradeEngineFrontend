import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import StatusBar from './StatusBar';
import PositionsTable from './PositionsTable';
import RealPositionsTable from './RealPositionsTable';
import axiosInstance from "../../../utils/axios";
import { Modal } from '@mui/material';
import global, { symbols } from '../../../utils/global';
import { fetchSymbols, fetchTradingDatas } from '../../../utils/api';
import "./DropdownMenu.css";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const AntTabs = styled(Tabs)({
    borderBottom: '1px solid #1b1b1f',
    '& .MuiTabs-indicator': {
        backgroundColor: 'white',
        height: '1px'
    },
});

const AntTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
    textTransform: 'none',
    minWidth: 0,
    [theme.breakpoints.up('sm')]: {
        minWidth: 0,
    },
    fontWeight: theme.typography.fontWeightMedium,
    marginRight: theme.spacing(1),
    fontSize: '12px',
    color: '#89898b',
    fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
        color: 'white',
        opacity: 1,
    },
    '&.Mui-selected': {
        color: 'white',
        fontWeight: theme.typography.fontWeightMedium,
    },
    '&.Mui-focusVisible': {
        backgroundColor: '#101013',
    },
}));

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function AccountManagement(props) {
    const [value, setValue] = React.useState(0);
    const [commissions, setCommissions] = React.useState(1);

    const [updateProfit, setUpdateProfit] = React.useState(0);
    const [updateLoss, setUpdateLoss] = React.useState(0);


    const [amount, setAmount] = React.useState(0);

    const [openPositionsData, setOpenPositionsData] = React.useState([]);
    const [realPositionsData, setRealPositionsData] = React.useState([]);

    const [profit, setProfit] = React.useState(0);
    const [marginUsed, setMarginUsed] = React.useState(0);
    const [marginAvailable, setMarginAvailable] = React.useState(0);
    const [equity, setEquity] = React.useState(10000);

    const [updateModalVisible, setUpdateModalVisible] = React.useState(false);
    const [updateID, setUpdateID] = React.useState(0);


    const positionInterval = React.useRef(null);

    const [activeGroup, setActiveGroup] = React.useState(null);
    const [menuVisible, setMenuVisible] = React.useState(false);
    const groupedSymbols = props.symbols.reduce((acc, value) => {
        const group = acc.find(g => g.assetName === value.assetName);
        if (group) {
            group.symbols.push(value);
        } else {
            acc.push({ assetName: value.assetName, symbols: [value] });
        }
        return acc;
    }, []);

    const handleMouseEnter = () => {
        setMenuVisible(true);
    };

    const handleMouseLeave = () => {
        setMenuVisible(false);
        setActiveGroup(null); // Reset active group on leave  
    };

    React.useEffect(() => {
        try {
            const fetchTrading = async () => {
                const datas = await fetchTradingDatas();
                setCommissions(datas.commissions);
            }
            fetchTrading();
            const Symbols_total = props.symbols.map(item => item.code);
            const Symbols = processArrayInChunks(Symbols_total, 10);
            if (Symbols.length > 1) {
                const ws0 = new WebSocket('wss://marketdata.tradermade.com/feedadv');
                getDataWithSocket(ws0, "wsow9cDSReUiI9PHl52g", Symbols[0]);
            }
            if (Symbols.length > 1) {
                const ws1 = new WebSocket('wss://marketdata.tradermade.com/feedadv');
                getDataWithSocket(ws1, "ws9htyczx8lCQXC1Q9fg", Symbols[1]);
            }
            if (Symbols.length > 2) {
                const ws2 = new WebSocket('wss://marketdata.tradermade.com/feedadv');
                getDataWithSocket(ws2, "wswHy5A3seTPSQynoGwg", Symbols[2]);
            }

            positionInterval.current = setInterval(getAllPositions, 3000);

        } catch (error) {
            console.log("AccountManagement : ", error);
        }

    }, [props.symbols]);

    const getAllPositions = () => {
        axiosInstance.post("/getAllPositions")
            .then((res) => {
                if (res.data.state) {
                    if (res.data.state != "Your balance is not enough") {
                        props.setIsAuth(false);
                        localStorage.removeItem("tradeToken");
                        window.location.reload();
                    }
                    return;
                }
                // console.log("data : ", res.data);
                const { positions, realPositions, margin, balance } = res.data;
                setOpenPositionsData(positions);
                setRealPositionsData(realPositions);
                props.setBalance(balance);
                setMarginUsed(margin);
                setMarginAvailable(balance - margin);
            })
            .catch((err) => {
                console.log("Axios Error with ", err);
                props.setIsAuth(false);
                localStorage.removeItem("tradeToken");
                window.location.reload();
            })
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleOption = (option) => {
        const data = {
            amount: amount,
            symbol: props.selectedSymbol,
            option: option,
        }
        axiosInstance.post("/createPosition", data)
            .then((res) => {
                if (res.data.state) {
                    if (res.data.state != "Your balance is not enough") {
                        props.setIsAuth(false);
                        localStorage.removeItem("tradeToken");
                        window.location.reload();
                    }
                    return;
                }
                // console.log("data : ", res.data);
                const { positions, balance, margin } = res.data;
                setOpenPositionsData(positions);
                props.setBalance(balance);
                setMarginUsed(margin);
                setMarginAvailable(balance - margin);
            })
            .catch((err) => {
                console.log("Axios Error with ", err);
            })
    };

    const handleCancel = (id) => {
        axiosInstance.post("/cancelPosition", { id })
            .then((res) => {
                // console.log("data : ", res.data);
                const { positions, realPositions, margin, balance } = res.data;
                setOpenPositionsData(positions);
                setRealPositionsData(realPositions);
                props.setBalance(balance);
                setMarginUsed(margin);
                setMarginAvailable(balance - margin);
            })
            .catch((err) => {
                console.log("Axios Error with ", err);
            })
    }

    const handleUpdate = (id) => {
        setUpdateModalVisible(true);
        setUpdateID(id);
    }

    const handleModalClose = () => {
        setUpdateModalVisible(false);
    }

    const handleUpdateSave = () => {
        axiosInstance.post("/updatePosition", { updateID, updateProfit, updateLoss })
            .then((res) => {
                // console.log("data : ", res.data);
                const { positions } = res.data;
                setOpenPositionsData(positions);
            })
            .catch((err) => {
                console.log("Axios Error with ", err);
            })
        setUpdateModalVisible(false);
    }

    const getDataWithSocket = (ws, key, data) => {
        console.log(data);
        ws.onopen = function open() {
            ws.send(`{"userKey":"${key}", "symbol":"${data}"}`);
        };

        ws.onclose = function () {
            const reconnectInterval = 5000;
            console.log('socket close : will reconnect in ' + reconnectInterval);
            setTimeout(() => getDataWithSocket(ws, key, data), reconnectInterval); // Pass the correct arguments
        };

        ws.onmessage = (event) => {
            try {
                if (event.data === "User Key Used to many times") {
                    console.log("User Key Used to many times");
                    return;
                }
                if (event.data !== "Connected") {
                    try {
                        const data = JSON.parse(event.data);
                        updateAsk(props.symbols.map(item => item.code).indexOf(data.symbol), data.ask);
                        updateBid(props.symbols.map(item => item.code).indexOf(data.symbol), data.bid);
                    } catch (error) {
                        console.log(event.data);
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    };


    const processArrayInChunks = (arr, chunkSize) => {
        const result = [];

        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            result.push(chunk.join(','));
        }

        return result;
    }

    const updateBid = (index, newValue) => {
        props.setBid(prevBids => {
            const newBids = [...prevBids];
            newBids[index] = newValue;
            return newBids;
        });
    };

    const updateAsk = (index, newValue) => {
        props.setAsk(prevAsks => {
            const newAsks = [...prevAsks];
            newAsks[index] = newValue;
            return newAsks;
        });
    };

    return (
        <>
            <Box my={0} sx={{ width: '100%', marginBottom: '0px', bgcolor: '#101013', height: '100%', borderRadius: '10px' }}>
                <div style={{ display: 'flex' }}>
                    <AntTabs value={value} onChange={handleChange} aria-label="ant example">
                        <AntTab label="Positions" />
                        <AntTab label="Real Positions" />
                    </AntTabs>
                    <StatusBar
                        balance={props.balance}
                        equity={equity}
                        profit={profit}
                        marginUsed={marginUsed}
                        marginAvailable={marginAvailable}
                    />
                </div>
                <div className='trading-setting'>
                    {/* <span className='font-white'>Symbol : </span> */}
                    <div className="dropdown" onMouseLeave={handleMouseLeave}>
                        <button
                            className="dropbtn"
                            onMouseEnter={handleMouseEnter}
                            onClick={() => setMenuVisible(prev => !prev)}
                        >
                            {props.selectedSymbol=="" ? "Select Symbol" : props.selectedSymbol}
                        </button>
                        {menuVisible && (
                            <div className="dropdown-content" onMouseEnter={handleMouseEnter}>
                                {groupedSymbols.map(group => (
                                    <div
                                        key={group.assetName}
                                        onMouseEnter={() => setActiveGroup(group.assetName)}
                                        onMouseLeave={() => setActiveGroup(null)}
                                        className="dropdown-group"
                                    >
                                        <div className={`group-label ${activeGroup === group.assetName ? 'active' : ''}`}>
                                            {group.assetName} <span className="arrow">{activeGroup === group.assetName ? '->' : ''}</span>
                                        </div>
                                        {activeGroup === group.assetName && (
                                            <div className="child-menu">
                                                {group.symbols.map(symbol => (
                                                    <div
                                                        key={symbol.code}
                                                        onClick={() => {
                                                            props.setSelectedSymbol(symbol.code);
                                                            setMenuVisible(false); // Close the menu on selection  
                                                        }}
                                                        className="child-item"
                                                    >
                                                        {symbol.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <input value={`Bid: ${props.bid[props.symbols.map(item => item.code).indexOf(props.selectedSymbol)] ? props.bid[props.symbols.map(item => item.code).indexOf(props.selectedSymbol)] : "Select Symbol"}`} className='trading-leverage' readOnly />
                    <button onClick={() => { handleOption(true) }} className='trading-sell' disabled={props.selectedSymbol==""}>Sell</button>
                    <input defaultValue={amount} className='trading-amount' onChange={(e) => setAmount(e.target.value)} />
                    <button onClick={() => { handleOption(false) }} className='trading-buy' disabled={props.selectedSymbol==""}>Buy</button>
                    <input value={`Ask: ${props.ask[props.symbols.map(item => item.code).indexOf(props.selectedSymbol)] ? props.ask[props.symbols.map(item => item.code).indexOf(props.selectedSymbol)] : "Select Symbol"}`} className='trading-leverage' readOnly />
                </div>
                <CustomTabPanel value={value} index={0}>
                    <PositionsTable
                        positionData={openPositionsData}
                        symbols={props.symbols}
                        commissions={commissions}
                        bids={props.bid}
                        asks={props.ask}
                        setEquity={setEquity}
                        handleCancel={handleCancel}
                        handleUpdate={handleUpdate}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <RealPositionsTable
                        positionData={realPositionsData}
                    />
                </CustomTabPanel>
            </Box>
            <Modal
                open={updateModalVisible}
                onClose={handleModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ width: '20%', margin: '10% auto', bgcolor: '#dddddd', height: '200px', borderRadius: '10px', padding: '10px 0 0 0' }}>

                    <TextField label="Take Profit" variant="standard" onChange={(e) => setUpdateProfit(e.target.value)} style={{ margin: 'auto', display: "block", width: "60%" }} />
                    <TextField label="Stop Loss" variant="standard" onChange={(e) => setUpdateLoss(e.target.value)} style={{ margin: 'auto', display: "block", width: "60%" }} />
                    <div style={{ margin: '15px auto', width: '60%' }}>
                        <Button variant="outlined" onClick={handleUpdateSave} style={{ margin: '5px 10px' }}>Save</Button>
                        <Button variant="outlined" onClick={handleModalClose} style={{ margin: '5px 10px' }}>Close</Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}
