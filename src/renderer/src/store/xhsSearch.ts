import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface XhsSearchState {
  enabled: boolean
  maxResults: number
}

const initialState: XhsSearchState = {
  enabled: false,
  maxResults: 20
}

const xhsSearchSlice = createSlice({
  name: 'xhsSearch',
  initialState,
  reducers: {
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload
    },
    setMaxResults: (state, action: PayloadAction<number>) => {
      state.maxResults = action.payload
    }
  }
})

export const {
  setEnabled,
  setMaxResults
} = xhsSearchSlice.actions

export default xhsSearchSlice.reducer
