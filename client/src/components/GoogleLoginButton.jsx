import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import API from '../store/authStore';

const GoogleLoginButton = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send token to backend
        const { data } = await API.post('/auth/google', { token: tokenResponse.access_token });
        useAuthStore.getState().setUser(data);
        toast.success('Google login successful');
        window.location.href = '/dashboard';
      } catch (err) {
        toast.error('Google login failed');
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  return (
    <button
      onClick={() => login()}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition"
    >
      <FcGoogle className="w-5 h-5" />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;