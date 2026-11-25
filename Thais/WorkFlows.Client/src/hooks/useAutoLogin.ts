import { AppDispatch } from '@/store';
import { getRememberMePreference, getToken } from '@/store/services/tokenService';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToastOpen } from '../store/features/toast/toastSlice';

export const useAutoLogin = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const rememberMe = await getRememberMePreference();
        if (rememberMe) {
          const authData = await getToken('auth');
          if (authData) {
            const token = (await getToken('token')) || (await getToken('jwt'));
            if (token) {
              dispatch({ type: 'auth/autoLogin', payload: { token, authData } });
            }
          }
        }
      } catch (error) {
        dispatch(
          setToastOpen({
            isOpen: true,
            error: `Auto-login failed: ${error}`,
          }),
        );
      }
    };

    checkAutoLogin();
  }, [dispatch]);
};
