import meditationIcon from "../assets/meditation.svg";
import sleepIcon from "../assets/sleep.svg";
import homeCookedIcon from "../assets/home-cooked.svg";

function Item({ icon, name, frequency, unit }) {
  return (
    <div className="flex items-center justify-between bg-[#FFFFFFD9] rounded-3xl px-3 py-1.5 shadow-sm">
      <div className="flex items-center">
        <div className="p-1 mr-2.5 rounded-full bg-gradient-to-br from-sis-blue to-sis-blue-420">
          <img src={icon} alt={name} sizes={20} />
        </div>
        <span>{name}</span>
      </div>
      <span className="text-sis-blue">{frequency}<span className="text-sm ml-1">{unit}</span></span>
    </div>
  );
}

export default function LifeStylePanel() {
  return (
    <div className="flex flex-col gap-2.5 mt-2.5">
      <Item
        icon={meditationIcon}
        name="Meditation"
        frequency={30}
        unit="min per day"
      />

      <Item
        icon={sleepIcon}
        name="Sleep"
        frequency={7}
        unit="hours per day"
      />

      <Item
        icon={homeCookedIcon}
        name="Home cooked meals"
        frequency={3}
        unit="times"
      />
    </div>
  );
}
