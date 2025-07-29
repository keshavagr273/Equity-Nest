import api from '../../../axios.config';

export const postData = async <T>(
  url: string,
  userData: Record<string, any>
) => {
  try {
    const res = await api.post<T>(url, userData);
    const data = await res.data;

    return data;
  } catch (error: any) {
    return { error: error?.response?.data };
  }
};

export const getReq = async () => {
  try {
    console.log('🚀 getReq: Making validation request...');
    console.log('🚀 getReq: Cookies:', document.cookie);
    
    const req = await api.get('/validate');
    console.log('🚀 getReq: Response:', req.data);
    return req.data;
  } catch (error: any) {
    console.log('🚀 getReq: Error:', error?.response?.data);
    return { error: error?.response?.data };
  }
};

export const searchStock = async (symbol: string) => {
  try {
    const req = await api.get(`/stockdata/search`, {
      params: {
        symbol: symbol,
      },
    });
    return req.data;
  } catch (error: any) {
    return { error: error?.response?.data };
  }
};
