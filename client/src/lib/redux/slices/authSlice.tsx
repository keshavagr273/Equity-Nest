import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../../axios.config';

type UserDataType = {
  email: string;
  password: string;
};

type OAuthDataType = {
  token: string;
};

// Login User
export const userLogin = createAsyncThunk(
  'auth/signin',
  async (userData: UserDataType) => {
    try {
      const res = await api.post('/signin', userData);
      let data = await res.data;

      if (data) {
        return data;
      }
    } catch (error: any) {
      // console.log('🚀 userLogin ~ error:', error.response?.data.message);
      throw new Error(error.response?.data.message);
    }
  }
);

// OAuth Login User
export const oauthLogin = createAsyncThunk(
  'auth/oauth',
  async (oauthData: OAuthDataType) => {
    try {
      // For OAuth, we just need to set the token and mark as signed in
      return { isSignedIn: true, token: oauthData.token };
    } catch (error: any) {
      throw new Error('OAuth login failed');
    }
  }
);

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
      state.isSignedIn = action.payload?.isSignedIn;
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

    // oauthLogin reducers
    builder.addCase(oauthLogin.pending, (state) => {
      state.status = 'loading';
    });

    builder.addCase(oauthLogin.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.isSignedIn = payload?.isSignedIn;
    });

    builder.addCase(oauthLogin.rejected, (state) => {
      state.status = 'failed';
    });
  },
});

export let { signin, signout, validateUser } = authSlice.actions;
export default authSlice;
