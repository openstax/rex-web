import { ReactTestInstance } from 'react-test-renderer';

export const setStateFinished = (testInstance: ReactTestInstance) => new Promise((resolve) => {
  testInstance.instance.setState({}, resolve);
});
