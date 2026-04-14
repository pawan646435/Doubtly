// /home/pawankumar/Desktop/Doubtly/frontend/src/context/DoubtContext.jsx
// Global state management for the Doubtly application

import { createContext, useContext, useReducer, useCallback } from 'react';
import * as api from '../services/api';

const DoubtContext = createContext();

const getDoubtId = (doubt) => doubt?._id || doubt?.id || null;

const normalizeDoubt = (doubt) => {
  if (!doubt) return null;

  const resolvedId = getDoubtId(doubt);
  return resolvedId
    ? { ...doubt, _id: resolvedId, id: resolvedId }
    : { ...doubt };
};

// ─── Action Types ─────────────────────────────────────────────────────────────
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SOLVING: 'SET_SOLVING',
  SET_CURRENT_DOUBT: 'SET_CURRENT_DOUBT',
  SET_HISTORY: 'SET_HISTORY',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  REMOVE_FROM_HISTORY: 'REMOVE_FROM_HISTORY',
  ADD_FOLLOW_UP: 'ADD_FOLLOW_UP',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_CURRENT: 'CLEAR_CURRENT',
  SET_FOLLOW_UP_LOADING: 'SET_FOLLOW_UP_LOADING',
};

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  currentDoubt: null,
  history: [],
  pagination: null,
  loading: false,
  solving: false,
  followUpLoading: false,
  error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const doubtReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_SOLVING:
      return { ...state, solving: action.payload, error: null };
    case ACTIONS.SET_CURRENT_DOUBT:
      return { ...state, currentDoubt: action.payload, solving: false };
    case ACTIONS.SET_HISTORY:
      return {
        ...state,
        history: action.payload.doubts,
        pagination: action.payload.pagination,
        loading: false,
      };
    case ACTIONS.ADD_TO_HISTORY:
      return {
        ...state,
        history: [
          action.payload,
          ...state.history.filter((d) => getDoubtId(d) !== getDoubtId(action.payload)),
        ],
      };
    case ACTIONS.REMOVE_FROM_HISTORY:
      return {
        ...state,
        history: state.history.filter((d) => getDoubtId(d) !== action.payload),
      };
    case ACTIONS.ADD_FOLLOW_UP:
      return {
        ...state,
        currentDoubt: state.currentDoubt
          ? {
              ...state.currentDoubt,
              followUps: [...(state.currentDoubt.followUps || []), action.payload],
            }
          : null,
        followUpLoading: false,
      };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, solving: false, loading: false, followUpLoading: false };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.CLEAR_CURRENT:
      return { ...state, currentDoubt: null, error: null };
    case ACTIONS.SET_FOLLOW_UP_LOADING:
      return { ...state, followUpLoading: action.payload };
    default:
      return state;
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const DoubtProvider = ({ children }) => {
  const [state, dispatch] = useReducer(doubtReducer, initialState);

  // Solve a doubt
  const solveDoubt = useCallback(async ({ questionText, image, eli5Mode, category }) => {
    dispatch({ type: ACTIONS.SET_SOLVING, payload: true });
    try {
      const result = await api.solveDoubt({ questionText, image, eli5Mode, category });
      if (result.success) {
        const doubt = normalizeDoubt(result.data);
        dispatch({ type: ACTIONS.SET_CURRENT_DOUBT, payload: doubt });
        dispatch({ type: ACTIONS.ADD_TO_HISTORY, payload: doubt });
        return doubt;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to solve doubt';
      dispatch({ type: ACTIONS.SET_ERROR, payload: message });
      throw error;
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async (params = {}) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await api.getHistory(params);
      if (result.success) {
        dispatch({
          type: ACTIONS.SET_HISTORY,
          payload: {
            ...result.data,
            doubts: (result.data?.doubts || []).map(normalizeDoubt),
          },
        });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load history' });
    }
  }, []);

  // Load a single doubt
  const loadDoubt = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await api.getDoubtById(id);
      if (result.success) {
        dispatch({ type: ACTIONS.SET_CURRENT_DOUBT, payload: normalizeDoubt(result.data) });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load doubt' });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Ask follow-up
  const askFollowUp = useCallback(async (doubtId, question) => {
    dispatch({ type: ACTIONS.SET_FOLLOW_UP_LOADING, payload: true });
    try {
      const result = await api.askFollowUp(doubtId, question);
      if (result.success) {
        dispatch({ type: ACTIONS.ADD_FOLLOW_UP, payload: result.data });
        return result.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get follow-up answer';
      dispatch({ type: ACTIONS.SET_ERROR, payload: message });
      throw error;
    }
  }, []);

  // Delete a doubt
  const removeDoubt = useCallback(async (id) => {
    try {
      await api.deleteDoubt(id);
      dispatch({ type: ACTIONS.REMOVE_FROM_HISTORY, payload: id });
      if (getDoubtId(state.currentDoubt) === id) {
        dispatch({ type: ACTIONS.CLEAR_CURRENT });
      }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to delete doubt' });
    }
  }, [state.currentDoubt]);

  // Clear current doubt
  const clearCurrent = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CURRENT });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    solveDoubt,
    fetchHistory,
    loadDoubt,
    askFollowUp,
    removeDoubt,
    clearCurrent,
    clearError,
  };

  return <DoubtContext.Provider value={value}>{children}</DoubtContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useDoubt = () => {
  const context = useContext(DoubtContext);
  if (!context) {
    throw new Error('useDoubt must be used within a DoubtProvider');
  }
  return context;
};

export default DoubtContext;
