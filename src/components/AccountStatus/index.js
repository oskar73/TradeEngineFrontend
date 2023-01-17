import React, { useState, useEffect } from 'react'
import { Typography } from '@mui/material'
import './index.css'
const AccountStatus = (props) => {
    return (
        <div className='account-status-container'>
            <Typography align='left' fontSize={'14px'} color={"#89898b"} >
                {props.title}
            </Typography>
            <Typography align='left' fontSize={'16px'} color={props.color || "white"}>
                {props.value}
            </Typography>
        </div>
    )
}

export default AccountStatus;