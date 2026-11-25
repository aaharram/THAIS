import { Middleware } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { clearToast, setToastOpen } from '../features/toast/toastSlice';

const toastMiddleware: Middleware = () => (next) => (action) => {
  if (setToastOpen.match(action)) {
    const { message, warning, error } = action.payload;

    if (message) {
      toast.success(message);
    } else if (warning) {
      toast((t) => (
        <div>
          <strong>Warning:</strong> {warning}
          <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
        </div>
      ));
    } else if (error) {
      toast.error(error);
    }
  }

  if (clearToast.match(action)) {
    toast.dismiss();
  }

  return next(action);
};

export default toastMiddleware;
