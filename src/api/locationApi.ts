import axios, { AxiosResponse } from 'axios';


const BASE_ENDPOINT = 'https://nominatim.openstreetmap.org';
const reverseGeocode = async (lat: string, lon: string): Promise<any> => {
    const url = `${BASE_ENDPOINT}/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
        const response: AxiosResponse<any> = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching location data:', error);
        throw new Error('Failed to fetch location data');
    }
}

export default reverseGeocode;