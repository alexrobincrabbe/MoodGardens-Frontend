import plants from "../assets/images/peach_pill_with_plants.svg";
import happy from "../assets/images/icon_happy.svg";
import sad from "../assets/images/icon_sad.svg";
import heart from "../assets/images/icon_heart.svg";

export function HomePageImages() {
  return (
    <>
      <img src={plants} alt="images of plants" className="w-[400px]" />
      <div className="flex items-center justify-center">
        <img src={happy} alt="" className="w-[75px] md:w-[130px]" />
        <img src={heart} alt="" className="w-[75px] md:w-[130px]" />
        <img src={sad} alt="" className="w-[75px] md:w-[130px]" />
      </div>
    </>
  );
}
