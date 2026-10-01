const GRADIENT_ID = 'ltcWwbIconGradient';

export function WhatWeBuiltIconDefs() {
  return (
    <svg width='0' height='0' aria-hidden='true' focusable='false'>
      <defs>
        <linearGradient
          id={GRADIENT_ID}
          x1='32.3333'
          y1='38'
          x2='5'
          y2='2.66667'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='var(--color-brand-dark)' />
          <stop offset='1' stopColor='var(--color-brand)' />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FILL = `url(#${GRADIENT_ID})`;
const STROKE = 'var(--color-bg)';

function Glyph({ children }) {
  return (
    <svg
      className='what-we-built__icon'
      width='40'
      height='40'
      viewBox='0 0 40 40'
      fill='none'
      aria-hidden='true'
      focusable='false'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='20' cy='20' r='20' fill={FILL} />
      {children}
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <Glyph>
      <circle
        cx='20.1695'
        cy='19.889'
        r='11.4583'
        stroke={STROKE}
        strokeWidth='1.52778'
      />
      <path
        d='M20.167 8.43042C20.5029 8.43042 20.9149 8.60915 21.3799 9.13354C21.8441 9.65717 22.2975 10.4587 22.6934 11.5144C23.4831 13.6203 23.9863 16.5817 23.9863 19.8894C23.9863 23.197 23.483 26.1576 22.6934 28.2634C22.2975 29.3192 21.8441 30.1206 21.3799 30.6443C20.9149 31.1687 20.5029 31.3474 20.167 31.3474C19.8312 31.3473 19.4199 31.1684 18.9551 30.6443C18.4908 30.1207 18.0375 29.3191 17.6416 28.2634C16.8519 26.1576 16.3477 23.197 16.3477 19.8894C16.3477 16.5817 16.8519 13.6203 17.6416 11.5144C18.0375 10.4588 18.4908 9.65716 18.9551 9.13354C19.4199 8.60944 19.8312 8.43054 20.167 8.43042Z'
        stroke={STROKE}
        strokeWidth='1.52778'
      />
      <path
        d='M8.71094 19.8887H31.6276'
        stroke={STROKE}
        strokeWidth='1.52778'
        strokeLinecap='round'
      />
    </Glyph>
  );
}

function BoltGlyph() {
  return (
    <Glyph>
      <path
        d='M19.6279 8.28052L19.7451 8.302L19.8584 8.33911C20.1084 8.4393 20.259 8.6351 20.3408 8.80786C20.4249 8.98544 20.4599 9.18028 20.4785 9.34106C20.5162 9.66621 20.5146 10.1173 20.5146 10.634V16.5989H23.4336C24.426 16.5989 25.2483 16.5968 25.8672 16.6887C26.4941 16.7818 27.103 16.9973 27.458 17.592C27.8128 18.1866 27.7135 18.8243 27.498 19.4202C27.2852 20.0085 26.8929 20.7321 26.4219 21.6057L21.71 30.344C21.4647 30.7989 21.251 31.1968 21.0635 31.4651C20.9708 31.5977 20.8485 31.7531 20.6904 31.8694C20.5144 31.9988 20.2445 32.1119 19.9258 32.0315C19.6071 31.951 19.4235 31.7231 19.3301 31.5256C19.2461 31.3481 19.212 31.1532 19.1934 30.9924C19.1556 30.6673 19.1562 30.2162 19.1562 29.6995V23.7346H16.2373C15.245 23.7346 14.4225 23.7367 13.8037 23.6448C13.1769 23.5516 12.5688 23.3361 12.2139 22.7415C11.8589 22.1467 11.9583 21.5093 12.1738 20.9133C12.3866 20.3251 12.7781 19.6021 13.249 18.7288L17.9609 9.9895C18.2062 9.53457 18.4199 9.13674 18.6074 8.86841C18.7001 8.73581 18.8233 8.58041 18.9814 8.46411C19.1354 8.35106 19.3608 8.25027 19.6279 8.28052Z'
        stroke={STROKE}
        strokeWidth='1.35802'
      />
    </Glyph>
  );
}

function LinkGlyph() {
  return (
    <Glyph>
      <path
        d='M22.9333 17.263L17.1816 23.0146'
        stroke={STROKE}
        strokeWidth='1.43791'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M25.8098 21.5769L28.6856 18.7011C30.6709 16.7157 30.6709 13.4969 28.6856 11.5115C26.7003 9.52618 23.4814 9.52618 21.4961 11.5115L18.6203 14.3873M14.3065 18.7011L11.4307 21.5769C9.44537 23.5622 9.44537 26.7811 11.4307 28.7664C13.416 30.7518 16.6349 30.7518 18.6203 28.7664L21.4961 25.8906'
        stroke={STROKE}
        strokeWidth='1.43791'
        strokeLinecap='round'
      />
    </Glyph>
  );
}

function CheckGlyph() {
  return (
    <Glyph>
      <path
        d='M13.9463 12.2781H23.7246C26.0869 12.2783 28.0018 14.1931 28.002 16.5554V26.3337C28.0018 27.346 27.1812 28.1666 26.1689 28.1667H13.9463C12.9339 28.1667 12.1135 27.3461 12.1133 26.3337V14.1111C12.1133 13.0986 12.9339 12.2781 13.9463 12.2781Z'
        stroke={STROKE}
        strokeWidth='1.22222'
      />
      <path d='M16.3906 12.8891V8.00024' stroke={STROKE} strokeWidth='1.22222' />
      <path d='M16.3906 32.4448V27.5559' stroke={STROKE} strokeWidth='1.22222' />
      <path d='M23.7227 32.4448V27.5559' stroke={STROKE} strokeWidth='1.22222' />
      <path d='M32.2776 23.8892L27.3887 23.8892' stroke={STROKE} strokeWidth='1.22222' />
      <path d='M12.7248 23.8892L7.83594 23.8892' stroke={STROKE} strokeWidth='1.22222' />
      <path d='M12.7248 16.5559L7.83594 16.5559' stroke={STROKE} strokeWidth='1.22222' />
      <path
        d='M23.7227 9.22241C26.0006 9.22241 27.1396 9.22241 28.038 9.59456C29.2359 10.0907 30.1877 11.0425 30.6838 12.2404C31.056 13.1388 31.056 14.2778 31.056 16.5557'
        stroke={STROKE}
        strokeWidth='1.22222'
      />
    </Glyph>
  );
}

function FallbackGlyph() {
  return (
    <Glyph>
      <circle
        cx='20'
        cy='20'
        r='6'
        stroke={STROKE}
        strokeWidth='1.5'
      />
    </Glyph>
  );
}

const GLYPHS = {
  globe: GlobeGlyph,
  bolt: BoltGlyph,
  link: LinkGlyph,
  check: CheckGlyph,
};

export function iconKeyFromUrl(url) {
  const file = (url ?? '').split('?')[0].split('/').pop() ?? '';

  return file
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/_circle$/, '');
}

export function WhatWeBuiltIcon({ iconKey }) {
  const GlyphComponent = GLYPHS[iconKey] ?? FallbackGlyph;

  return <GlyphComponent />;
}
