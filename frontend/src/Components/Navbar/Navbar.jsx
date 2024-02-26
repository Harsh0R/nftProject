import React, { useState } from "react";
import Style from "./Navbar.module.css";
import { Link } from "react-router-dom";
const Navbar = () => {
  const menuItems = [
    { menu: "Home", link: "/" },
    { menu: "About", link: "/" },
    { menu: "My Account", link: "/myAccount" },
    { menu: "Setting", link: "/" },
    { menu: "FAQs", link: "/" },
    { menu: "Terms of Use", link: "/" },
  ];
  const [active, setActive] = useState(1);
  return (
    <div className={Style.navbar}>
      <div className={Style.listitem}>
        {menuItems.map((el, i) => (
          <li
            key={i}
            className={`${Style.navbarItem} ${
              active === i + 1 ? Style.activeItem : ""
            }`}
          >
            <Link to={el.link} onClick={() => setActive(i + 1)}>
              {el.menu}
            </Link>
          </li>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
