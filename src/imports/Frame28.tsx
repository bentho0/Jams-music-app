import svgPaths from "./svg-1g33f6c7um";

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Host_Grotesk:SemiBold',sans-serif] leading-[1.2] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[-0.24px]">Connect your Spotify account</p>
      <p className="font-['Manrope:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#dedede] text-[14px] w-[364px] whitespace-pre-wrap">To create playlists you’ll actually love, we need access to your Spotify music library and listening preferences.</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <p className="font-['Host_Grotesk:SemiBold',sans-serif] leading-[1.2] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[-0.18px]">What we’ll access</p>
      <ul className="block font-['Manrope:Regular',sans-serif] font-normal leading-[0] list-disc relative shrink-0 text-[#dedede] text-[14px] w-[376px] whitespace-pre-wrap">
        <li className="mb-0 ms-[21px]">
          <span className="leading-[1.8]">Your saved tracks and playlists</span>
        </li>
        <li className="mb-0 ms-[21px]">
          <span className="leading-[1.8]">Your listening preferences</span>
        </li>
        <li className="ms-[21px]">
          <span className="leading-[1.8]">{`Basic profile info (name & avatar)`}</span>
        </li>
      </ul>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function MdiSpotify() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="mdi:spotify">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="mdi:spotify">
          <path d={svgPaths.p36181f00} fill="var(--fill-0, #0A0B0D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <div className="bg-[#4feec5] relative rounded-[8px] shrink-0 w-full">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center px-[20px] py-[12px] relative w-full">
            <MdiSpotify />
            <p className="font-['Manrope:SemiBold',sans-serif] font-semibold leading-[1.3] relative shrink-0 text-[#0a0b0d] text-[14px] text-center tracking-[-0.14px]">Connect your spotify</p>
          </div>
        </div>
      </div>
      <p className="font-['Manrope:Regular',sans-serif] font-normal leading-[1.3] relative shrink-0 text-[#dedede] text-[12px] text-center">You stay in control. You can disconnect anytime from settings.</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-[#15171a] relative rounded-[12px] size-full">
      <div className="content-stretch flex flex-col gap-[44px] items-center overflow-clip pb-[40px] pt-[32px] px-[54px] relative rounded-[inherit] size-full">
        <Frame3 />
        <Frame4 />
      </div>
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(44,44,44,0.3)] border-solid inset-[-0.25px] pointer-events-none rounded-[12.25px]" />
    </div>
  );
}