import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

// Use this custom hook instead of useDispatch throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();

