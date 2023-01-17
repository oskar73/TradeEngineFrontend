import React,{useState, useEffect} from 'react'
import AccountStatus from '../../../components/AccountStatus'
import { Hidden } from '@mui/material'
const StatusBar = (props) => {
    const styles = {
        container: {
            width: '-webkit-fill-available',
            display: 'flex',
            height: '48px',
            borderBottom: '1px solid #1b1b1f',
            justifyContent: 'right'
        }
    }
    return (
        <div style={styles.container}>
            <AccountStatus title="BALANCE" value={props.balance}/>
            <AccountStatus title="Equity" value={(Number(props.balance) + Number(props.equity)).toFixed(2)}/>
            <AccountStatus title="PROFIT & LOSS" value={Number(props.equity).toFixed(2)} color={Number(props.equity) > 0 ? "#00ff00": (Number(props.equity) < 0 ?"#ff0000" : "")}/>
            <AccountStatus title="MARGIN USED" value={Number(props.marginUsed).toFixed(2)}/>
            <AccountStatus title="MARGIN AVAILABLE" value={Number(props.marginAvailable).toFixed(2)}/>
            {/* <AccountStatus title="MARGIN LEVEL" value={props.margin_level}/> */}
        </div>
    )
}

export default StatusBar;