import axios from "axios"
import config from "../config"

export const fetchSymbols = async () => {
    const token = localStorage.getItem('tradeToken');
    try {
        const response = await axios.get(`${config.BackendEndpoint}/getSymbols`, {
            headers: {
                Authorization: token? token: ""
            }
        })
        return response.data;
    } catch (error) {
        return error;
    }
}

export const fetchTradingDatas = async () => {
    const token = localStorage.getItem('tradeToken');
    try {
        const response = await axios.get(`${config.BackendEndpoint}/getTradingDatas`, {
            headers: {
                Authorization: token ? token : ""
            }
        })
        return response.data;
    } catch (err) {
        return err;
    }
}