import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../store';

// Use this custom hook instead of useSelector throughout the app
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

