import exerciseIcon from "../assets/exercise.svg";
import tennisIcon from "../assets/tennis.svg";
import joggingIcon from "../assets/jogging.svg";

function Item({ icon, name, frequency, unit }) {
  return (
    <div className="grow shrink basis-[calc(50%-0.625rem)] flex items-center justify-between bg-white rounded-3xl px-3 py-2.5 shadow-sm">
      <div className="flex items-center">
        <img className="text-sis-blue" src={icon} alt={name} />
        <span className="ml-1 flex-1 text-sm truncate">{name}</span>
      </div>
      <span className="self-end text-lg leading-5 text-sis-blue">{frequency}<span className="text-sm ml-1">{unit}</span></span>
    </div>
  );
}

export default function ExercisePanel({}) {
  return (
    <>
      <div className="flex items-center justify-between bg-sis-white-50 rounded-3xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full bg-gradient-to-br from-sis-blue to-sis-blue-420">
            <img src={exerciseIcon} alt="exercise" />
          </div>
          <span className="text-sm text-sis-purple truncate">High intensity exercise</span>
        </div>
        <span className="text-sis-blue">120<span className="text-sm ml-1">min</span></span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2.5">
        <Item
          icon={tennisIcon}
          name={"网球"}
          frequency={"90"}
          unit={"min"}
        />
        <Item
          icon={joggingIcon}
          name={"跑步"}
          frequency={"30"}
          unit={"min"}
        />

        <Item
          icon={joggingIcon}
          name={"跑步"}
          frequency={"30"}
          unit={"min"}
        />
      </div>
    </>
  );
}
