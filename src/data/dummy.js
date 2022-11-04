import { RiMoneyEuroCircleFill } from "react-icons/ri";
import { FaSnowman } from "react-icons/fa";
import { MdPool } from "react-icons/md";
import { BsBriefcaseFill } from "react-icons/bs";

export const links = [
  {
    title: "Profile",
    links: [
      {
        name: "Portfolio",
        icon: <BsBriefcaseFill />,
      },
      {
        name: "Add Funds",
        icon: <RiMoneyEuroCircleFill />,
      },
    ],
  },
  {
    title: "Snow Finance",
    links: [
      {
        name: "Snowmen NFTs",
        icon: <FaSnowman />,
      },
      {
        name: "Liquidity Pool",
        icon: <MdPool />,
      },
    ],
  },
];
