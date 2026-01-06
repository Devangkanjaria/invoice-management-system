import { createSlice } from '@reduxjs/toolkit'

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    list: []
  },
  reducers: {
    addInvoice: (state, action) => {
      state.list.unshift(action.payload)
    },

    updateInvoice: (state, action) => {
      const index = state.list.findIndex(i => i.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = action.payload
      }
    },

    deleteInvoice: (state, action) => {
      state.list = state.list.filter(i => i.id !== action.payload)
    }
  }
})

export const { addInvoice, updateInvoice, deleteInvoice } = invoiceSlice.actions
export default invoiceSlice.reducer
