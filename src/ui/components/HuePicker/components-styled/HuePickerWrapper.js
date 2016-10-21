import styled from 'styled-components';
import COLOR_PICKER_GRADIENT from '../../../utils/styles';

export default styled.div`
  ${COLOR_PICKER_GRADIENT}
  background-image: linear-gradient(
    90deg,
    hsl(0, 100%, 50%) 0%,
    hsl(60, 100%, 50%) 17%,
    hsl(120, 100%, 50%) 33%,
    hsl(180, 100%, 50%) 50%,
    hsl(240, 100%, 50%) 67%,
    hsl(300, 100%, 50%) 83%,
    hsl(360, 100%, 50%) 100%
  );
`;
