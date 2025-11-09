import { useState } from "react";
import plants from "../assets/images/peach_pill_with_plants.svg";
import happy from "../assets/images/icon_happy.svg";
import sad from "../assets/images/icon_sad.svg";
import heart from "../assets/images/icon_heart.svg";
import backdrop from "../assets/images/peach_pill_with_plants_backdrop.png";
import plantAnimation from "../assets/images/peach_pill_with_plants.gif";


export function HomePageImages() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        className="relative w-[300px] md:w-[400px] h-[235px] md:h-[314px] cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={backdrop}
          alt="plants backdrop"
          className={`absolute top-0  w-[300px] md:w-[400px] transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <img
          src={plantAnimation}
          alt="plant animation"
          className={`absolute top-5  w-[300px] md:w-[400px] transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <img
          src={plants}
          alt="static plants"
          className={`absolute top-0 w-[400px] transition-opacity duration-500 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      <div className="flex items-center justify-center">
         <img className="w-[75px] md:w-[130px] transition-transform duration-300 hover:scale-110" src={happy} alt="happyface"/>
        <img src={heart} alt="" className="w-[75px] md:w-[130px] transition-transform duration-300 hover:scale-110" />
        <img src={sad} alt="" className="w-[75px] md:w-[130px] transition-transform duration-300 hover:scale-110" />
      </div>
    </>
  );
}


