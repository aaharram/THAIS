import { AppLogo } from '@/components/brand/AppLogo';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className='flex items-center justify-center h-96'>
      <motion.div
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <AppLogo className='w-32 h-32' />
      </motion.div>
    </div>
  );
};

export default Loading;
