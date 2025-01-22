import exerciseIcon from "../assets/exercise.svg";
import exerciseBlueIcon from "../assets/exercise-blue.svg";
import tennisIcon from "../assets/tennis.svg";
import joggingIcon from "../assets/jogging.svg";

const iconMap = {
  "网球": tennisIcon,
  "tennis": tennisIcon,

  "跑步": joggingIcon,
  "jogging": joggingIcon,
};

function Item({ icon, name, totalVolume, unit }) {
  return (
    <div
      className="grow shrink basis-[calc(50%-0.625rem)] flex items-center justify-between bg-white rounded-3xl px-3 py-2.5 shadow-sm">
      <div className="flex items-center">
        <img className="text-sis-blue" src={icon} alt={name} />
        <span className="ml-1 flex-1 text-sm truncate">{name}</span>
      </div>
      <span className="self-end text-lg leading-5 text-sis-blue">{totalVolume}<span
        className="text-sm ml-1">{unit}</span></span>
    </div>
  );
}

export default function ExercisePanel({ data }) {

  let formatedData = data;
  if (data && !Array.isArray(data)) {
    formatedData = Object.keys(data).map(key => {
      return {
        name: key,
        frequency: data[key].frequency.toString(),
        duration: data[key].duration.toString(),
        unit: "min",
      };
    });
  }

  let totalFrequency = 0;
  if (formatedData && formatedData.length > 0) {
    totalFrequency = formatedData.reduce((sum, item) => {
      return sum + (parseInt(item.frequency, 10) * parseInt(item.duration, 10));
    }, 0);
  }


  return (
    <>
      {data ? (<>
        <div className="flex items-center justify-between bg-sis-white-50 rounded-3xl p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-gradient-to-br from-sis-blue to-sis-blue-420">
              <img src={exerciseIcon} alt="exercise" />
            </div>
            <span className="text-sm text-sis-purple truncate">High intensity exercise</span>
          </div>
          <span className="text-sis-blue">{totalFrequency}<span className="text-sm ml-1">min</span></span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2.5">
          {
            formatedData.map((item, index) =>
              (
                <Item key={index}
                      icon={iconMap[item.name.toLowerCase()] || exerciseBlueIcon}
                      name={item.name}
                      totalVolume={(parseInt(item.frequency, 10) * parseInt(item.duration, 10))}
                      unit={item.unit || "min"}
                />
              ),
            )
          }
        </div>
      </>) : <div className="h-20 bg-sis-white-50 rounded-3xl p-3 shadow-sm"/>}
    </>
  );
}
