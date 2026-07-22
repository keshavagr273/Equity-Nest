import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../../axios.config';

type UserDataType = {
  email: string;
  password: string;
};

// Login User
export const userLogin = createAsyncThunk(
  'auth/signin',
  async (userData: UserDataType) => {
    try {
      const res = await api.post('/signin', userData);
      // H-1 FIX: The server no longer sends a token in the JSON body.
      // Authentication is handled exclusively via HttpOnly cookie (set by server).
      // Removed localStorage.setItem('jwt', ...) — localStorage is XSS-accessible
      // and defeats the purpose of HttpOnly cookies.
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data.message);
    }
  }
);

// M-7 FIX: Removed the dead `oauthLogin` async thunk and its `OAuthDataType`.
// The thunk made no network calls and was never invoked — it just returned a
// hardcoded object. The /oauth page relies on WithAuth's getReq() to establish
// the session from the HttpOnly cookie set by the server redirect.

export interface initialStateInterface {
  name: string;
  isSignedIn: boolean;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: initialStateInterface = {
  name: '',
  isSignedIn: false,
  status: 'idle',
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    signin: (state, action) => {
      state.isSignedIn = action.payload?.isSignedIn;
    },

    signout: (state, action) => {
      state.isSignedIn = action.payload?.isSignedIn;
    },

    validateUser: (state, action) => {
      // Handle error case - don't update state if request failed
      if (action.payload?.error) {
        return;
      }
      state.isSignedIn = action.payload?.isSignedIn || false;
      // Also store the user's name if provided by /validate
      if (action.payload?.name) {
        state.name = action.payload.name;
      }
    },
  },

  extraReducers: (builder) => {
    // userLogin reducers
    builder.addCase(userLogin.pending, (state) => {
      state.status = 'loading';
    });

    builder.addCase(userLogin.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.isSignedIn = payload?.isSignedIn;
    });

    builder.addCase(userLogin.rejected, (state) => {
      state.status = 'failed';
    });
  },
});

export const { signin, signout, validateUser } = authSlice.actions;
export default authSlice;
