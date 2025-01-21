import meditationIcon from "../assets/meditation.svg";
import sleepIcon from "../assets/sleep.svg";
import homeCookedIcon from "../assets/home-cooked.svg";

const iconMap = {
  "sleep": sleepIcon,
  "睡眠": sleepIcon,

  "home cooked meals": homeCookedIcon,
  "在家吃饭": homeCookedIcon,

  "meditation": meditationIcon,
  "冥想": meditationIcon,
};

function Item({ icon, name, frequency, unit }) {
  return (
    <div className="flex items-center justify-between bg-sis-white-50 rounded-3xl px-3 py-1.5 shadow-sm">
      <div className="flex items-center">
        <div className="p-1 mr-2.5 rounded-full bg-gradient-to-br from-sis-blue to-sis-blue-420">
          <img src={icon} alt={name} sizes={20} />
        </div>
        <span className="text-sm truncate">{name}</span>
      </div>
      <span className="text-lg leading-5 text-sis-blue">{frequency}<span className="text-sm ml-1">{unit}</span></span>
    </div>
  );
}

export default function LifeStylePanel({ data }) {
  let itemData = data ? data : [
    {
      name: "Sleep",
      frequency: "7",
      unit: "hours per day",
    },
    {
      name: "Home cooked meals",
      frequency: "3",
      unit: "times",
    }];

  return (
    <div className="flex flex-col gap-2.5 mt-2.5">
      {
        itemData.map((item, index) =>
          (
            <Item key={index}
                  icon={iconMap[item.name.toLowerCase()] || meditationIcon}
                  name={item.name}
                  frequency={item.frequency}
                  unit={item.unit}
            />
          ),
        )
      }
    </div>
  );
}
