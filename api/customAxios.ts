import axios, { AxiosInstance } from 'axios';
import { AxiosError } from '@/interfaces/common';
import logger from '@/utils/logger';
import https from 'https';

const customAxios: AxiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    }),
});

customAxios.interceptors.request.use(config => {
    const { url, data, headers } = config;
    logger.debug('Sending request:', { url, data, headers });
    return config;
});

customAxios.interceptors.response.use(
    response => {
        logger.debug('Received response:', { url: response.config.url, response: response.data });
        return response;
    },
    error => {
        const err = error as Error & AxiosError;
        logger.error('API call failed:', 'response' in err && err.response ? err.response.data : err.message);
        return Promise.reject(new Error('Có lỗi xảy ra khi gọi API!'));
    }
);

export default customAxios;