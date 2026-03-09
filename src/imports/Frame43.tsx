import svgPaths from "./svg-qalc8lurnt";

function MdiSpotify() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="mdi:spotify">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="mdi:spotify">
          <path d={svgPaths.p1ec93e00} fill="var(--fill-0, #22CC00)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0">
      <p className="font-['Host_Grotesk:SemiBold',sans-serif] leading-[1.2] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[-0.24px]">Connecting Spotify...</p>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="bg-gradient-to-t from-[#15171a] from-[0.331%] relative rounded-[12px] size-full to-[#113f33] to-[174.17%]">
      <div className="content-stretch flex flex-col gap-[20px] items-center overflow-clip pb-[24px] pt-[20px] px-[54px] relative rounded-[inherit] size-full">
        <MdiSpotify />
        <Frame />
      </div>
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(44,44,44,0.3)] border-solid inset-[-0.25px] pointer-events-none rounded-[12.25px]" />
    </div>
  );
}