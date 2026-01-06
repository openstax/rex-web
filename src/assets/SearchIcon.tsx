import React from 'react';
import { useIntl } from 'react-intl';

const SvgComponent = () => {
  const intl = useIntl();

  return (
    <svg width='18px' height='18px' viewBox='0 0 18 18' version='1.1' aria-hidden='true' role='img'>
      <title>{intl.formatMessage({ id: 'i18n:search-results:bar:search-icon:value' })}</title>
      <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
        <g transform='translate(-938.000000, -206.000000)' fill='currentColor' fillRule='nonzero'>
          <path d='M945,206 C948.865993,206 952,209.134007 952,213 C952,214.662837 951.420201,216.190255 950.45174,217.391118 L955.03033,221.96967 C955.323223,222.262563 955.323223,222.737437 955.03033,223.03033 C954.764064,223.296597 954.3474,223.320803 954.053788,223.102948 L953.96967,223.03033 L949.391118,218.45174 C948.190255,219.420201 946.662837,220 945,220 C941.134007,220 938,216.865993 938,213 C938,209.134007 941.134007,206 945,206 Z M945,207.5 C941.962434,207.5 939.5,209.962434 939.5,213 C939.5,216.037566 941.962434,218.5 945,218.5 C948.037566,218.5 950.5,216.037566 950.5,213 C950.5,209.962434 948.037566,207.5 945,207.5 Z'></path>
        </g>
      </g>
    </svg>
  );
};
export default SvgComponent;
