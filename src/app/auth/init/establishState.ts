import { Initializer } from '../../types';

const initializer: Initializer = () => {
  if (typeof(document) === 'undefined') {
    return;
  }

  console.log('asdf');
};

export default initializer;
