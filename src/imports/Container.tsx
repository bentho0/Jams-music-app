function Frame2() {
  return (
    <div className="flex-[1_0_0] h-[12px] min-h-px min-w-px relative">
      <div className="absolute inset-[-8.33%_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 13">
          <g id="Frame 35">
            <line id="Line 1" stroke="var(--stroke-0, #687382)" strokeLinecap="round" x1="0.5" x2="83.5" y1="0.5" y2="0.5" />
            <line id="Line 2" stroke="var(--stroke-0, #687382)" strokeLinecap="round" x1="0.5" x2="83.5" y1="6.5" y2="6.5" />
            <line id="Line 3" stroke="var(--stroke-0, #687382)" strokeLinecap="round" x1="0.5" x2="83.5" y1="12.5" y2="12.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="flex-[1_0_0] h-[12px] min-h-px min-w-px relative">
      <div className="absolute inset-[-8.33%_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 13">
          <g id="Frame 35">
            <line id="Line 1" stroke="var(--stroke-0, #687382)" strokeLinecap="round" x1="0.5" x2="83.5" y1="0.5" y2="0.5" />
            <line id="Line 2" stroke="var(--stroke-0, #687382)" strokeLinecap="round" x1="0.5" x2="83.5" y1="6.5" y2="6.5" />
            <line id="Line 3" stroke="var(--stroke-0, #687382)" strokeLinecap="round" x1="0.5" x2="83.5" y1="12.5" y2="12.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#2a2e34] h-[138px] relative rounded-[12px] shrink-0 w-[136px]" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[6px] relative rounded-[inherit] size-full">
        <div className="absolute flex h-[51.757px] items-center justify-center left-[-87.14px] top-[45.46px] w-[127.083px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "42" } as React.CSSProperties}>
          <div className="flex-none rotate-[-11.3deg]">
            <div className="bg-[#3e454e] content-stretch flex gap-[8px] items-center px-[6px] py-[4px] relative rounded-[6px] w-[124px]" data-name="Block">
              <div aria-hidden="true" className="absolute border-[#535c68] border-[0.5px] border-solid inset-[-0.25px] pointer-events-none rounded-[6.25px]" />
              <div className="relative shrink-0 size-[20px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" fill="var(--fill-0, #687382)" id="Ellipse 3" r="10" />
                </svg>
              </div>
              <Frame2 />
            </div>
          </div>
        </div>
        <div className="bg-[#3e454e] relative rounded-[6px] shrink-0 w-full" data-name="block">
          <div aria-hidden="true" className="absolute border-[#535c68] border-[0.5px] border-solid inset-[-0.25px] pointer-events-none rounded-[6.25px]" />
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[8px] items-center px-[6px] py-[4px] relative w-full">
              <div className="relative shrink-0 size-[20px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" fill="var(--fill-0, #687382)" id="Ellipse 3" r="10" />
                </svg>
              </div>
              <Frame3 />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#535c68] border-[0.5px] border-solid inset-[-0.25px] pointer-events-none rounded-[12.25px]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0">
      <p className="font-['Host_Grotesk:SemiBold',sans-serif] leading-[1.2] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[-0.18px]">Generating playlist...</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#15171a] relative rounded-[12px] size-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[20px] items-center overflow-clip pb-[24px] pt-[20px] px-[54px] relative rounded-[inherit] size-full">
        <Frame />
        <div className="absolute h-[44px] left-[105px] top-[130px] w-[261px]">
          <div className="absolute inset-[-40.91%_-6.9%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 297 80">
              <g filter="url(#filter0_f_71_637)" id="Ellipse 4">
                <ellipse cx="148.5" cy="40" fill="var(--fill-0, #15171A)" rx="130.5" ry="22" />
              </g>
              <defs>
                <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="80" id="filter0_f_71_637" width="297" x="0" y="0">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                  <feGaussianBlur result="effect1_foregroundBlur_71_637" stdDeviation="9" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
        <Frame1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#2c2c2c] border-[0.5px] border-solid inset-[-0.25px] pointer-events-none rounded-[12.25px]" />
    </div>
  );
}