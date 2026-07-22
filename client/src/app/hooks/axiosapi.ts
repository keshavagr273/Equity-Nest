import api from '../../../axios.config';

export const postData = async <T>(
  url: string,
  userData: Record<string, any>
) => {
  try {
    const res = await api.post<T>(url, userData);
    return res.data;
  } catch (error: any) {
    return { error: error?.response?.data };
  }
};

export const getReq = async () => {
  try {
    // H-5 FIX: Removed console.log statements that were printing
    // document.cookie (sensitive) and API response data on every validation call.
    const req = await api.get('/validate');
    return req.data;
  } catch (error: any) {
    // If it's a 401, that's expected for unauthenticated users — return the data
    if (error?.response?.status === 401 && error?.response?.data) {
      return error.response.data;
    }
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
