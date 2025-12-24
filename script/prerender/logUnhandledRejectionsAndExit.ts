
import process from 'process';

// When imported, this can be used in place of explicit try-catch or catch()
// for all otherwise uncaught errors on async functions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
